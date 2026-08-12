import React, { useState } from 'react';
import { ShieldCheck, Hash, Sparkles, RefreshCw, Zap, Lock, Check } from 'lucide-react';
import { generateNextAtomicTicketProtocol } from '../../lib/atomic-ticket-counter';
import { formatTicketProtocol } from '../../lib/audit-logger';
import { toast } from 'sonner';

export function AtomicTicketCounterWidget() {
  const [currentSeq, setCurrentSeq] = useState(1042);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ number: number; formatted: string; time: string }[]>([
    { number: 1042, formatted: '#20261042', time: '11:10:00' },
    { number: 1041, formatted: '#20261041', time: '10:55:12' },
  ]);

  const handleTestAtomicGeneration = async () => {
    setIsGenerating(true);
    try {
      const res = await generateNextAtomicTicketProtocol();
      setCurrentSeq(res.number);
      setHistory((prev) => [
        { number: res.number, formatted: res.formatted, time: new Date().toLocaleTimeString('pt-BR') },
        ...prev.slice(0, 4),
      ]);
      toast.success(`⚡ Protocolo de Ticket Atômico gerado com sucesso no Firestore: ${res.formatted}!`);
    } catch (err) {
      toast.error('Erro ao gerar protocolo atômico.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Contador Atômico de Tickets (#2026XXXX)
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 017
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Garantia de unicidade sequencial no Firestore contra colisão de solicitações simultâneas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestAtomicGeneration}
          disabled={isGenerating}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
          <span>{isGenerating ? 'Gerando Atômico...' : 'Testar Gerador Atômico'}</span>
        </button>
      </div>

      {/* Grid de Estado Atômico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card do ÚLTIMO PROTOCOLO GERADO */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Último Protocolo Atômico Confirmado:
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {formatTicketProtocol(currentSeq)}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Sequência #{currentSeq}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Próximo ticket garantido: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatTicketProtocol(currentSeq + 1)}</strong>
          </p>
        </div>

        {/* Histórico Recente de Protocolos Gerados */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Histórico Recente de Sequências Firestore:
          </span>
          <div className="space-y-1">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{h.formatted}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
