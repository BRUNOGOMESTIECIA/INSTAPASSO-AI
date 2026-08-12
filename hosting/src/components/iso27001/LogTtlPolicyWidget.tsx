import React from 'react';
import { useLogTtlPolicy } from '../../hooks/use-log-ttl-policy';
import { Clock, ShieldCheck, Trash2, RefreshCw, CheckCircle2, Database, AlertCircle } from 'lucide-react';

export function LogTtlPolicyWidget() {
  const { config, saveTtlPolicy, executeManualPurge } = useLogTtlPolicy();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Política de Expiração (TTL) de Logs no Banco (Item 105)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Regras de retenção legal e expurgo automático (Marco Civil da Internet Art. 15 / ISO 27001)
            </p>
          </div>
        </div>

        <button
          onClick={executeManualPurge}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Executar Purge de Logs Expirados
        </button>
      </div>

      {/* Cards de Métricas e Retenção */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Período de Retenção Ativo</span>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">{config.retentionMonths} Meses</p>
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            🟢 Marco Civil Art. 15 Conforme
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Último Expurgo de Logs</span>
          <p className="text-sm font-black text-slate-800 dark:text-slate-200">
            {new Date(config.lastPurgeDateIso).toLocaleDateString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {new Date(config.lastPurgeDateIso).toLocaleTimeString('pt-BR')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Registros Limpos no Total</span>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {config.purgedRecordsCount.toLocaleString('pt-BR')} registros
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            ⚡ Otimização do Banco de Dados
          </span>
        </div>
      </div>

      {/* Seletor do Período Tolerado de Retenção */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Selecione o Prazo de Guardagem de Logs de Auditoria
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {[
            { months: 6, label: '6 Meses (Mínimo Marco Civil)' },
            { months: 12, label: '12 Meses (1 Ano Padrão)' },
            { months: 24, label: '24 Meses (2 Anos ISO 27001)' },
            { months: 36, label: '36 Meses (3 Anos Estendido)' },
          ].map((item) => {
            const isSelected = config.retentionMonths === item.months;
            return (
              <button
                key={item.months}
                onClick={() => saveTtlPolicy(item.months, config.autoPurgeEnabled)}
                className={`p-3 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.months} Meses</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className="text-[10px] opacity-80 font-normal">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
