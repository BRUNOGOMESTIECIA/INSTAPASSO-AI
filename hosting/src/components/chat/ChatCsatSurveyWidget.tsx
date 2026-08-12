import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquare, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

interface ChatCsatSurveyWidgetProps {
  chatId: string;
  protocolNumber?: string;
  agentName?: string;
  onSubmitted?: (rating: number, comment: string, tags: string[]) => void;
}

const CSAT_TAGS = [
  '⚡ Atendimento Rápido',
  '👨‍💻 Atendente Muito Atencioso',
  '🎯 Problema Resolvido 100%',
  '📖 Boa Explicação Técnica',
  '⌛ Demorou para Responder',
];

const EMOJI_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😠', label: 'Muito Insatisfeito' },
  2: { emoji: '🙁', label: 'Insatisfeito' },
  3: { emoji: '😐', label: 'Neutro / Regular' },
  4: { emoji: '🙂', label: 'Satisfeito' },
  5: { emoji: '😃', label: 'Excelente / Adorei' },
};

export function ChatCsatSurveyWidget({
  chatId,
  protocolNumber = '1048',
  agentName = 'Atendimento N1',
  onSubmitted,
}: ChatCsatSurveyWidgetProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const activeRating = hoverRating || rating;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onSubmitted) {
      onSubmitted(rating, comment, selectedTags);
    }

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'CSAT_SURVEY_SUBMITTED',
      `Avaliação CSAT de ${rating} estrela(s) enviada para o chat ${formattedProtocol} (Atendente: ${agentName}). Comentário: "${comment || 'Sem comentário'}". Tags: [${selectedTags.join(', ')}].`
    );

    toast.success('Obrigado! Sua avaliação CSAT foi registrada com sucesso.');
  };

  if (submitted) {
    return (
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 text-center text-slate-100 space-y-3 animate-in zoom-in-95 duration-200 shadow-2xl my-3">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Avaliação Recebida com Sucesso!</h4>
          <p className="text-xs text-slate-300 mt-1">
            Muito obrigado por avaliar nosso suporte com <span className="font-bold text-amber-400">{rating} Estrelas</span>. Sua opinião é essencial para continuarmos melhorando!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 text-slate-100 space-y-3.5 shadow-2xl animate-in fade-in duration-200 my-3">
      {/* Header */}
      <div className="text-center space-y-1 border-b border-slate-800 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
          <Star className="w-3 h-3 fill-amber-400" /> Pesquisa de Satisfação CSAT
        </div>
        <h4 className="text-sm font-extrabold text-white">Como foi seu atendimento com {agentName}?</h4>
        <p className="text-[11px] text-slate-400">Sua avaliação ajuda a medir a qualidade do nosso time N1</p>
      </div>

      {/* 5-Star Hover Rating */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= activeRating
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-600 fill-slate-800'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Emoji Label Indicator */}
        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 h-5">
          <span className="text-base">{EMOJI_LABELS[activeRating]?.emoji}</span>
          <span>{EMOJI_LABELS[activeRating]?.label}</span>
        </div>
      </div>

      {/* Tags de Feedback Rápido */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Destaques do Atendimento:
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {CSAT_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opcional: Comentário por extenso */}
      <div className="space-y-1">
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deixe uma sugestão ou elogio adicional (opcional)..."
          className="w-full text-xs p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 transition-colors resize-none"
        />
      </div>

      {/* Enviar Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" /> Enviar Avaliação CSAT
      </button>
    </div>
  );
}
