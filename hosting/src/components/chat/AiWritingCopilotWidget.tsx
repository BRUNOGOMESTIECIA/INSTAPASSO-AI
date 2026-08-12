import React, { useState } from 'react';
import { Sparkles, Edit3, Check, RefreshCw, X, Wand2, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from '../../lib/audit-logger';

interface AiWritingCopilotWidgetProps {
  currentText: string;
  onApplyText: (improvedText: string) => void;
  disabled?: boolean;
}

export type WritingTone = 'professional' | 'concise' | 'empathetic';

export function AiWritingCopilotWidget({
  currentText,
  onApplyText,
  disabled = false,
}: AiWritingCopilotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<WritingTone>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [polishedText, setPolishedText] = useState('');

  const handleOpenCopilot = () => {
    if (!currentText.trim()) {
      toast.error('Digite um rascunho de mensagem antes de acionar o Co-Piloto de Redação.');
      return;
    }
    setIsOpen(true);
    generatePolishedText(currentText, tone);
  };

  const generatePolishedText = (rawDraft: string, targetTone: WritingTone) => {
    setIsGenerating(true);

    setTimeout(() => {
      let result = rawDraft;

      if (targetTone === 'professional') {
        result = `Prezado(a),\n\nAnalisamos a sua solicitação. ${rawDraft.replace(/voce/gi, 'você')}.\n\nPermanecemos à disposição para quaisquer esclarecimentos adicionais.\n\nAtenciosamente,\nEquipe de Suporte Técnico ITSM`;
      } else if (targetTone === 'concise') {
        result = `Olá! Em resposta ao seu chamado:\n• ${rawDraft.replace(/\n/g, '\n• ')}\n\nProcedimento em andamento. Qualquer dúvida, estou à disposição.`;
      } else if (targetTone === 'empathetic') {
        result = `Olá! Entendemos a importância dessa demanda para a sua rotina e pedimos desculpas pelo inconveniente.\n\n${rawDraft}\n\nEstamos trabalhando para resolver tudo da forma mais rápida possível!`;
      }

      setPolishedText(result);
      setIsGenerating(false);

      logAuditEvent(
        'AI_WRITING_COPILOT_USED',
        `Co-Piloto de Redação por IA gerou sugestão de texto no tom "${targetTone}".`
      );
    }, 600);
  };

  const handleConfirm = () => {
    if (!polishedText.trim()) return;
    onApplyText(polishedText);
    setIsOpen(false);
    toast.success('✨ Texto aprimorado pela IA aplicado ao seu campo de resposta!');
  };

  return (
    <>
      {/* Botão de Disparo */}
      <button
        type="button"
        onClick={handleOpenCopilot}
        disabled={disabled || !currentText.trim()}
        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        title="Polir gramática e aprimorar tom com IA"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Co-Piloto IA</span>
      </button>

      {/* Modal de Edição Antes de Enviar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-xl p-5 text-slate-100 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Co-Piloto de Redação IA
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      Item 075
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revise e edite a sugestão da IA antes de aplicar à mensagem do cliente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor de Tom */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Selecione o Tom Desejado:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'professional', label: '💼 Profissional', desc: 'Formal e executivo' },
                    { id: 'concise', label: '⚡ Direto', desc: 'Passo a passo curto' },
                    { id: 'empathetic', label: '🤝 Empático', desc: 'Atencioso e acolhedor' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTone(t.id);
                      generatePolishedText(currentText, t.id);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      tone === t.id
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-bold shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs block font-bold">{t.label}</span>
                    <span className="text-[10px] text-slate-400 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rascunho Original vs Sugestão Editável */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  Sugestão da IA (Totalmente Editável):
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  ✏️ Você pode alterar qualquer palavra antes de aceitar
                </span>
              </div>

              <div className="relative">
                {isGenerating ? (
                  <div className="h-36 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-purple-300 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                    Polindo gramática e ajustando tom...
                  </div>
                ) : (
                  <textarea
                    rows={5}
                    value={polishedText}
                    onChange={(e) => setPolishedText(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-950 border border-purple-500/40 rounded-xl text-slate-100 outline-none focus:border-purple-400 transition-colors resize-none leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => generatePolishedText(currentText, tone)}
                disabled={isGenerating}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Novamente
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isGenerating || !polishedText.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Aplicar Texto Editado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
