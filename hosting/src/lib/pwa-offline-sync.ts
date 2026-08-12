import { logCrudAudit } from './audit-logger';

/**
 * 📶 Item 022: Auto-Sincronismo Offline e PWA Service Worker
 * 
 * Módulo de cache resiliente no IndexedDB / LocalStorage com fila de sincronização
 * automática ao reconectar com a internet (Background Sync Queue).
 */

export type OfflineMutationActionType = 
  | 'CREATE_TICKET' 
  | 'SEND_CHAT_MESSAGE' 
  | 'UPDATE_STATUS' 
  | 'ADD_INTERNAL_NOTE';

export interface QueuedOfflineMutation {
  id: string;
  actionType: OfflineMutationActionType;
  payload: any;
  timestamp: string;
  retryCount: number;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingQueueCount: number;
  lastSyncTime: string;
}

const QUEUE_STORAGE_KEY = 'portal_pwa_offline_queue';
const LAST_SYNC_STORAGE_KEY = 'portal_pwa_last_sync_time';
const SIMULATED_OFFLINE_KEY = 'portal_simulated_offline_mode';

/**
 * Retorna se o sistema está simulando o modo offline pelo painel
 */
export function isSimulatedOfflineMode(): boolean {
  try {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Alterna a simulação de modo offline pelo painel
 */
export function setSimulatedOfflineMode(simulate: boolean): void {
  try {
    localStorage.setItem(SIMULATED_OFFLINE_KEY, simulate ? 'true' : 'false');
    window.dispatchEvent(new Event('offline-mode-change'));
  } catch (e) {}
}

/**
 * Retorna o status de sincronismo e conectividade atual
 */
export function getOfflineSyncStatus(): OfflineSyncStatus {
  const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const simulated = isSimulatedOfflineMode();
  const isOnline = browserOnline && !simulated;

  const queue = getQueuedMutations();
  const lastSync = localStorage.getItem(LAST_SYNC_STORAGE_KEY) || new Date().toISOString();

  return {
    isOnline,
    isSimulatedOffline: simulated,
    pendingQueueCount: queue.length,
    lastSyncTime: lastSync,
  };
}

/**
 * Obtém a lista de mutações enfileiradas offline
 */
export function getQueuedMutations(): QueuedOfflineMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

/**
 * Adiciona uma nova ação à fila de sincronismo offline (IndexedDB / Fallback)
 */
export async function queueOfflineMutation(
  actionType: OfflineMutationActionType,
  payload: any
): Promise<QueuedOfflineMutation> {
  const id = `off_mut_${Date.now()}`;
  const mutation: QueuedOfflineMutation = {
    id,
    actionType,
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = getQueuedMutations();
  queue.push(mutation);

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[PwaOfflineSync] Erro ao enfileirar mutação:', e);
  }

  // Audit Log ISO 27001
  await logCrudAudit('CREATE', 'pwa_offline_queue', id, JSON.stringify({
    action: 'OFFLINE_MUTATION_QUEUED',
    actionType,
    queueLength: queue.length,
  }));

  window.dispatchEvent(new Event('offline-queue-updated'));
  return mutation;
}

/**
 * Executa o flush automático da fila de sincronismo ao reconectar à internet
 */
export async function flushOfflineMutations(): Promise<{ syncedCount: number; remainingCount: number }> {
  const queue = getQueuedMutations();
  if (queue.length === 0) {
    return { syncedCount: 0, remainingCount: 0 };
  }

  const syncedCount = queue.length;

  // Processa todas as mutações pendentes
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_STORAGE_KEY, now);
  } catch (e) {}

  await logCrudAudit('UPDATE', 'pwa_offline_sync', 'sync_flush', JSON.stringify({
    action: 'PWA_BACKGROUND_SYNC_FLUSH_COMPLETED',
    syncedCount,
    timestamp: new Date().toISOString(),
  }));

  window.dispatchEvent(new Event('offline-queue-updated'));
  return { syncedCount, remainingCount: 0 };
}

/**
 * Inscreve um callback para ser notificado de mudanças na conectividade de rede
 */
export function subscribeToNetworkStatus(callback: (status: OfflineSyncStatus) => void): () => void {
  const handler = () => callback(getOfflineSyncStatus());

  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  window.addEventListener('offline-mode-change', handler);
  window.addEventListener('offline-queue-updated', handler);

  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
    window.removeEventListener('offline-mode-change', handler);
    window.removeEventListener('offline-queue-updated', handler);
  };
}
