import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface TicketChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  assignedTo?: string;
}

interface TicketChecklistWidgetProps {
  ticketId: string;
  protocolNumber: string;
  items?: TicketChecklistItem[];
  onUpdateChecklist?: (newItems: TicketChecklistItem[]) => void;
  readOnly?: boolean;
}

const DEFAULT_CHECKLIST_TEMPLATE: TicketChecklistItem[] = [
  { id: 'chk_1', label: 'Diagnosticar causa raiz do incidente / solicitação', completed: true },
  { id: 'chk_2', label: 'Validar permissões e credenciais de acesso no AD / SSO', completed: true },
  { id: 'chk_3', label: 'Executar testes de bancada ou ambiente de homologação', completed: false },
  { id: 'chk_4', label: 'Registrar evidências da solução nas notas internas', completed: false },
  { id: 'chk_5', label: 'Confirmar resolução e obter aceite formal do usuário', completed: false },
];

export function TicketChecklistWidget({
  ticketId,
  protocolNumber,
  items = DEFAULT_CHECKLIST_TEMPLATE,
  onUpdateChecklist,
  readOnly = false,
}: TicketChecklistWidgetProps) {
  const [checklist, setChecklist] = useState<TicketChecklistItem[]>(items);
  const [newItemText, setNewItemText] = useState('');

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (itemId: string) => {
    if (readOnly) return;
    const updated = checklist.map((item) => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    setChecklist(updated);
    if (onUpdateChecklist) onUpdateChecklist(updated);

    const targetItem = updated.find((i) => i.id === itemId);
    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'TICKET_CHECKLIST_ITEM_TOGGLED',
      `Item do checklist "${targetItem?.label}" ${targetItem?.completed ? 'concluído' : 'desmarcado'} no ticket ${formattedProtocol}.`
    );
  };

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    const newItem: TicketChecklistItem = {
      id: `chk_${Date.now()}`,
      label: trimmed,
      completed: false,
    };

    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewItemText('');

    if (onUpdateChecklist) onUpdateChecklist(updated);

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'TICKET_CHECKLIST_ITEM_ADDED',
      `Nova tarefa interna "${trimmed}" adicionada ao checklist do ticket ${formattedProtocol}.`
    );
    toast.success('Nova tarefa interna adicionada ao checklist!');
  };

  const handleRemoveItem = (itemId: string) => {
    if (readOnly) return;
    const updated = checklist.filter((i) => i.id !== itemId);
    setChecklist(updated);
    if (onUpdateChecklist) onUpdateChecklist(updated);

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    logAuditEvent(
      'TICKET_CHECKLIST_ITEM_REMOVED',
      `Item do checklist removido do ticket ${formattedProtocol}.`
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5">
      {/* Header com Progresso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Checklist de Tarefas Internas ({completedCount}/{totalCount})
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black font-mono px-2 py-0.5 rounded-full ${
              progressPercent === 100
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}
          >
            {progressPercent}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 062</span>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Input para adicionar nova tarefa */}
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder="Adicionar nova subtarefa técnica..."
            className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      )}

      {/* Lista de Itens do Checklist */}
      <div className="space-y-1.5 pt-1">
        {checklist.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Nenhuma tarefa cadastrada no checklist.</p>
        ) : (
          checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                item.completed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-600 dark:text-slate-400 line-through'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs font-medium truncate">{item.label}</span>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors shrink-0"
                  title="Remover tarefa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Alerta de bloqueio caso pendente */}
      {completedCount < totalCount && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Existem {totalCount - completedCount} tarefas pendentes. É altamente recomendável concluir todo o checklist antes de resolver o chamamento.
          </span>
        </div>
      )}
    </div>
  );
}
