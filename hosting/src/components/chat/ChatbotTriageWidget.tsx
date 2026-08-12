import React, { useState } from 'react';
import { Bot, CheckCircle2, Headphones, Sparkles, ArrowRight, Lightbulb, ChevronRight } from 'lucide-react';
import { CHATBOT_TRIAGE_TREE, type TriageOption, type TriageNode } from '../../lib/chatbot-triage-tree';

interface ChatbotTriageWidgetProps {
  onSelectOption: (option: TriageOption) => void;
  onEscalateToHuman: (category?: string, priority?: string) => void;
  onResolvedByBot: () => void;
}

export function ChatbotTriageWidget({ onSelectOption, onEscalateToHuman, onResolvedByBot }: ChatbotTriageWidgetProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [selectedSolutionOption, setSelectedSolutionOption] = useState<TriageOption | null>(null);

  const currentNode: TriageNode = CHATBOT_TRIAGE_TREE[currentNodeId] || CHATBOT_TRIAGE_TREE.root;

  const handleOptionClick = (option: TriageOption) => {
    onSelectOption(option);

    if (option.nextStepId && CHATBOT_TRIAGE_TREE[option.nextStepId]) {
      setCurrentNodeId(option.nextStepId);
    } else if (option.suggestedSolution) {
      setSelectedSolutionOption(option);
    } else if (option.escalateToHuman) {
      onEscalateToHuman(option.category, option.suggestedPriority);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4 shadow-xl animate-in fade-in duration-200 my-2">
      {/* Bot Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-white">Assistente Virtual ITSM</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30">
              Bot Triagem
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{currentNode.prompt}</p>
        </div>
      </div>

      {/* Exibição da Sugestão da Base de Conhecimento se selecionada */}
      {selectedSolutionOption ? (
        <div className="space-y-3 animate-in zoom-in-95 duration-200">
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Solução Instantânea Sugerida:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedSolutionOption.suggestedSolution}</p>
          </div>

          <p className="text-[11px] font-bold text-slate-400 text-center">Essa resposta resolveu a sua dúvida?</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onResolvedByBot()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sim, me ajudou!
            </button>
            <button
              onClick={() => onEscalateToHuman(selectedSolutionOption.category, selectedSolutionOption.suggestedPriority)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              Chamar Humano N1
            </button>
          </div>
        </div>
      ) : (
        /* Lista de Opções Árvore */
        <div className="space-y-2">
          {currentNode.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt)}
              className="w-full text-left p-3 bg-slate-950/70 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all group flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                  {opt.label}
                </div>
                {opt.description && (
                  <p className="text-[10px] text-slate-400 truncate">{opt.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
