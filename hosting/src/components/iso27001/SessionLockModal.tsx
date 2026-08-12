import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';

interface SessionLockModalProps {
  onUnlock: () => void;
}

export function SessionLockModal({ onUnlock }: SessionLockModalProps) {
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onUnlock();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sessão Bloqueada</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Sua sessão foi bloqueada por inatividade de 30 minutos em conformidade com as diretrizes de segurança da <strong>LGPD & ISO 27001</strong>.
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">{user?.name || 'Operador ITSM'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'operador@tiecia.com.br'}</p>
          </div>
          <span className="text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">
            {user?.role || 'N1'}
          </span>
        </div>

        {/* Form de Desbloqueio */}
        <form onSubmit={handleUnlockSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Confirme sua senha para continuar</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha corporativa..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Desbloqueando...' : 'Desbloquear Sessão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
