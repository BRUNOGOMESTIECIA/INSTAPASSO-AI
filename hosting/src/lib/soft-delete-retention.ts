import { logCrudAudit } from './audit-logger';

/**
 * 🗑️ Item 031: Soft Delete com Retenção Histórica
 * 
 * Exclusão lógica de contas com bloqueio imediato de login e preservação
 * total da trilha de auditoria e relatórios históricos (ISO 27001 / LGPD).
 */

export interface SoftDeleteUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string;
  status: 'ACTIVE' | 'SOFT_DELETED';
  isSoftDeleted: boolean;
  deletedAt?: string;
  deletedReason?: string;
  deletedBy?: string;
  historicalTicketsCount: number;
  historicalCsatAverage: number;
}

const STORAGE_KEY = 'portal_soft_deleted_users_list';

/**
 * Retorna os usuários cadastrados e seu status de Soft Delete
 */
export function getUsersWithSoftDelete(): SoftDeleteUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return getInitialMockUsers();
}

/**
 * Mocks iniciais com usuários ativos e 1 conta desativada via Soft Delete
 */
function getInitialMockUsers(): SoftDeleteUser[] {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 'op_bruno_gomes',
      name: 'Bruno Gomes',
      email: 'bg@tiecia.com.br',
      role: 'Super Administrador',
      companyName: 'TI&CIA Tecnologia',
      status: 'ACTIVE',
      isSoftDeleted: false,
      historicalTicketsCount: 48,
      historicalCsatAverage: 4.9,
    },
    {
      id: 'op_ana_silva',
      name: 'Ana Silva (Suporte N2)',
      email: 'ana.silva@empresa.com.br',
      role: 'Analista de Suporte N2',
      companyName: 'TI&CIA Tecnologia',
      status: 'ACTIVE',
      isSoftDeleted: false,
      historicalTicketsCount: 36,
      historicalCsatAverage: 4.8,
    },
    {
      id: 'op_ex_marcos_lima',
      name: 'Marcos Lima (Ex-Atendente N1)',
      email: 'marcos.lima.ex@empresa.com.br',
      role: 'Analista N1 (Inativo)',
      companyName: 'TI&CIA Tecnologia',
      status: 'SOFT_DELETED',
      isSoftDeleted: true,
      deletedAt: '2026-07-15T10:30:00.000Z',
      deletedReason: 'Desligamento corporativo a pedido do departamento de RH',
      deletedBy: 'Bruno Gomes (Super Admin)',
      historicalTicketsCount: 142,
      historicalCsatAverage: 4.7,
    },
    {
      id: 'client_carlos_mendes',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@clienteb2b.com.br',
      role: 'Cliente VIP Solicitante',
      companyName: 'TechCorp Soluções B2B',
      status: 'ACTIVE',
      isSoftDeleted: false,
      historicalTicketsCount: 19,
      historicalCsatAverage: 5.0,
    },
  ];
}

/**
 * Salva a lista no armazenamento local
 */
export function saveUsersWithSoftDelete(list: SoftDeleteUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[SoftDelete] Erro ao salvar lista:', e);
  }
}

/**
 * Executa o Soft Delete de uma conta com justificativa obrigatória
 */
export async function performSoftDelete(
  userId: string, 
  reason: string, 
  adminName: string = 'Administrador do Sistema'
): Promise<SoftDeleteUser | null> {
  const list = getUsersWithSoftDelete();
  const index = list.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const target = list[index];
  target.status = 'SOFT_DELETED';
  target.isSoftDeleted = true;
  target.deletedAt = new Date().toISOString();
  target.deletedReason = reason || 'Desativação efetuada via painel de governança';
  target.deletedBy = adminName;

  list[index] = target;
  saveUsersWithSoftDelete(list);

  // Registra em auditoria imutável ISO 27001
  await logCrudAudit('DELETE', 'users_soft_delete', userId, JSON.stringify({
    action: 'SOFT_DELETE_USER_ACCOUNT',
    userEmail: target.email,
    userName: target.name,
    reason: target.deletedReason,
    deletedBy: adminName,
    historicalTicketsPreserved: target.historicalTicketsCount,
  }));

  return target;
}

/**
 * Restaura uma conta previamente desativada via Soft Delete
 */
export async function restoreSoftDeletedUser(
  userId: string, 
  adminName: string = 'Administrador do Sistema'
): Promise<SoftDeleteUser | null> {
  const list = getUsersWithSoftDelete();
  const index = list.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const target = list[index];
  target.status = 'ACTIVE';
  target.isSoftDeleted = false;
  delete target.deletedAt;
  delete target.deletedReason;
  delete target.deletedBy;

  list[index] = target;
  saveUsersWithSoftDelete(list);

  await logCrudAudit('UPDATE', 'users_soft_delete', userId, JSON.stringify({
    action: 'RESTORE_SOFT_DELETED_USER',
    userEmail: target.email,
    userName: target.name,
    restoredBy: adminName,
  }));

  return target;
}

/**
 * Métricas consolidadas de retenção histórica
 */
export function getSoftDeleteMetrics() {
  const list = getUsersWithSoftDelete();
  const activeCount = list.filter((u) => !u.isSoftDeleted).length;
  const softDeletedCount = list.filter((u) => u.isSoftDeleted).length;
  const preservedTicketsTotal = list.reduce((sum, u) => sum + u.historicalTicketsCount, 0);

  return {
    activeUsersCount: activeCount,
    softDeletedUsersCount: softDeletedCount,
    totalPreservedTickets: preservedTicketsTotal,
    historicalRetentionPercent: 100, // 100% de retenção histórica de dados
  };
}
