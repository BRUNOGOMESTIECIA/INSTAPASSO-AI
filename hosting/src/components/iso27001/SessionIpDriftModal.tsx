import React from 'react';
import { ShieldAlert, Lock, RefreshCw, AlertOctagon } from 'lucide-react';

interface SessionIpDriftModalProps {
  isOpen: boolean;
  initialIp: string;
  currentIp: string;
  onResolve: () => void;
}

export function SessionIpDriftModal({ isOpen, initialIp, currentIp, onResolve }: SessionIpDriftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-2xl shadow-rose-950/80 w-full max-w-lg p-6 text-slate-100 space-y-5 animate-in zoom-in-95">
        {/* Topo do Alerta */}
        <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
          <div className="p-3 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-rose-400">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
              PROTEÇÃO ISO 27001 (Item 113)
            </span>
            <h2 className="text-lg font-black text-rose-200 mt-1">
              Troca Repentina de IP de Sessão Detectada
            </h2>
          </div>
        </div>

        {/* Descrição do Risco */}
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            O endereço IP de acesso da sua sessão mudou bruscamente durante a utilização do Portal Operacional. Por medida de segurança para evitar <strong>Session Hijacking</strong>, o acesso a funções sensíveis foi suspenso até a confirmação.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">IP de Início da Sessão:</span>
              <span className="font-mono font-bold text-emerald-400">{initialIp}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Novo IP Detectado:</span>
              <span className="font-mono font-bold text-rose-400">{currentIp}</span>
            </div>
          </div>
        </div>

        {/* Ação de Revalidação */}
        <button
          onClick={onResolve}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          Confirmar Identidade & Revalidar Sessão
        </button>
      </div>
    </div>
  );
}
