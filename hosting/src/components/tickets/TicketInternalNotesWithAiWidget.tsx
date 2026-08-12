import React, { useState } from 'react';
import { Lock, Bot, Send, Sparkles, User, Shield, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface TicketInternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  isAiGenerated?: boolean;
  body: string;
  createdAt: string;
}

interface TicketInternalNotesWithAiWidgetProps {
  ticketId: string;
  protocolNumber: string;
  notes?: TicketInternalNote[];
  onAddNote?: (note: TicketInternalNote) => void;
  readOnly?: boolean;
}

const INITIAL_NOTES: TicketInternalNote[] = [
  {
    id: 'note_1',
    authorName: 'Bruno Santos',
    authorRole: 'N1 Atendimento',
    body: 'Verifiquei que o serviço de autenticação SSO está respondendo com latência alta. Solicitei apoio do N2.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note_2',
    authorName: 'IA Copiloto ITSM',
    authorRole: 'IA Assistente N2',
    isAiGenerated: true,
    body: '🤖 [IA Resposta Automática]: Latência no SSO geralmente é causada pelo acúmulo de sessões expiradas no Redis. Sugestão: Executar `redis-cli FLUSHDB` no ambiente de homologação ou verificar uso de CPU no pod keycloak.',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
];

export function TicketInternalNotesWithAiWidget({
  ticketId,
  protocolNumber,
  notes = INITIAL_NOTES,
  onAddNote,
  readOnly = false,
}: TicketInternalNotesWithAiWidgetProps) {
  const [internalNotes, setInternalNotes] = useState<TicketInternalNote[]>(notes);
  const [inputNote, setInputNote] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const formattedProtocol = formatTicketProtocol(protocolNumber);
  const isAiMentioned = inputNote.toLowerCase().includes('@ia') || inputNote.toLowerCase().includes('@copilot');

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNote.trim()) return;

    const currentText = inputNote.trim();
    const newOperatorNote: TicketInternalNote = {
      id: `note_${Date.now()}`,
      authorName: 'Bruno Santos (Você)',
      authorRole: 'N1 Atendimento',
      body: currentText,
      createdAt: new Date().toISOString(),
    };

    const updated = [...internalNotes, newOperatorNote];
    setInternalNotes(updated);
    if (onAddNote) onAddNote(newOperatorNote);
    setInputNote('');

    logAuditEvent(
      'TICKET_INTERNAL_NOTE_ADDED',
      `Nota interna confidencial adicionada ao ticket ${formattedProtocol} por Bruno Santos.`
    );

    // Se o operador mencionou @ia ou @copilot
    if (isAiMentioned) {
      setIsAiThinking(true);
      toast.info('🤖 IA Copiloto analisando pergunta interna...');

      setTimeout(() => {
        const queryClean = currentText.replace(/@ia|@copilot/gi, '').trim();

        let aiResponseBody = `🤖 [Resposta IA Copiloto ITSM]: Com base no histórico de chamados e na Base de Conhecimento, para a dúvida "${queryClean || 'suporte técnico'}":\n1. Verifique as credenciais de acesso no servidor de autenticação.\n2. Reinicie o serviço ` +
          `e valide se as portas de rede 443 e 8443 estão abertas.\n3. Caso persistir, escale para a fila N2 de Infraestrutura.`;

        if (queryClean.toLowerCase().includes('impressora') || queryClean.toLowerCase().includes('spooler')) {
          aiResponseBody = `🤖 [Resposta IA Copiloto ITSM]: Para problemas no Spooler de Impressão Windows:\n` +
            `• Abra o PowerShell como Administrador e execute:\n  Stop-Service -Name Spooler\n  Remove-Item -Path "$env:SystemRoot\\System32\\spool\\PRINTERS\\*" -Force\n  Start-Service -Name Spooler`;
        } else if (queryClean.toLowerCase().includes('senha') || queryClean.toLowerCase().includes('sso')) {
          aiResponseBody = `🤖 [Resposta IA Copiloto ITSM]: Para resgate de senha no InstaPasso SSO:\n` +
            `• Acesse o módulo InstaPasso > Usuários > Enviar Link de Redefinição MFA com validade de 15 minutos.`;
        }

        const aiNote: TicketInternalNote = {
          id: `note_ai_${Date.now()}`,
          authorName: 'IA Copiloto ITSM',
          authorRole: 'IA Assistente N2',
          isAiGenerated: true,
          body: aiResponseBody,
          createdAt: new Date().toISOString(),
        };

        setInternalNotes((prev) => [...prev, aiNote]);
        if (onAddNote) onAddNote(aiNote);
        setIsAiThinking(false);

        logAuditEvent(
          'INTERNAL_NOTE_AI_CONSULTED',
          `IA Copiloto respondeu à consulta interna no ticket ${formattedProtocol}.`
        );
        toast.success('🤖 IA Copiloto respondeu à nota interna!');
      }, 1200);
    } else {
      toast.success('Nota interna salva com sucesso (invisível ao cliente).');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Notas Internas Confidenciais & Copiloto IA (@ia)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Invisível para o Cliente
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 066</span>
        </div>
      </div>

      {/* Lista de Notas Internas */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {internalNotes.map((n) => {
          const dateObj = new Date(n.createdAt);
          const timeStr = `${dateObj.toLocaleDateString('pt-BR')} ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

          return (
            <div
              key={n.id}
              className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                n.isAiGenerated
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.isAiGenerated ? (
                    <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-white">{n.authorName}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      n.isAiGenerated
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {n.authorRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{timeStr}</span>
              </div>

              <p className="whitespace-pre-line text-[11px] leading-relaxed pl-6">{n.body}</p>
            </div>
          );
        })}
      </div>

      {/* Input de Nota Interna com dica @ia */}
      {!readOnly && (
        <form onSubmit={handleSendNote} className="space-y-2 pt-1">
          <div className="relative">
            <textarea
              rows={2}
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              placeholder="Escreva uma nota confidencial para a equipe. Digite @ia para consultar a Inteligência Artificial..."
              className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-none pr-10"
            />
            {isAiMentioned && (
              <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-md animate-pulse">
                <Sparkles className="w-3 h-3 text-purple-400" /> @ia Ativado
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-amber-400" /> Dica: Digite <code className="text-amber-300 font-bold">@ia &lt;sua dúvida&gt;</code> para resposta técnica imediata da IA.
            </p>
            <button
              type="submit"
              disabled={!inputNote.trim() || isAiThinking}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Send className="w-3.5 h-3.5" /> Adicionar Nota Confidencial
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
