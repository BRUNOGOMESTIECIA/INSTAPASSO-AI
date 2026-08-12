import React from 'react';
import { History, ShieldCheck, User, Clock, ArrowRight, Eye, RefreshCw, FileEdit } from 'lucide-react';
import { formatTicketProtocol } from '../../lib/audit-logger';

export interface TicketFieldChangeLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole?: string;
  fieldChanged: string; // Ex: 'Status', 'Prioridade', 'Responsável', 'Categoria'
  oldValue?: string;
  newValue: string;
  ipAddress?: string;
}

interface TicketAuditLogTrailWidgetProps {
  ticketId: string;
  protocolNumber: string;
  auditLogs?: TicketFieldChangeLog[];
}

const DEFAULT_AUDIT_LOGS: TicketFieldChangeLog[] = [
  {
    id: 'aud_1',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    userName: 'Sistema (InstaPasso Bot)',
    fieldChanged: 'Abertura do Ticket',
    newValue: 'Ticket criado via Portal do Cliente',
    ipAddress: '187.52.190.44',
  },
  {
    id: 'aud_2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userName: 'IA Copiloto ITSM',
    fieldChanged: 'Categoria (Sugerido por IA)',
    oldValue: 'Indefinido',
    newValue: 'Sistemas > ERP',
    ipAddress: '10.0.4.12 (IA Edge)',
  },
  {
    id: 'aud_3',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    userName: 'Bruno Santos',
    userRole: 'N1 Atendimento',
    fieldChanged: 'Status',
    oldValue: 'Novo',
    newValue: 'Em andamento',
    ipAddress: '187.52.190.44',
  },
  {
    id: 'aud_4',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userName: 'Bruno Santos',
    userRole: 'N1 Atendimento',
    fieldChanged: 'Prioridade',
    oldValue: 'Média',
    newValue: 'Alta',
    ipAddress: '187.52.190.44',
  },
];

export function TicketAuditLogTrailWidget({
  ticketId,
  protocolNumber,
  auditLogs = DEFAULT_AUDIT_LOGS,
}: TicketAuditLogTrailWidgetProps) {
  const formattedProtocol = formatTicketProtocol(protocolNumber);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Trilha de Auditoria & Alterações de Campos (Audit Log)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ISO 27001 Imutável
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 060</span>
        </div>
      </div>

      {/* Linha do Tempo de Audit Log */}
      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 pl-4 pt-1">
        {auditLogs.map((log) => {
          const dateObj = new Date(log.timestamp);
          const timeFormatted = `${dateObj.toLocaleDateString('pt-BR')} ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

          return (
            <div key={log.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.userName}
                    </span>
                    {log.userRole && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {log.userRole}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeFormatted}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium pt-0.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <FileEdit className="w-3 h-3" /> Campo Alterado: {log.fieldChanged}
                  </span>
                </div>

                {/* Diff antes x depois */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 text-[11px]">
                  {log.oldValue && (
                    <>
                      <span className="text-slate-400 line-through truncate max-w-[150px]">{log.oldValue}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </>
                  )}
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{log.newValue}</span>
                </div>

                {log.ipAddress && (
                  <div className="text-[9px] font-mono text-slate-400 pt-0.5">
                    Carimbo Digital: {log.ipAddress} | Protocolo: {formattedProtocol}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
