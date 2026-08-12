import React, { useState } from 'react';
import { ArrowRightLeft, ShieldCheck, Lock, CheckCircle2, X, Send, AlertTriangle } from 'lucide-react';
import { type TransferTargetOption, createHandoffTransfer } from '../../lib/chat-transfer-handoff';
import { toast } from 'sonner';

interface ChatTransferHandoffModalProps {
  isOpen: boolean;
  chatId: string;
  target: TransferTargetOption | null;
  onClose: () => void;
  onSuccess: (targetName: string, noteText: string) => void;
}

/**
 * 🔀 Modal do Item 042 / 141: Nota Confidencial de Passagem de Bastão no Transbordo de Chat
 */
export function ChatTransferHandoffModal({
  isOpen,
  chatId,
  target,
  onClose,
  onSuccess,
}: ChatTransferHandoffModalProps) {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error('Digite a nota de passagem para informar os testes já efetuados!');
      return;
    }

    setIsSubmitting(true);
    try {
      await createHandoffTransfer(
        chatId,
        target.type,
        target.id,
        target.name,
        target.roleBadge,
        noteText,
        'Atendente N1 (Operacional)'
      );

      toast.success(`Chat transferido para '${target.name}' com nota confidencial anexada!`);
      onSuccess(target.name, noteText);
      setNoteText('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      toast.error('Erro ao transferir chat.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Transferir Atendimento ao Vivo</h3>
              <p className="text-[11px] text-slate-400">Item 042 / 141 • Transbordo com Nota Confidencial</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informações do Destino Selecionado */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" title="Disponível" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Destino do Transbordo</span>
              <span className="font-extrabold text-sm text-white">{target.name}</span>
            </div>
          </div>

          {target.roleBadge && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 uppercase">
              {target.roleBadge}
            </span>
          )}
        </div>

        {/* Alerta de Confidencialidade (Invisível para o Cliente) */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>🔒 Nota Estritamente Confidencial:</strong> Este resumo de passagem de bastão é visível <strong>APENAS</strong> para a equipe interna de suporte N2/N3. O cliente <strong>NÃO</strong> verá esta nota no chat.
          </p>
        </div>

        {/* Campo de Nota Confidencial */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            Nota de Passagem de Bastão (Resumo Técnico & Testes Efetuados) *
          </label>
          <textarea
            required
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ex: Cliente relatou queda constante de VPN após atualizar o Windows. Já testei conectividade e rotas, necessita verificação de regras no Firewall N2..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 outline-none focus:border-amber-500 font-sans"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Confirmar Transferência N2
          </button>
        </div>
      </form>
    </div>
  );
}
