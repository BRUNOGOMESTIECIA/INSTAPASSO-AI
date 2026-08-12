import React, { useState } from 'react';
import { Clock, ShieldCheck, Lock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { logSecurityAudit } from '../../lib/audit-logger';
import { toast } from 'sonner';

export function SessionTimeoutSettingsWidget() {
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('session_inactivity_timeout_minutes');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 30; // 30 minutos padrão
  });

  const [timeoutAction, setTimeoutAction] = useState<'lock' | 'logout'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('session_inactivity_action');
      if (saved === 'logout') return 'logout';
    }
    return 'lock';
  });

  const handleSave = (newMinutes: number, action: 'lock' | 'logout') => {
    setTimeoutMinutes(newMinutes);
    setTimeoutAction(action);

    if (typeof window !== 'undefined') {
      localStorage.setItem('session_inactivity_timeout_minutes', newMinutes.toString());
      localStorage.setItem('session_inactivity_action', action);
    }

    logSecurityAudit({
      protocol: `TIMEOUT_CFG_${Date.now().toString().slice(-6)}`,
      action: '🔒 Ajuste de Política de Timeout por Inatividade de Sessão (Item 110)',
      originPortal: 'Portal Operacional',
      userName: 'Administrador de TI',
      userEmail: 'admin@tiecia.com.br',
      details: `Tempo limite de inatividade ajustado para ${newMinutes} minutos. Ação de segurança: ${action === 'lock' ? 'Bloquear Tela' : 'Encerrar Sessão (Logout)'}.`,
    });

    toast.success('Parâmetros de Timeout por Inatividade Salvos!', {
      description: `Sessões inativas por mais de ${newMinutes} min executarão: ${action === 'lock' ? 'Bloqueio de Tela' : 'Logout Forçado'}.`,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Expiração & Timeout de Sessão por Inatividade (Item 110)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bloqueio automático ou encerramento de sessão por ausência prolongada (ISO 27001 / LGPD)
            </p>
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
          ⏱️ Timeout: {timeoutMinutes} Minutos
        </span>
      </div>

      {/* Seletores Rápidos de Tempo */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Selecione o Tempo Limite Tolerado de Ausência do Operador
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[5, 15, 30, 60, 120].map((mins) => {
            const isSelected = timeoutMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => handleSave(mins, timeoutAction)}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/30 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{mins} Minutos</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ação ao Expirar Timeout */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Ação de Segurança Executada ao Atingir o Timeout
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleSave(timeoutMinutes, 'lock')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer space-y-1.5 ${
              timeoutAction === 'lock'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-500" />
              🔒 Bloquear Tela & Exigir Senha (Recomendado)
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Mantém o trabalho do operador na tela, porém congelado até a reautenticação de senha.
            </p>
          </button>

          <button
            onClick={() => handleSave(timeoutMinutes, 'logout')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer space-y-1.5 ${
              timeoutAction === 'logout'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <LogOut className="w-4 h-4 text-rose-500" />
              🚪 Encerrar Sessão (Logout Forçado)
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Desconecta o operador totalmente do portal, limpando a sessão ativa.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
