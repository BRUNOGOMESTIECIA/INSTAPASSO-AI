import React from 'react';
import { useLgpdAnonymization } from '../../hooks/use-lgpd-anonymization';
import { UserX, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export function LgpdUserAnonymizationWidget() {
  const { users, runBatchAnonymization, pendingUsersCount, anonymizedUsersCount } = useLgpdAnonymization();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Anonimização Automática de Usuários Inativos (Item 104)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rotina em lote (LGPD Art. 16) para remoção de dados pessoais inativos (+730 dias) mantendo o histórico de tickets
            </p>
          </div>
        </div>

        <button
          onClick={runBatchAnonymization}
          disabled={pendingUsersCount === 0}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Executar Batch Purge LGPD
        </button>
      </div>

      {/* Resumo de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Cadastros Inativos (+2 anos)</span>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">{users.length} usuários</p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400">Pendentes de Anonimização</span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400">{pendingUsersCount} pendentes</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">Anonimizados com Sucesso</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{anonymizedUsersCount} concluídos</p>
        </div>
      </div>

      {/* Lista de Usuários Inativos Elegíveis */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Usuários Elegíveis para Retenção & Purge LGPD Art. 16
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nome do Usuário</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Inatividade</th>
                <th className="py-3 px-4">Tickets Preservados</th>
                <th className="py-3 px-4 text-right">Status LGPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {item.email}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {item.company}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    ⏱️ {item.daysInactive} dias
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {item.ticketsCount} tickets mantidos
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.isAnonymized ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Anonimizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" /> Elegível Purge
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
