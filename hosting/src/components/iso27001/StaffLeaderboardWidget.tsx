import React, { useState } from 'react';
import { Trophy, Award, Star, CheckCircle2, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { MOCK_STAFF } from '../../mocks/data';
import { useTickets } from '../../hooks/use-tickets';

interface LeaderboardItem {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  ticketsResolved: number;
  slaPercent: number;
  csatRating: number;
  avgResponseMins: number;
  badgeTitle?: string;
}

export function StaffLeaderboardWidget() {
  const { tickets } = useTickets();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Calcula performance com base na lista de staff e tickets
  const leaderboardData: LeaderboardItem[] = MOCK_STAFF.map((staff, index) => {
    // Tickets do operador
    const staffTickets = tickets.filter(t => t.assigneeName === staff.name || (t as any).assigneeId === staff.id);
    const resolved = staffTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    // Cálculo simulado/dinâmico de SLA e CSAT com variação por atendente
    const baseSla = 92 + (index % 3) * 3; 
    const baseCsat = Number((4.6 + (index % 4) * 0.1).toFixed(1));
    const baseMins = 12 + index * 3;

    let badgeTitle;
    if (index === 0) badgeTitle = '👑 Campeão do Mês';
    else if (index === 1) badgeTitle = '⚡ Mestre em SLA';
    else if (index === 2) badgeTitle = '⭐ CSAT Nota 5';

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role || 'Técnico N1',
      ticketsResolved: resolved > 0 ? resolved : 14 + (5 - index) * 3,
      slaPercent: Math.min(100, baseSla),
      csatRating: Math.min(5, baseCsat),
      avgResponseMins: baseMins,
      badgeTitle,
    };
  }).sort((a, b) => (b.ticketsResolved * 0.4 + b.slaPercent * 0.4 + b.csatRating * 10) - (a.ticketsResolved * 0.4 + a.slaPercent * 0.4 + a.csatRating * 10));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Cabeçalho do Leaderboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Leaderboard de Desempenho dos Atendentes
              <span className="text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                PRODUTIVIDADE & CSAT
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranking consolidado de tickets resolvidos, cumprimento de SLA e avaliações de clientes.
            </p>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg transition-all ${period === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900'}`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${period === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900'}`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-all ${period === 'quarter' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900'}`}
          >
            Trimestre
          </button>
        </div>
      </div>

      {/* Lista de Atendentes */}
      <div className="space-y-3">
        {leaderboardData.map((item, index) => {
          const isPodium = index < 3;
          let rankBadgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
          let rankIcon = `#${index + 1}`;

          if (index === 0) {
            rankBadgeClass = 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700';
            rankIcon = '🥇 1º';
          } else if (index === 1) {
            rankBadgeClass = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
            rankIcon = '🥈 2º';
          } else if (index === 2) {
            rankBadgeClass = 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700';
            rankIcon = '🥉 3º';
          }

          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                isPodium
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              {/* Informações do Atendente */}
              <div className="flex items-center gap-3 min-w-0">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex-shrink-0 ${rankBadgeClass}`}>
                  {rankIcon}
                </span>

                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                  {item.name[0]}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                    {item.badgeTitle && (
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        {item.badgeTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.role}</p>
                </div>
              </div>

              {/* Métricas Principais */}
              <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
                
                {/* Tickets Resolvidos */}
                <div className="text-center sm:text-right">
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center justify-center sm:justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {item.ticketsResolved}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Resolvidos</p>
                </div>

                {/* SLA % */}
                <div className="text-center sm:text-right">
                  <p className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    {item.slaPercent}%
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">SLA Cumprido</p>
                </div>

                {/* CSAT ⭐ */}
                <div className="text-center sm:text-right">
                  <p className="font-black text-amber-500 text-sm flex items-center justify-center sm:justify-end gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {item.csatRating}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Média CSAT</p>
                </div>

                {/* Tempo Médio */}
                <div className="hidden md:block text-right">
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.avgResponseMins} min
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">1ª Resposta</p>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
