import React, { useState, useEffect } from 'react';
import { Clock, Calendar, UserCheck, Edit3, CheckCircle2, Coffee, Moon, Sun, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getOperatorSchedules, updateOperatorSchedule, calculateLiveShiftStatus, getScheduleMetrics, type OperatorWorkSchedule } from '../../lib/operator-work-schedule';
import { toast } from 'sonner';

/**
 * ⏰ Widget do Item 032: Gestão de Horário de Trabalho por Operador
 */
export function OperatorWorkScheduleWidget() {
  const [schedules, setSchedules] = useState<OperatorWorkSchedule[]>([]);
  const [metrics, setMetrics] = useState(getScheduleMetrics());
  const [editingSchedule, setEditingSchedule] = useState<OperatorWorkSchedule | null>(null);

  useEffect(() => {
    loadData();
    // Atualiza o status em tempo real a cada 30 segundos
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    const list = getOperatorSchedules();
    setSchedules(list);
    setMetrics(getScheduleMetrics());
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    try {
      await updateOperatorSchedule(editingSchedule);
      loadData();
      setEditingSchedule(null);
      toast.success(`Jornada de '${editingSchedule.operatorName}' atualizada com sucesso!`);
    } catch (err) {
      toast.error('Erro ao salvar escala de trabalho.');
    }
  };

  const handleToggleDay = (day: string) => {
    if (!editingSchedule) return;
    const days = editingSchedule.workDays.includes(day)
      ? editingSchedule.workDays.filter((d) => d !== day)
      : [...editingSchedule.workDays, day];
    setEditingSchedule({ ...editingSchedule, workDays: days });
  };

  const DAYS_LIST = [
    { key: 'seg', label: 'Seg' },
    { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' },
    { key: 'sab', label: 'Sáb' },
    { key: 'dom', label: 'Dom' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Gestão de Horário de Trabalho por Operador
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Item 032
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escala contratual (Manhã, Tarde, 12x36), horário de almoço e bloqueio automático fora do expediente.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-cyan-400">
          Trava de Expediente: ATIVA
        </span>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Em Jornada de Trabalho</p>
              <p className="text-sm font-black text-emerald-400">{metrics.inShiftCount} Operadores</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Coffee className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Em Almoço</p>
              <p className="text-sm font-black text-amber-300">{metrics.inLunchCount} Pausados</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-rose-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fora do Expediente</p>
              <p className="text-sm font-black text-rose-300">{metrics.outOfShiftCount} Desconectados</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Política Auto-Offline</p>
              <p className="text-sm font-black text-slate-200">{metrics.autoOfflinePolicyCount} Atendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Escalas de Trabalho dos Operadores */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Escalas Contratuais e Presença ao Vivo
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Atualizado a cada 30s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Atendente / Cargo</th>
                <th className="py-2.5 px-4">Turno Contratual</th>
                <th className="py-2.5 px-4">Dias de Trabalho</th>
                <th className="py-2.5 px-4">Expediente & Almoço</th>
                <th className="py-2.5 px-4">Status ao Vivo</th>
                <th className="py-2.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {schedules.map((s) => {
                const live = calculateLiveShiftStatus(s);
                return (
                  <tr key={s.operatorId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{s.operatorName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.role}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-cyan-300">
                      {s.shiftName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {DAYS_LIST.map((d) => (
                          <span
                            key={d.key}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              s.workDays.includes(d.key)
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-900 text-slate-600'
                            }`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-slate-200">⏰ {s.startHour} às {s.endHour}</div>
                      <div className="text-amber-400 text-[10px]">☕ Almoço: {s.lunchStart} às {s.lunchEnd}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${live.badgeColor}`}>
                        {live.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingSchedule(s)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all ml-auto cursor-pointer border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        Editar Jornada
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição de Jornada de Trabalho */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveSchedule} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h4 className="font-extrabold text-base text-white">Editar Jornada: {editingSchedule.operatorName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Perfil do Turno Contratual</label>
                <select
                  value={editingSchedule.shiftName}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, shiftName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="Turno Integral (08h às 17h)">Turno Integral (08h às 17h)</option>
                  <option value="Turno Manhã (08h às 17h)">Turno Manhã (08h às 17h)</option>
                  <option value="Turno Tarde/Noite (13h às 22h)">Turno Tarde/Noite (13h às 22h)</option>
                  <option value="Escala 12x36 (07h às 19h)">Escala 12x36 (07h às 19h)</option>
                  <option value="Plantão Noturno (22h às 07h)">Plantão Noturno (22h às 07h)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Dias de Trabalho da Semana</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_LIST.map((d) => {
                    const isSelected = editingSchedule.workDays.includes(d.key);
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => handleToggleDay(d.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Horário de Início (Expediente)</label>
                  <input
                    type="time"
                    value={editingSchedule.startHour}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startHour: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Horário de Fim (Expediente)</label>
                  <input
                    type="time"
                    value={editingSchedule.endHour}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endHour: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Início da Pausa Almoço</label>
                  <input
                    type="time"
                    value={editingSchedule.lunchStart}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, lunchStart: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Fim da Pausa Almoço</label>
                  <input
                    type="time"
                    value={editingSchedule.lunchEnd}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, lunchEnd: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Ação ao Bater Fim do Expediente</label>
                <select
                  value={editingSchedule.outOfShiftBehavior}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, outOfShiftBehavior: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="AUTO_OFFLINE">🔒 Auto-Offline (Desconectar Fila de Chat Automaticamente)</option>
                  <option value="WARN_SUPERVISOR">⚠️ Warn Supervisor (Notificar Supervisão de Hora Extra)</option>
                  <option value="ALLOW_EMERGENCY">🚨 Allow Emergency (Permitir Apenas Chamados Críticos)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Salvar Jornada
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
