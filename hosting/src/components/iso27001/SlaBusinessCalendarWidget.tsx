import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { getBusinessHoursConfig, saveBusinessHoursConfig, isSlaPausedNow, type BusinessHoursConfig, type SlaPauseInfo } from '../../lib/business-hours-sla';
import { logAuditEvent } from '../../lib/audit-logger';

export function SlaBusinessCalendarWidget() {
  const [config, setConfig] = useState<BusinessHoursConfig>(getBusinessHoursConfig());
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  const handleToggleDay = (dayIndex: number) => {
    const updatedSchedule = config.schedule.map((s) =>
      s.dayIndex === dayIndex ? { ...s, active: !s.active } : s
    );
    const newConfig = { ...config, schedule: updatedSchedule };
    setConfig(newConfig);
    saveBusinessHoursConfig(newConfig);
    toast.success('Horário alterado com sucesso!');
  };

  const handleHourChange = (dayIndex: number, field: 'startHour' | 'endHour', val: number) => {
    const updatedSchedule = config.schedule.map((s) =>
      s.dayIndex === dayIndex ? { ...s, [field]: val } : s
    );
    const newConfig = { ...config, schedule: updatedSchedule };
    setConfig(newConfig);
    saveBusinessHoursConfig(newConfig);
  };

  const handleToggleAutoCollapse = () => {
    const newConfig = {
      ...config,
      autoCollapseChatOutsideHours: !config.autoCollapseChatOutsideHours,
    };
    setConfig(newConfig);
    saveBusinessHoursConfig(newConfig);
    toast.success(
      newConfig.autoCollapseChatOutsideHours
        ? 'Auto-colapso do chat fora do expediente ATIVADO!'
        : 'Auto-colapso do chat DESATIVADO!'
    );

    logAuditEvent(
      'AUTO_COLLAPSE_CHAT_CONFIG',
      `Auto-colapso do chat fora do expediente alterado para: ${newConfig.autoCollapseChatOutsideHours ? 'ATIVADO' : 'DESATIVADO'}`
    );
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) {
      toast.error('Informe a data e o nome do feriado corporativo.');
      return;
    }

    if (config.holidays.includes(newDate)) {
      toast.warning('Esta data já está cadastrada como feriado.');
      return;
    }

    const updatedHolidays = [...config.holidays, newDate].sort();
    const newConfig = { ...config, holidays: updatedHolidays };
    setConfig(newConfig);
    saveBusinessHoursConfig(newConfig);
    setNewDate('');
    setNewName('');

    logAuditEvent(
      'SLA_HOLIDAY_ADDED',
      `Novo feriado corporativo "${newName.trim()}" (${newDate}) adicionado.`
    );
    toast.success(`Feriado "${newName.trim()}" adicionado!`);
  };

  const handleDeleteHoliday = (dateStr: string) => {
    const updatedHolidays = config.holidays.filter((h) => h !== dateStr);
    const newConfig = { ...config, holidays: updatedHolidays };
    setConfig(newConfig);
    saveBusinessHoursConfig(newConfig);
    toast.info('Feriado removido do calendário.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Horário Comercial & Auto-Colapso do Chat
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure os dias e horas de atendimento. O chat recolhe e avisa o cliente fora deste horário.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Auto-Colapso do Chat
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {config.autoCollapseChatOutsideHours ? 'Ativo (Recolhe fora das horas)' : 'Desativado'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoCollapse}
            className="text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform cursor-pointer"
          >
            {config.autoCollapseChatOutsideHours ? (
              <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" /> Grade Semanal de Atendimento (Dias e Horas)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {config.schedule.map((day) => (
            <div
              key={day.dayIndex}
              className={`p-3 rounded-xl border transition-all ${
                day.active
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {day.dayName}
                </span>
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={() => handleToggleDay(day.dayIndex)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {day.active ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mb-0.5">Início</label>
                    <select
                      value={day.startHour}
                      onChange={(e) => handleHourChange(day.dayIndex, 'startHour', parseInt(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-slate-800 dark:text-slate-200"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00h
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mb-0.5">Fim</label>
                    <select
                      value={day.endHour}
                      onChange={(e) => handleHourChange(day.dayIndex, 'endHour', parseInt(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-slate-800 dark:text-slate-200"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00h
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fechado</span>
                  <span className="text-[10px] text-slate-400">Sem atendimento</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Feriados Nacionais & Folgas Corporativas ({config.holidays.length})
          </h4>
        </div>

        {/* Form de Adição */}
        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do feriado ou folga (ex: Feriado Municipal)..."
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Feriado
          </button>
        </form>

        {/* Grid de Cards de Feriados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 max-h-48 overflow-y-auto pr-1">
          {config.holidays.map((hDate) => {
            const parts = hDate.split('-');
            if (parts.length < 3) return null;
            const [yyyy, mm, dd] = parts;
            return (
              <div
                key={hDate}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0 pr-1">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block text-[11px]">
                    {dd}/{mm}/{yyyy}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                    Feriado / Folga
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteHoliday(hDate)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                  title="Remover feriado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
