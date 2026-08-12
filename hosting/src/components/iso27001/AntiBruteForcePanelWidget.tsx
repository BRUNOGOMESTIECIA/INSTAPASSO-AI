import React, { useState } from 'react';
import { useBruteForceGuard } from '../../hooks/use-brute-force-guard';
import { ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AntiBruteForcePanelWidget() {
  const { blockedIpsList, recordFailedAttempt, resetAttempts } = useBruteForceGuard();
  const [testIp, setTestIp] = useState('200.150.99.45');
  const [testEmail, setTestEmail] = useState('usuario.teste@empresa.com');

  const handleSimulateFailedAttempt = () => {
    recordFailedAttempt(testIp, testEmail);
  };

  const handleUnblock = (ip: string) => {
    resetAttempts(ip);
    toast.success(`IP ${ip} desbloqueado pelo administrador!`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Proteção Anti-Brute Force por IP (Item 114)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bloqueio automático por 15 minutos ao detectar 5 falhas seguidas de senha
            </p>
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-3 py-1 rounded-full border border-rose-300 dark:border-rose-800">
          {blockedIpsList.length} IP(s) Bloqueados
        </span>
      </div>

      {/* Tabela de IPs Bloqueados */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Lista de IPs Atualmente em Quarentena
        </h4>

        {blockedIpsList.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nenhum IP Bloqueado no Momento
            </p>
            <p className="text-[11px] text-slate-400">
              O sistema monitora em tempo real e bloqueia automaticamente ao atingir 5 falhas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Endereço IP</th>
                  <th className="py-3 px-4">Tentativas Falhas</th>
                  <th className="py-3 px-4">Tempo Restante de Bloqueio</th>
                  <th className="py-3 px-4 text-right">Ação Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {blockedIpsList.map((item) => {
                  const remainingSec = Math.max(0, Math.ceil(((item.blockedUntilMs || 0) - Date.now()) / 1000));
                  const minutes = Math.floor(remainingSec / 60);
                  const seconds = remainingSec % 60;
                  return (
                    <tr key={item.ip} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" /> {item.ip}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {item.failedCount} de 5 falhas
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ⏱️ {minutes}m {seconds}s restantes
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleUnblock(item.ip)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Desbloquear IP
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Caixa de Simulação de Teste */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Testar Simulação de Brute Force (5 Falhas Seguidas)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              IP de Origem:
            </label>
            <input
              type="text"
              value={testIp}
              onChange={(e) => setTestIp(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              E-mail de Tentativa:
            </label>
            <input
              type="text"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSimulateFailedAttempt}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          💥 Registrar Tentativa Incorreta de Login
        </button>
      </div>
    </div>
  );
}
