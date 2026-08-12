import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, RefreshCw, Play, CheckCircle2, HardDrive, Plus, Clock, ShieldCheck } from 'lucide-react';
import { getOfflineSyncStatus, getQueuedMutations, queueOfflineMutation, flushOfflineMutations, setSimulatedOfflineMode, subscribeToNetworkStatus, type OfflineSyncStatus, type QueuedOfflineMutation } from '../../lib/pwa-offline-sync';
import { toast } from 'sonner';

/**
 * 📶 Widget do Item 022: Gestão e Simulador de Auto-Sincronismo Offline e PWA
 */
export function PwaOfflineSyncWidget() {
  const [status, setStatus] = useState<OfflineSyncStatus>(getOfflineSyncStatus());
  const [queue, setQueue] = useState<QueuedOfflineMutation[]>(getQueuedMutations());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkStatus((newStatus) => {
      setStatus(newStatus);
      setQueue(getQueuedMutations());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleOfflineSimulation = (simulate: boolean) => {
    setSimulatedOfflineMode(simulate);
    if (simulate) {
      toast.warning('Modo Offline ativado! Ações serão enfileiradas no IndexedDB.');
    } else {
      toast.success('Conexão restabelecida! Executando flush automático da fila.');
      handleFlushQueue();
    }
  };

  const handleSimulateOfflineAction = async () => {
    const actions = [
      { type: 'CREATE_TICKET' as const, desc: 'Abertura de ticket offline para troca de teclado' },
      { type: 'SEND_CHAT_MESSAGE' as const, desc: 'Mensagem no chat: "Testes efetuados via cache local"' },
      { type: 'UPDATE_STATUS' as const, desc: 'Atualização do ticket #20261048 para Em Andamento' },
    ];
    const picked = actions[Math.floor(Math.random() * actions.length)];

    await queueOfflineMutation(picked.type, {
      description: picked.desc,
      simulatedAt: new Date().toISOString(),
    });

    setQueue(getQueuedMutations());
    toast.info(`Ação '${picked.type}' enfileirada no cache IndexedDB!`);
  };

  const handleFlushQueue = async () => {
    setIsSyncing(true);
    try {
      const res = await flushOfflineMutations();
      setIsSyncing(false);
      setQueue([]);
      toast.success(`Flush concluído! ${res.syncedCount} mutações sincronizadas com sucesso.`);
    } catch (e) {
      setIsSyncing(false);
      toast.error('Erro ao sincronizar mutações offline.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Auto-Sincronismo Offline e PWA Service Worker
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Item 022
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cache local resiliente no IndexedDB com transmissão automática (*Background Sync*) ao reconectar à internet.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status.isOnline ? (
            <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              🟢 REDE ONLINE (100% Sincronizado)
            </span>
          ) : (
            <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 rounded-xl flex items-center gap-1.5 animate-pulse">
              <WifiOff className="w-4 h-4 text-amber-400" />
              🟡 MODO OFFLINE ATIVO ({status.pendingQueueCount} pendentes)
            </span>
          )}
        </div>
      </div>

      {/* Simulador de Conectividade */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Controles de Teste de Conectividade PWA
            </h4>
          </div>

          <div className="flex gap-2">
            {status.isSimulatedOffline ? (
              <button
                onClick={() => handleToggleOfflineSimulation(false)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <Wifi className="w-4 h-4" />
                Reconectar (Voltar Online)
              </button>
            ) : (
              <button
                onClick={() => handleToggleOfflineSimulation(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-lg text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <WifiOff className="w-4 h-4" />
                Simular Queda de Internet (Modo Offline)
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={handleSimulateOfflineAction}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            Simular Ação no Cache IndexedDB
          </button>

          {queue.length > 0 && (
            <button
              onClick={handleFlushQueue}
              disabled={isSyncing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Executar Sincronismo da Fila ({queue.length})
            </button>
          )}
        </div>
      </div>

      {/* Fila de Mutações no IndexedDB */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Fila de Mutações Salvas em Cache IndexedDB ({queue.length})
            </h4>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Último Sync: {new Date(status.lastSyncTime).toLocaleTimeString('pt-BR')}
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            ✓ Nenhuma mutação pendente no cache. Todos os dados estão 100% sincronizados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                  <th className="py-2.5 px-4">Tipo de Ação</th>
                  <th className="py-2.5 px-4">Conteúdo do Payload</th>
                  <th className="py-2.5 px-4">Data/Hora</th>
                  <th className="py-2.5 px-4 text-right">Status do Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {queue.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400 text-[11px]">
                      {m.actionType}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {m.payload?.description || JSON.stringify(m.payload)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(m.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⏳ AGUARDANDO SYNC
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
