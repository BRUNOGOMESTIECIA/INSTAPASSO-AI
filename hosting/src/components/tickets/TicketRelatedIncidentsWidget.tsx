import React, { useState } from 'react';
import { GitMerge, Link2, Plus, Unlink, CheckCircle2, AlertTriangle, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface SimpleTicketSummary {
  id: string;
  number: string;
  title: string;
  requesterName: string;
  status: string;
}

interface TicketRelatedIncidentsWidgetProps {
  ticketId: string;
  protocolNumber: string;
  isParent?: boolean;
  parentTicketId?: string;
  parentProtocolNumber?: string;
  childTickets?: SimpleTicketSummary[];
  allAvailableTickets?: SimpleTicketSummary[];
  onLinkChildTicket?: (childId: string) => void;
  onUnlinkChildTicket?: (childId: string) => void;
  onLinkToParentTicket?: (parentId: string) => void;
  onBulkResolveChildren?: () => void;
  readOnly?: boolean;
}

const MOCK_CHILD_TICKETS: SimpleTicketSummary[] = [
  { id: 't_rel_1', number: '1049', title: 'Não consigo acessar o ERP no setor Financeiro', requesterName: 'Mariana Lima', status: 'in_progress' },
  { id: 't_rel_2', number: '1052', title: 'Erro ao emitir Nota Fiscal de Venda', requesterName: 'Carlos Eduardo', status: 'open' },
];

const MOCK_AVAILABLE_TICKETS: SimpleTicketSummary[] = [
  { id: 't_rel_3', number: '1055', title: 'Queda de conexão no módulo de Vendas', requesterName: 'Fernanda Rocha', status: 'open' },
  { id: 't_rel_4', number: '1058', title: 'Lentidão generalizada no banco de dados', requesterName: 'Roberto Alves', status: 'in_progress' },
];

export function TicketRelatedIncidentsWidget({
  ticketId,
  protocolNumber,
  isParent = true,
  parentTicketId,
  parentProtocolNumber = '1040',
  childTickets = MOCK_CHILD_TICKETS,
  allAvailableTickets = MOCK_AVAILABLE_TICKETS,
  onLinkChildTicket,
  onUnlinkChildTicket,
  onLinkToParentTicket,
  onBulkResolveChildren,
  readOnly = false,
}: TicketRelatedIncidentsWidgetProps) {
  const [children, setChildren] = useState<SimpleTicketSummary[]>(childTickets);
  const [available, setAvailable] = useState<SimpleTicketSummary[]>(allAvailableTickets);
  const [selectedToLink, setSelectedToLink] = useState<string>('');
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);

  const formattedProtocol = formatTicketProtocol(protocolNumber);

  const handleAddChild = () => {
    if (!selectedToLink) return;
    const found = available.find((t) => t.id === selectedToLink);
    if (!found) return;

    const updatedChildren = [...children, found];
    const updatedAvailable = available.filter((t) => t.id !== selectedToLink);

    setChildren(updatedChildren);
    setAvailable(updatedAvailable);
    setSelectedToLink('');
    setIsLinkingModalOpen(false);

    if (onLinkChildTicket) onLinkChildTicket(found.id);

    const childProtocol = formatTicketProtocol(found.number);
    logAuditEvent(
      'TICKET_LINKED_TO_PARENT',
      `Ticket filho ${childProtocol} foi vinculado ao Ticket Mãe / Causa Raiz ${formattedProtocol}.`
    );
    toast.success(`Ticket ${childProtocol} vinculado com sucesso a esta Causa Raiz!`);
  };

  const handleRemoveChild = (childId: string) => {
    if (readOnly) return;
    const target = children.find((c) => c.id === childId);
    if (!target) return;

    setChildren(children.filter((c) => c.id !== childId));
    setAvailable([...available, target]);

    if (onUnlinkChildTicket) onUnlinkChildTicket(childId);

    const childProtocol = formatTicketProtocol(target.number);
    logAuditEvent(
      'TICKET_UNLINKED_FROM_PARENT',
      `Ticket filho ${childProtocol} desvinculado da Causa Raiz ${formattedProtocol}.`
    );
    toast.info(`Ticket ${childProtocol} desvinculado.`);
  };

  const handleBulkResolve = () => {
    if (children.length === 0) return;

    const updatedChildren = children.map((c) => ({ ...c, status: 'resolved' }));
    setChildren(updatedChildren);

    if (onBulkResolveChildren) onBulkResolveChildren();

    logAuditEvent(
      'TICKET_BULK_RESOLVE_CHILDREN',
      `Resolução em massa executada! ${children.length} tickets vinculados à Causa Raiz ${formattedProtocol} foram encerrados.`
    );
    toast.success(`🎉 ${children.length} tickets vinculados foram resolvidos automaticamente!`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Tickets Relacionados & Causa Raiz ({children.length})
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {parentTicketId ? (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> Incidente Filho
            </span>
          ) : (
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
              👑 Causa Raiz (Ticket Mãe)
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 059</span>
        </div>
      </div>

      {/* Se o ticket atual for um Ticket Filho vinculado a um Ticket Mãe */}
      {parentTicketId ? (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Este chamado está vinculado à Causa Raiz #{parentProtocolNumber}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Ao encerrar a Causa Raiz central, este ticket será resolvido automaticamente.
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => toast.info(`Navegando para o chamado pai #${parentProtocolNumber}...`)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Ver Ticket Mãe <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Se o ticket atual for Causa Raiz (Ticket Mãe) */
        <div className="space-y-3">
          {/* Bar de Ações do Ticket Mãe */}
          {!readOnly && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsLinkingModalOpen(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Vincular Chamado Afetado
              </button>

              {children.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkResolve}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolver Todos ({children.length})
                </button>
              )}
            </div>
          )}

          {/* Modal / Inclusão rápida de vinculação */}
          {isLinkingModalOpen && (
            <div className="p-3 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 rounded-xl space-y-2 animate-in fade-in duration-150 shadow-md">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Selecione o chamado para vincular como incidente filho desta Causa Raiz:
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedToLink}
                  onChange={(e) => setSelectedToLink(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                >
                  <option value="">Selecione um chamado da fila...</option>
                  {available.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.number} — {t.title} ({t.requesterName})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddChild}
                  disabled={!selectedToLink}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  Vincular
                </button>
                <button
                  type="button"
                  onClick={() => setIsLinkingModalOpen(false)}
                  className="px-2.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Chamados Filhos Vinculados */}
          {children.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Nenhum chamado vinculado a esta Causa Raiz. Clique em "Vincular Chamado Afetado" para conectar incidentes correlacionados.
            </p>
          ) : (
            <div className="space-y-2">
              {children.map((child) => {
                const childFormatted = formatTicketProtocol(child.number);
                const isResolved = child.status === 'resolved' || child.status === 'closed';
                return (
                  <div
                    key={child.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isResolved
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                          {childFormatted}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">• Solicitante: {child.requesterName}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isResolved
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isResolved ? 'Resolvido' : 'Em andamento'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold truncate">{child.title}</p>
                    </div>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(child.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 cursor-pointer"
                        title="Desvincular chamado"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
