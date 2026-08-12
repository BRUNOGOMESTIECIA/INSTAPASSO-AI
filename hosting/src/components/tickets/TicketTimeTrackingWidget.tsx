import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Plus, History, User, Calendar, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface TimeEntry {
  id: string;
  technicianName: string;
  activityType: string;
  durationMinutes: number;
  description: string;
  createdAt: string;
}

interface TicketTimeTrackingWidgetProps {
  ticketId: string;
  protocolNumber: string;
  technicianName?: string;
  timeEntries?: TimeEntry[];
  onUpdateTimeEntries?: (entries: TimeEntry[]) => void;
  readOnly?: boolean;
}

const DEFAULT_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 't_1',
    technicianName: 'Bruno Santos (N1)',
    activityType: 'Análise de Logs & Diagnóstico',
    durationMinutes: 45,
    description: 'Análise detalhada do log de erros do servidor ERP e consulta à base de conhecimento.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 't_2',
    technicianName: 'Bruno Santos (N1)',
    activityType: 'Atendimento & Homologação',
    durationMinutes: 30,
    description: 'Contato via chat com o usuário para validação de acesso após ajuste de credencial.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

const ACTIVITY_TYPES = [
  'Análise de Logs & Diagnóstico',
  'Atendimento & Homologação',
  'Instalação / Configuração de Software',
  'Manutenção de Hardware / Presencial',
  'Alinhamento com Terceiros / Fornecedor',
  'Elaboração de Documentação Técnica',
];

export function TicketTimeTrackingWidget({
  ticketId,
  protocolNumber,
  technicianName = 'Bruno Santos (N1)',
  timeEntries = DEFAULT_TIME_ENTRIES,
  onUpdateTimeEntries,
  readOnly = false,
}: TicketTimeTrackingWidgetProps) {
  const [entries, setEntries] = useState<TimeEntry[]>(timeEntries);

  // Estados do Cronômetro ao Vivo
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Estados do Formulário Manual
  const [hoursInput, setHoursInput] = useState('0');
  const [minutesInput, setMinutesInput] = useState('30');
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0]);
  const [descriptionInput, setDescriptionInput] = useState('');

  // Efeito do Cronômetro
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const totalMinutes = entries.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  const formatTimerDisplay = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopAndSaveTimer = () => {
    if (timerSeconds < 10) {
      toast.warning('O tempo gravado no cronômetro foi inferior a 10 segundos.');
      setIsTimerRunning(false);
      setTimerSeconds(0);
      return;
    }

    const elapsedMins = Math.max(1, Math.round(timerSeconds / 60));
    saveTimeEntry(elapsedMins, 'Apontamento Automático via Cronômetro', activityType);

    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleSaveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hoursInput, 10) || 0;
    const m = parseInt(minutesInput, 10) || 0;
    const duration = h * 60 + m;

    if (duration <= 0) {
      toast.error('Informe um tempo válido maior que 0 minutos.');
      return;
    }

    if (!descriptionInput.trim()) {
      toast.error('Descreva brevemente o trabalho realizado durante esse tempo.');
      return;
    }

    saveTimeEntry(duration, descriptionInput.trim(), activityType);
    setHoursInput('0');
    setMinutesInput('30');
    setDescriptionInput('');
  };

  const saveTimeEntry = (durationMins: number, desc: string, actType: string) => {
    const newEntry: TimeEntry = {
      id: `t_time_${Date.now()}`,
      technicianName,
      activityType: actType,
      durationMinutes: durationMins,
      description: desc,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    if (onUpdateTimeEntries) onUpdateTimeEntries(updated);

    const formattedProtocol = formatTicketProtocol(protocolNumber);
    const hrsStr = `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`;
    logAuditEvent(
      'TICKET_TIME_LOGGED',
      `Apontamento de ${hrsStr} registrado no ticket ${formattedProtocol} por ${technicianName}. Atividade: ${actType}.`
    );
    toast.success(`⏱️ Apontamento de ${hrsStr} gravado com sucesso!`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header com Totais */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Apontamento de Horas / Time Tracking
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            Total: {totalHoursFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Item 063</span>
        </div>
      </div>

      {/* Cronômetro ao Vivo & Lançamento Rapido */}
      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Box 1: Cronômetro em Tempo Real */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Cronômetro ao Vivo</span>
              {isTimerRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Gravando tempo..." />
              )}
            </div>
            <div className="text-2xl font-mono font-black text-center tracking-wider text-blue-400 my-1">
              {formatTimerDisplay(timerSeconds)}
            </div>
            <div className="flex gap-1.5">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(true)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Iniciar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </button>
              )}
              <button
                type="button"
                onClick={handleStopAndSaveTimer}
                disabled={timerSeconds === 0}
                className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Salvar tempo do cronômetro"
              >
                <Square className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>

          {/* Box 2 & 3: Formulário de Lançamento Manual */}
          <form onSubmit={handleSaveManualEntry} className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Lançamento Manual de Horas</span>
              <span className="text-[10px] text-slate-400 font-normal">Técnico: {technicianName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Horas</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Minutos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tipo de Atividade</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 truncate"
                >
                  {ACTIVITY_TYPES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Descrição das tarefas realizadas (ex: testes no banco SQL)..."
                className="flex-1 text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de Apontamentos Históricos */}
      <div className="space-y-2 pt-1">
        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          Histórico de Apontamentos do Chamado
        </h5>

        {entries.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Nenhum tempo registrado para este ticket.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const formattedDuration = `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m`;
              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{entry.technicianName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {entry.activityType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        ⏱️ {formattedDuration}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{entry.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
