import React, { useState } from 'react';
import { Star, TrendingUp, Award, ThumbsUp, Filter, BarChart3, ArrowUpRight } from 'lucide-react';
import { ChartExportButton } from '../../components/reports/ChartExportButton';

export function CsatTrendWidget() {
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'n1' | 'n2'>('all');

  const monthlyData = [
    { month: 'Fev/26', score: 4.65, count: 320, positivePercent: 94 },
    { month: 'Mar/26', score: 4.72, count: 410, positivePercent: 95 },
    { month: 'Abr/26', score: 4.68, count: 385, positivePercent: 94 },
    { month: 'Mai/26', score: 4.81, count: 450, positivePercent: 97 },
    { month: 'Jun/26', score: 4.88, count: 512, positivePercent: 98 },
    { month: 'Jul/26', score: 4.93, count: 548, positivePercent: 99 },
  ];

  const ratingDistribution = [
    { stars: 5, label: '5 Estrelas (Excelente)', percent: 92, count: 504, color: 'bg-emerald-500' },
    { stars: 4, label: '4 Estrelas (Bom)', percent: 6, count: 33, color: 'bg-blue-500' },
    { stars: 3, label: '3 Estrelas (Regular)', percent: 1.5, count: 8, color: 'bg-amber-500' },
    { stars: 2, label: '2 Estrelas (Ruim)', percent: 0.3, count: 2, color: 'bg-orange-500' },
    { stars: 1, label: '1 Estrela (Péssimo)', percent: 0.2, count: 1, color: 'bg-rose-500' },
  ];

  return (
    <div id="csat-trend-chart-container" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Evolução Mensal de CSAT (Item 129)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Índice de satisfação do cliente acumulado nos últimos 6 meses
              </p>
            </div>
          </div>
        </div>

        {/* Filtros de Equipe & Botão Baixar Imagem HD (Item 085) */}
        <div className="flex flex-wrap items-center gap-2">
          <ChartExportButton elementId="csat-trend-chart-container" chartTitle="Evolucao_Mensal_CSAT" />

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedTeam('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTeam === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Todas as Equipes
            </button>
            <button
              onClick={() => setSelectedTeam('n1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTeam === 'n1'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Suporte N1
            </button>
            <button
              onClick={() => setSelectedTeam('n2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTeam === 'n2'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Infra N2
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
            <span>Nota Média Atual</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900 dark:text-amber-100">4.93</span>
            <span className="text-xs text-amber-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +0.28 vs Fev
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>Avaliações Positivas</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">98.4%</span>
            <span className="text-xs text-emerald-600 font-bold">537 de 548</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            Acima da meta corporativa de 95%
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
            <span>Total de Respostas</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900 dark:text-blue-100">2.615</span>
            <span className="text-xs text-blue-600 font-bold">Taxa de resposta: 84%</span>
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-medium">
            Pesquisa enviada ao encerrar cada chat
          </p>
        </div>
      </div>

      {/* Gráfico Visual de Barras de Evolução Mensal */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tendência Mensal (Média de Satisfação)
        </h4>
        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          {monthlyData.map((m, idx) => {
            const heightPercent = Math.max(20, ((m.score - 4) / 1) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                  ⭐ {m.score.toFixed(2)}
                </span>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição de Notas (Estrelas) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Distribuição por Nível de Estrelas (Julho / 2026)
        </h4>
        <div className="space-y-2">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="w-36 font-semibold text-slate-700 dark:text-slate-300 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="w-16 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                {item.percent}% ({item.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
