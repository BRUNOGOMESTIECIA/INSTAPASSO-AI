import { logCrudAudit } from './audit-logger';

/**
 * 🔀 Item 042 / 141: Transferência de Chat entre N1 e N2 com Notas Confidenciais
 * 
 * Módulo de transbordo de atendimento com passagem de bastão (Handoff Note).
 */

export type TransferTargetType = 'DEPARTMENT' | 'AGENT';

export interface TransferTargetOption {
  id: string;
  name: string;
  type: TransferTargetType;
  roleBadge?: string;
  onlineStatus?: 'ONLINE' | 'BUSY' | 'OFFLINE';
}

export interface HandoffNote {
  id: string;
  chatId: string;
  targetType: TransferTargetType;
  targetId: string;
  targetName: string;
  targetRoleBadge?: string;
  noteText: string;
  transferredBy: string;
  createdAt: string;
}

const STORAGE_KEY = 'portal_chat_handoff_notes';

/**
 * Lista de destinos para o menu de transferência (baseado no layout da imagem do usuário)
 */
export function getTransferTargetOptions(): {
  departments: TransferTargetOption[];
  agents: TransferTargetOption[];
} {
  return {
    departments: [
      { id: 'dept_comercial', name: 'Comercial', type: 'DEPARTMENT' },
      { id: 'dept_logistica', name: 'Logística', type: 'DEPARTMENT' },
      { id: 'dept_suporte_n2', name: 'Suporte N2', type: 'DEPARTMENT' },
      { id: 'dept_infraestrutura', name: 'Infraestrutura & Cloud', type: 'DEPARTMENT' },
    ],
    agents: [
      { id: 'op_bruno', name: 'Bruno Gomes', type: 'AGENT', roleBadge: 'Super Administrador', onlineStatus: 'ONLINE' },
      { id: 'op_lasmar', name: 'Lasmar', type: 'AGENT', roleBadge: 'Super Administrador', onlineStatus: 'BUSY' },
      { id: 'op_aron', name: 'Aron', type: 'AGENT', roleBadge: 'Administrador', onlineStatus: 'BUSY' },
      { id: 'op_felipe_amaral', name: 'Felipe Amaral', type: 'AGENT', roleBadge: 'N1', onlineStatus: 'BUSY' },
      { id: 'op_felipe_oliveira', name: 'Felipe Oliveira', type: 'AGENT', roleBadge: 'N2', onlineStatus: 'BUSY' },
      { id: 'op_nicolas', name: 'Nicolas', type: 'AGENT', roleBadge: 'INFRAESTRUTURA', onlineStatus: 'BUSY' },
    ],
  };
}

/**
 * Obtém as notas confidenciais de passagem registradas para um chat específico
 */
export function getHandoffNotesForChat(chatId: string): HandoffNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: HandoffNote[] = JSON.parse(raw);
      return all.filter((n) => n.chatId === chatId);
    }
  } catch (e) {
    // Fallback
  }
  return [];
}

/**
 * Registra a transferência de chat e salva a nota confidencial de passagem
 */
export async function createHandoffTransfer(
  chatId: string,
  targetType: TransferTargetType,
  targetId: string,
  targetName: string,
  targetRoleBadge: string | undefined,
  noteText: string,
  transferredBy: string = 'Atendente Operacional N1'
): Promise<HandoffNote> {
  const newNote: HandoffNote = {
    id: `handoff_${Date.now()}`,
    chatId,
    targetType,
    targetId,
    targetName,
    targetRoleBadge,
    noteText,
    transferredBy,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: HandoffNote[] = raw ? JSON.parse(raw) : [];
    all.push(newNote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('[ChatTransfer] Erro ao salvar nota confidencial:', e);
  }

  // Audit Log ISO 27001
  await logCrudAudit('CREATE', 'chat_handoff_transfers', newNote.id, JSON.stringify({
    action: 'CHAT_LIVE_TRANSFER_HANDOFF',
    chatId,
    targetType,
    targetName,
    targetRoleBadge,
    transferredBy,
    noteTextSnippet: noteText.substring(0, 100),
  }));

  return newNote;
}
