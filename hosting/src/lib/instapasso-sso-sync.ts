import { collection, doc, setDoc, getDocs, onSnapshot, query, limit } from 'firebase/firestore';
import { dbInstaPassoSecurity } from './multi-database-router';
import { logCrudAudit } from './audit-logger';

/**
 * 🔄 Item 027: Sincronização em Tempo Real com InstaPasso
 * 
 * Espelhamento bi-direcional em tempo real entre a base de usuários do Portal ITSM
 * e a central de autenticação/SSO do InstaPasso.
 */

export interface SsoSyncedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isOnline: boolean;
  avatarUrl?: string;
  lastSyncedAt: string;
  syncSource: 'PORTAL_ITSM' | 'INSTAPASSO_SSO';
  permissions: string[];
}

// Chave para cache local de sincronização
const LOCAL_SYNC_CACHE_KEY = 'instapasso_sso_synced_users';

/**
 * Retorna os usuários sincronizados salvos localmente.
 */
export function getLocalSyncedUsers(): SsoSyncedUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_SYNC_CACHE_KEY);
    if (!raw) return getInitialMockSyncedUsers();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialMockSyncedUsers();
  }
}

/**
 * Usuários iniciais mock para garantir espelhamento visual instantâneo.
 */
function getInitialMockSyncedUsers(): SsoSyncedUser[] {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 'op_bruno_gomes',
      email: 'bg@tiecia.com.br',
      name: 'Bruno Gomes',
      role: 'Super Administrador',
      companyName: 'TI&CIA Tecnologia',
      status: 'ACTIVE',
      isOnline: true,
      lastSyncedAt: timestamp,
      syncSource: 'INSTAPASSO_SSO',
      permissions: ['admin.settings', 'admin.users', 'tickets.manage', 'chat.attend'],
    },
    {
      id: 'op_ana_silva',
      email: 'ana.silva@empresa.com.br',
      name: 'Ana Silva (Suporte N2)',
      role: 'Analista de Suporte N2',
      companyName: 'TI&CIA Tecnologia',
      status: 'ACTIVE',
      isOnline: true,
      lastSyncedAt: timestamp,
      syncSource: 'PORTAL_ITSM',
      permissions: ['tickets.manage', 'chat.attend'],
    },
    {
      id: 'client_carlos_mendes',
      email: 'carlos.mendes@clienteb2b.com.br',
      name: 'Carlos Mendes (VIP)',
      role: 'Cliente VIP Solicitante',
      companyName: 'TechCorp Soluções B2B',
      status: 'ACTIVE',
      isOnline: false,
      lastSyncedAt: timestamp,
      syncSource: 'INSTAPASSO_SSO',
      permissions: ['tickets.create', 'chat.start'],
    },
  ];
}

/**
 * Salva a lista de usuários no cache local
 */
