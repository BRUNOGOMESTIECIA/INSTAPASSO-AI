import React, { useState } from 'react';
import { Mail, Plus, X, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

interface TicketCcObserversWidgetProps {
  ticketId: string;
  protocolNumber: string;
  ccEmails?: string[];
  onUpdateCcEmails?: (emails: string[]) => void;
  readOnly?: boolean;
}

export function TicketCcObserversWidget({
  ticketId,
  protocolNumber,
  ccEmails = [],
  onUpdateCcEmails,
  readOnly = false,
}: TicketCcObserversWidgetProps) {
  const [emails, setEmails] = useState<string[]>(ccEmails);
  const [inputEmail, setInputEmail] = useState('');

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddEmail = () => {
    const trimmed = inputEmail.trim().toLowerCase();
    if (!trimmed) return;

    if (!isValidEmail(trimmed)) {
      toast.error('Por favor, informe um e-mail válido (ex: gestor@empresa.com).');
      return;
    }

    if (emails.includes(trimmed)) {
      toast.warning('Este e-mail já está na lista de observadores.');
      return;
    }

    const updated = [...emails, trimmed];
    setEmails(updated);
    setInputEmail('');

    if (onUpdateCcEmails) {
      onUpdateCcEmails(updated);
    }

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'TICKET_CC_OBSERVER_ADDED',
      `Novo observador CC (${trimmed}) adicionado ao ticket ${formattedProtocol}.`
    );
    toast.success(`Observador ${trimmed} adicionado em cópia no ticket!`);
  };

  const handleRemoveEmail = (target: string) => {
    if (readOnly) return;
    const updated = emails.filter((e) => e !== target);
    setEmails(updated);

    if (onUpdateCcEmails) {
      onUpdateCcEmails(updated);
    }

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'TICKET_CC_OBSERVER_REMOVED',
      `Observador CC (${target}) removido do ticket ${formattedProtocol}.`
    );
    toast.info(`Observador ${target} removido.`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Observadores em Cópia (CC) ({emails.length})
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 061</span>
      </div>

      {/* Input de Adição de E-mail */}
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEmail();
              }
            }}
            placeholder="Adicionar e-mail (ex: gestor@empresa.com)..."
            className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleAddEmail}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      )}

      {/* Lista de Chips / Badges de E-mails CC */}
      {emails.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          Nenhum observador em cópia. Adicione e-mails de gestores para receberem notificações automáticas de status.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
            >
              <UserCheck className="w-3 h-3 text-blue-500" />
              <span>{email}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remover da cópia"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
