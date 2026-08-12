import React, { useState } from 'react';
import { Lightbulb, Sparkles, Check, ArrowRight, History, ShieldCheck, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface PastResolvedTicketMatch {
  id: string;
  protocolNumber: string;
  title: string;
  similarityPercentage: number;
  category: string;
  resolutionSummary: string;
  resolvedBy: string;
  resolvedAt: string;
}

interface AiPastTicketSolutionSuggesterWidgetProps {
  ticketId: string;
  protocolNumber: string;
  ticketTitle?: string;
  onApplySolution?: (solutionText: string) => void;
  readOnly?: boolean;
}

const MOCK_SIMILAR_TICKETS: PastResolvedTicketMatch[] = [
  {
    id: 'past_1012',
    protocolNumber: '1012',
    title: 'Falha de comunicação com o servidor de banco de dados ERP',
    similarityPercentage: 96,
    category: 'Sistemas > ERP',
    resolutionSummary: 'Limpeza de cache no Redis, reinicialização do pool de conexões do Keycloak e liberação de porta 5432 no firewall da filial.',
    resolvedBy: 'Carlos Eduardo (N2)',
    resolvedAt: '28/07/2026 14:20',
  },
  {
    id: 'past_0984',
    protocolNumber: '0984',
    title: 'Lentidão e erro de timeout ao emitir notas fiscais',
    similarityPercentage: 89,
    category: 'Sistemas > ERP',
    resolutionSummary: 'Reindexação do banco PostgreSQL e reinício do serviço de integração com a SEFAZ.',
    resolvedBy: 'Mariana Lima (N2)',
    resolvedAt: '25/07/2026 10:15',
  },
];

export function AiPastTicketSolutionSuggesterWidget({
  ticketId,
  protocolNumber,
  ticketTitle = 'Problema de conexão no sistema',
  onApplySolution,
  readOnly = false,
}: AiPastTicketSolutionSuggesterWidgetProps) {
  const [matches, setMatches] = useState<PastResolvedTicketMatch[]>(MOCK_SIMILAR_TICKETS);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const formattedProtocol = formatTicketProtocol(protocolNumber);

  const handleUseSolution = (match: PastResolvedTicketMatch) => {
    setAppliedId(match.id);
    if (onApplySolution) {
      onApplySolution(match.resolutionSummary);
    }

    const matchedProtocol = formatTicketProtocol(match.protocolNumber);
    logAuditEvent(
      'AI_PAST_SOLUTION_APPLIED',
      `Atendente aplicou solução do chamado histórico ${matchedProtocol} (${match.similarityPercentage}% semelhança) no ticket ${formattedProtocol}.`
    );

    toast.success(`Solução do chamado ${matchedProtocol} copiada para a caixa de resposta!`);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/30 rounded-2xl p-4 text-slate-100 space-y-3.5 shadow-2xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              Sugestão Inteligente de Soluções Passadas (IA RAG)
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 071
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              A IA analisou {matches.length} chamados semelhantes resolvidos no passado para acelerar o diagnóstico.
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Soluções Passadas Relevantes */}
      <div className="space-y-3">
        {matches.map((m) => {
          const matchedProtocol = formatTicketProtocol(m.protocolNumber);
          const isApplied = appliedId === m.id;

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                isApplied
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-500/10'
                  : 'bg-slate-900/90 border-slate-700/80 hover:border-indigo-500/50'
              }`}
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{matchedProtocol}</span>
                  <span className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]" title={m.title}>
                    {m.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> {m.similarityPercentage}% Semelhança
                  </span>
                </div>
              </div>

              {/* Descrição da Solução Aplicada no Passado */}
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 text-xs text-slate-200 leading-relaxed font-sans">
                <span className="text-amber-400 font-bold block text-[10px] uppercase mb-0.5">
                  Solução Aplicada por {m.resolvedBy} em {m.resolvedAt}:
                </span>
                {m.resolutionSummary}
              </div>

              {/* Botão de Aplicação Rápida */}
              {!readOnly && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleUseSolution(m)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Solução Copiada!
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5 text-amber-300" /> Usar Esta Solução na Resposta
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
