import React from 'react';
import { Bot, AlertTriangle, Link, XCircle, Play, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { type DuplicateMatchResult } from '../../lib/ai-duplicate-detector';

interface AiDuplicateTicketAlertModalProps {
  isOpen: boolean;
  matchResult: DuplicateMatchResult | null;
  onClose: () => void;
  onMerge: (existingId: string) => void;
  onCancelDuplicate: () => void;
  onProceedAnyway: () => void;
}

/**
 * 🤖 Modal do Item 074: Alerta Visual de Duplicidade de Solicitação por IA
 */
export function AiDuplicateTicketAlertModal({
  isOpen,
  matchResult,
  onClose,
  onMerge,
  onCancelDuplicate,
  onProceedAnyway,
}: AiDuplicateTicketAlertModalProps) {
  if (!isOpen || !matchResult || !matchResult.isDuplicate) return null;

  const minutesAgo = Math.max(1, Math.round(matchResult.timeElapsedSeconds / 60));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
        {/* Glow Amarelo/Rosa de Alerta */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header do Alerta */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">Alerta de Duplicidade por IA</h3>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Item 074
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Detecção semântica em janela de 10 minutos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner de % de Semelhança Semântica */}
        <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Grau de Semelhança IA</p>
              <p className="text-sm font-black text-amber-200">
                {matchResult.confidencePercent}% de Coincidência Semântica
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono">
            ⏱️ Há {minutesAgo} min
          </span>
        </div>

        {/* Detalhes do Ticket Existente */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-bold">Chamado Anterior Aberto:</span>
            <span className="font-mono font-bold text-amber-400">{matchResult.existingTicketId}</span>
          </div>

          <p className="font-semibold text-slate-200 leading-relaxed italic">
            "{matchResult.existingTicketTitle}"
          </p>

          <div className="pt-2 flex flex-wrap gap-1">
            {matchResult.matchedFields.map((field, idx) => (
              <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                ✓ {field}
              </span>
            ))}
          </div>
        </div>

        {/* Ações Recomendadas da IA */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Ações Recomendadas:
          </span>

          <button
            onClick={() => onMerge(matchResult.existingTicketId)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              <span>Mesclar com Ticket Existente ({matchResult.existingTicketId})</span>
            </div>
            <span className="text-[10px] font-black uppercase bg-slate-950/20 px-2 py-0.5 rounded">Recomendado</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCancelDuplicate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              Cancelar Duplicado
            </button>

            <button
              onClick={onProceedAnyway}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Manter Abertura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
