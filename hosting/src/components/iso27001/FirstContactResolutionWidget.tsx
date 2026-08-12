import React from 'react';
import { Target, CheckCircle2, AlertCircle, ArrowUpRight, Award, MessageCircle, Globe, Mail } from 'lucide-react';
import { ChartExportButton } from '../../components/reports/ChartExportButton';

export function FirstContactResolutionWidget() {
  const fcrMetrics = {
    globalFcrPercent: 82.4,
    targetPercent: 80.0,
    totalFirstContactResolved: 1420,
    totalTickets: 1723,
    channels: [
      { name: 'Chat Ao Vivo', icon: MessageCircle, percent: 89.2, total: 650, color: 'text-blue-500' },
      { name: 'Portal do Cliente', icon: Globe, percent: 78.5, total: 720, color: 'text-indigo-500' },
      { name: 'E-mail Corporativo', icon: Mail, percent: 72.1, total: 353, color: 'text-amber-500' },
    ],
    categories: [
      { category: 'Acessos & Senhas (SSO)', percent: 96.5, count: 480, status: 'excelente' },
      { category: 'Sistemas & ERP', percent: 78.2, count: 510, status: 'bom' },
      { category: 'Redes & VPN', percent: 68.4, count: 320, status: 'atencao' },
      { category: 'Impressoras & Hardware', percent: 84.1, count: 413, status: 'bom' },
    ],
  };

  const isTargetMet = fcrMetrics.globalFcrPercent >= fcrMetrics.targetPercent;

  return (
    <div id="fcr-chart-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Resolução no 1º Contato (First Contact Resolution - FCR)
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 084
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Métrica de eficiência que mede chamados resolvidos na 1ª resposta sem necessidade de réplica ou transbordo.
            </p>
          </div>
        </div>

        {/* Target Met Badge & Download HD Button */}
        <div className="flex items-center gap-2 shrink-0">
          <ChartExportButton elementId="fcr-chart-container" chartTitle="Metricas_FCR_First_Contact" />

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
              isTargetMet
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isTargetMet ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span>Meta FCR (80%): {isTargetMet ? 'Superada! 🎉' : 'Abaixo da Meta'}</span>
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Global FCR Rate Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
            <span>Índice FCR Global</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
              {fcrMetrics.globalFcrPercent}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.2% vs mês anterior
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {fcrMetrics.totalFirstContactResolved} de {fcrMetrics.totalTickets} chamados encerrados na 1ª interação.
          </p>
        </div>

        {/* FCR por Canal de Atendimento */}
        <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
            FCR por Canal de Entrada:
          </span>
          <div className="grid grid-cols-3 gap-3">
            {fcrMetrics.channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.name} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Icon className={`w-3.5 h-3.5 ${ch.color}`} />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">{ch.percent}%</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{ch.total} tks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de FCR por Categoria de Serviço */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Desempenho de Resolução por Categoria de Serviço
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {fcrMetrics.categories.map((cat) => (
            <div
              key={cat.category}
              className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-1" title={cat.category}>
                  {cat.category}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                    cat.status === 'excelente'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : cat.status === 'bom'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {cat.percent}% FCR
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cat.percent >= 90 ? 'bg-emerald-500' : cat.percent >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