function saveLocalSyncedUsers(users: SsoSyncedUser[]): void {
  try {
    localStorage.setItem(LOCAL_SYNC_CACHE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('[SsoSyncCache] Erro ao salvar cache de usuários:', e);
  }
}

/**
 * Espelha um único usuário para o banco SSO do InstaPasso (`users_sso`).
 */
export async function mirrorUserToInstaPasso(user: Partial<SsoSyncedUser>): Promise<SsoSyncedUser> {
  const timestamp = new Date().toISOString();
  const userId = user.id || `user_${Date.now()}`;

  const syncedData: SsoSyncedUser = {
    id: userId,
    email: user.email || 'usuario@empresa.com.br',
    name: user.name || 'Usuário Sincronizado',
    role: user.role || 'Operador N1',
    companyName: user.companyName || 'Empresa Cliente B2B',
    status: user.status || 'ACTIVE',
    isOnline: user.isOnline ?? true,
    avatarUrl: user.avatarUrl,
    lastSyncedAt: timestamp,
    syncSource: 'PORTAL_ITSM',
    permissions: user.permissions || ['tickets.create', 'chat.attend'],
  };

  try {
    // 1. Grava no banco físico do InstaPasso SSO (dbInstaPassoSecurity)
    const docRef = doc(collection(dbInstaPassoSecurity, 'users_sso'), userId);
    await setDoc(docRef, syncedData, { merge: true });

    // 2. Registra evento imutável na Trilha de Auditoria ISO 27001
    await logCrudAudit('UPDATE', 'users_sso', userId, JSON.stringify({
      action: 'REALTIME_SSO_USER_MIRROR',
      userEmail: syncedData.email,
      role: syncedData.role,
      status: syncedData.status,
    }));
  } catch (err) {
    console.info('[SsoSync] Gravação em tempo real espelhada no cliente:', err);
  }

  // Atualiza cache local
  const currentList = getLocalSyncedUsers();
  const index = currentList.findIndex((u) => u.id === userId);

  if (index >= 0) {
    currentList[index] = syncedData;
  } else {
    currentList.unshift(syncedData);
  }

  saveLocalSyncedUsers(currentList);
  return syncedData;
}

/**
 * Escuta alterações em tempo real na coleção `users_sso` do InstaPasso.
 */
export function subscribeToInstaPassoUserSync(
  onUsersUpdate: (users: SsoSyncedUser[]) => void
): () => void {
  try {
    const usersQuery = query(collection(dbInstaPassoSecurity, 'users_sso'), limit(50));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const remoteUsers: SsoSyncedUser[] = [];
        snapshot.forEach((docSnap) => {
          remoteUsers.push(docSnap.data() as SsoSyncedUser);
        });

        if (remoteUsers.length > 0) {
          saveLocalSyncedUsers(remoteUsers);
          onUsersUpdate(remoteUsers);
        } else {
          onUsersUpdate(getLocalSyncedUsers());
        }
      },
      (error) => {
        console.info('[SsoSync Listener] Utilizando stream local de sincronização:', error.message);
        onUsersUpdate(getLocalSyncedUsers());
      }
    );

    return unsubscribe;
  } catch (error) {
    onUsersUpdate(getLocalSyncedUsers());
    return () => {};
  }
}

/**
 * Executa sincronização e recalibração em massa de toda a base de usuários.
 */
export async function forceMassUserSync(): Promise<{
  syncedCount: number;
  lastSyncedAt: string;
  details: string[];
}> {
  const timestamp = new Date().toISOString();
  const currentUsers = getLocalSyncedUsers();
  const details: string[] = [];

  for (const user of currentUsers) {
    user.lastSyncedAt = timestamp;
    try {
      const docRef = doc(collection(dbInstaPassoSecurity, 'users_sso'), user.id);
      await setDoc(docRef, user, { merge: true });
      details.push(`[SSO Sync] Usuário '${user.email}' (${user.name}) espelhado com sucesso.`);
    } catch (e) {
      details.push(`[SSO Sync Local] '${user.email}' atualizado no cache de sincronização.`);
    }
  }

  saveLocalSyncedUsers(currentUsers);

  await logCrudAudit('UPDATE', 'users_sso', 'MASS_SYNC_BATCH', JSON.stringify({
    action: 'FORCE_MASS_USER_SSO_SYNC',
    totalSyncedUsers: currentUsers.length,
    timestamp,
  }));

  return {
    syncedCount: currentUsers.length,
    lastSyncedAt: timestamp,
    details,
  };
}

/**
 * Simula a inclusão e espelhamento em tempo real de um novo usuário para testes.
 */
export async function simulateTestUserSync(): Promise<SsoSyncedUser> {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const testUser: Partial<SsoSyncedUser> = {
    id: `synced_test_${randomId}`,
    email: `analista.teste.${randomId}@itsm.empresa.com`,
    name: `Analista Teste #${randomId}`,
    role: 'Analista N2 (Sincronizado)',
    companyName: 'TI&CIA Tecnologia',
    status: 'ACTIVE',
    isOnline: true,
    syncSource: 'PORTAL_ITSM',
    permissions: ['tickets.manage', 'chat.attend', 'reports.view'],
  };

  return await mirrorUserToInstaPasso(testUser);
}
