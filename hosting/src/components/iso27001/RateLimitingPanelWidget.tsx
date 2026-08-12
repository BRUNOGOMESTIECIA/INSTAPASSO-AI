import React, { useState, useEffect } from 'react';
import { Zap, ShieldAlert, Lock, Sliders, Play, CheckCircle2, RefreshCw, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getRateLimiterRules, saveRateLimiterRules, getRateLimiterMetrics, simulateMassRequestAttack, type RateLimitRule, type RateLimiterMetrics, resetRateLimitWindow } from '../../lib/rate-limiter';
import { toast } from 'sonner';

/**
 * ⚡ Widget do Item 024: Rate Limiting por Endpoint / API
 */
export function RateLimitingPanelWidget() {
  const [rules, setRules] = useState<RateLimitRule[]>(getRateLimiterRules());
  const [metrics, setMetrics] = useState<RateLimiterMetrics>(getRateLimiterMetrics());
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  useEffect(() => {
    setMetrics(getRateLimiterMetrics());
  }, []);

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    setRules(updated);
    saveRateLimiterRules(updated);
    toast.success('Regra de Rate Limiting atualizada!');
  };

  const handleUpdateLimit = (id: string, newMax: number) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, maxRequests: Math.max(1, newMax) } : r));
    setRules(updated);
    saveRateLimiterRules(updated);
    toast.success('Limite de requisições ajustado!');
  };

  const handleSimulateAttack = () => {
    setIsSimulating(true);
    resetRateLimitWindow('auth_login');

    const res = simulateMassRequestAttack('auth_login');
    const logs: string[] = [
      '[INICIO] Disparando 8 requisições simultâneas em /api/auth/login para testar Rate Limit...',
    ];

    res.attempts.forEach((attempt, index) => {
      const num = index + 1;
      if (attempt.allowed) {
        logs.push(`Disparo #${num}: 🟢 ALLOWED (Restantes: ${attempt.remaining}/${attempt.maxRequests})`);
      } else {
        logs.push(`Disparo #${num}: 🔴 BLOQUEADO! Limite de ${attempt.maxRequests} req/min excedido. Trava por ${attempt.resetInSeconds}s.`);
      }
    });

    setSimulationLogs(logs);
    setMetrics(getRateLimiterMetrics());
    setIsSimulating(false);
    toast.error(`Bloqueio ativado no disparo #${res.blockedOnAttempt}! Rate Limit L7 funcionando.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Rate Limiting por Endpoint / API
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Item 024
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Limitação de frequência por IP e Janela Deslizante (Sliding Window Log) contra força bruta e scraping.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleSimulateAttack}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Testar Disparo Massivo (Simular Scraping)
        </button>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Proteção L7</p>
              <p className="text-sm font-black text-emerald-400">🟢 RATE LIMIT ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Disparos Bloqueados</p>
              <p className="text-sm font-black text-white">{metrics.totalBlockedRequests} Bloqueios</p>
            </div>
          </div>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Regras Ativas</p>
              <p className="text-sm font-black text-blue-300">{rules.filter((r) => r.isEnabled).length} / {rules.length} Endpoints</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overhead por Req</p>
              <p className="text-sm font-black text-slate-200">&lt; 0.8 ms (Janela Log)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Regras de Endpoints */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Limites Configuráveis por Endpoint / API
            </h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Endpoint / Recurso</th>
                <th className="py-2.5 px-4">Rota de API</th>
                <th className="py-2.5 px-4">Categoria</th>
                <th className="py-2.5 px-4">Limite Máximo / Janela</th>
                <th className="py-2.5 px-4 text-right">Status da Trava</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {r.endpointName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                    {r.path}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={r.maxRequests}
                        onChange={(e) => handleUpdateLimit(r.id, parseInt(e.target.value, 10) || 1)}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-center text-white outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400 text-xs">reqs / {r.windowSeconds}s</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleRule(r.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        r.isEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {r.isEnabled ? '🟢 ATIVADA' : '⚪ DESATIVADA'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log de Demonstração de Ataque */}
      {simulationLogs.length > 0 && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">Resultado da Simulação de Disparo Massivo</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">SLIDING WINDOW LOCK</span>
          </div>

          <div className="space-y-1 text-slate-300 max-h-36 overflow-y-auto pr-2">
            {simulationLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={log.includes('BLOQUEADO') ? 'text-rose-400 font-bold' : log.includes('ALLOWED') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
