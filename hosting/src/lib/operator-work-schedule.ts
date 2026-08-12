import { logCrudAudit } from './audit-logger';

/**
 * ⏰ Item 032: Gestão de Horário de Trabalho por Operador
 * 
 * Gerenciamento de turnos contratuais, escalas de trabalho (Manhã, Tarde/Noite, 12x36),
 * cálculo de status de presença ao vivo e automação de desconexão fora do expediente.
 */

export interface OperatorWorkSchedule {
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  role: string;
  shiftName: string;
  workDays: string[]; // ['seg', 'ter', 'qua', 'qui', 'sex']
  startHour: string; // Ex: '08:00'
  endHour: string;   // Ex: '17:00'
  lunchStart: string; // Ex: '12:00'
  lunchEnd: string;   // Ex: '13:00'
  outOfShiftBehavior: 'AUTO_OFFLINE' | 'WARN_SUPERVISOR' | 'ALLOW_EMERGENCY';
  status: 'ACTIVE' | 'INACTIVE';
  lastUpdated: string;
}

export type LiveShiftState = 'EM_JORNADA' | 'PAUSA_ALMOCO' | 'FORA_DO_EXPEDIENTE';

const STORAGE_KEY = 'portal_operator_schedules_list';

/**
 * Retorna as escalas de trabalho cadastradas
 */
export function getOperatorSchedules(): OperatorWorkSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return getInitialMockSchedules();
}

/**
 * Mocks de escalas contratuais dos atendentes
 */
function getInitialMockSchedules(): OperatorWorkSchedule[] {
  const timestamp = new Date().toISOString();
  return [
    {
      operatorId: 'op_bruno_gomes',
      operatorName: 'Bruno Gomes',
      operatorEmail: 'bg@tiecia.com.br',
      role: 'Super Administrador / Supervisor',
      shiftName: 'Turno Integral (08h às 17h)',
      workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
      startHour: '08:00',
      endHour: '17:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      outOfShiftBehavior: 'ALLOW_EMERGENCY',
      status: 'ACTIVE',
      lastUpdated: timestamp,
    },
    {
      operatorId: 'op_ana_silva',
      operatorName: 'Ana Silva',
      operatorEmail: 'ana.silva@empresa.com.br',
      role: 'Analista de Suporte N2',
      shiftName: 'Turno Manhã (08h às 17h)',
      workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
      startHour: '08:00',
      endHour: '17:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      outOfShiftBehavior: 'AUTO_OFFLINE',
      status: 'ACTIVE',
      lastUpdated: timestamp,
    },
    {
      operatorId: 'op_andre_carvalho',
      operatorName: 'André Carvalho',
      operatorEmail: 'andre.carvalho@empresa.com.br',
      role: 'Analista de Suporte N1',
      shiftName: 'Turno Tarde/Noite (13h às 22h)',
      workDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
      startHour: '13:00',
      endHour: '22:00',
      lunchStart: '17:00',
      lunchEnd: '18:00',
      outOfShiftBehavior: 'AUTO_OFFLINE',
      status: 'ACTIVE',
      lastUpdated: timestamp,
    },
    {
      operatorId: 'op_lucas_moraes',
      operatorName: 'Lucas Moraes',
      operatorEmail: 'lucas.moraes@empresa.com.br',
      role: 'Analista N3 (Plantão 12x36)',
      shiftName: 'Escala 12x36 (07h às 19h)',
      workDays: ['seg', 'qua', 'sex', 'dom'],
      startHour: '07:00',
      endHour: '19:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      outOfShiftBehavior: 'WARN_SUPERVISOR',
      status: 'ACTIVE',
      lastUpdated: timestamp,
    },
  ];
}

/**
 * Salva a lista de escalas no armazenamento local
 */
export function saveOperatorSchedules(list: OperatorWorkSchedule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[WorkSchedule] Erro ao salvar escalas:', e);
  }
}

/**
 * Atualiza a escala de trabalho de um operador
 */
export async function updateOperatorSchedule(schedule: OperatorWorkSchedule): Promise<OperatorWorkSchedule> {
  const list = getOperatorSchedules();
  const index = list.findIndex((s) => s.operatorId === schedule.operatorId);

  schedule.lastUpdated = new Date().toISOString();

  if (index >= 0) {
    list[index] = schedule;
  } else {
    list.unshift(schedule);
  }

  saveOperatorSchedules(list);

  await logCrudAudit('UPDATE', 'operator_work_schedules', schedule.operatorId, JSON.stringify({
    action: 'UPDATE_OPERATOR_WORK_SCHEDULE',
    operatorName: schedule.operatorName,
    shiftName: schedule.shiftName,
    startHour: schedule.startHour,
    endHour: schedule.endHour,
    lunchStart: schedule.lunchStart,
    lunchEnd: schedule.lunchEnd,
  }));

  return schedule;
}

/**
 * Calcula o status de presença de um operador com base no horário atual do relógio
 */
export function calculateLiveShiftStatus(schedule: OperatorWorkSchedule): {
  state: LiveShiftState;
  label: string;
  badgeColor: string;
} {
  const now = new Date();
  const daysMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const currentDay = daysMap[now.getDay()];

  // Se o dia da semana atual não for dia de trabalho do operador
  if (!schedule.workDays.includes(currentDay)) {
    return {
      state: 'FORA_DO_EXPEDIENTE',
      label: '🔴 Fora do Expediente (Dia Folga)',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = schedule.startHour.split(':').map(Number);
  const startTotalMinutes = startH * 60 + startM;

  const [endH, endM] = schedule.endHour.split(':').map(Number);
  const endTotalMinutes = endH * 60 + endM;

  const [lunchStartH, lunchStartM] = schedule.lunchStart.split(':').map(Number);
  const lunchStartTotal = lunchStartH * 60 + lunchStartM;

  const [lunchEndH, lunchEndM] = schedule.lunchEnd.split(':').map(Number);
  const lunchEndTotal = lunchEndH * 60 + lunchEndM;

  // Checa se está no horário de almoço
  if (currentMinutes >= lunchStartTotal && currentMinutes < lunchEndTotal) {
    return {
      state: 'PAUSA_ALMOCO',
      label: '🟡 Em Pausa para Almoço',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
  }

  // Checa se está dentro do horário de jornada
  if (currentMinutes >= startTotalMinutes && currentMinutes < endTotalMinutes) {
    return {
      state: 'EM_JORNADA',
      label: '🟢 Em Jornada de Trabalho',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  }

  return {
    state: 'FORA_DO_EXPEDIENTE',
    label: '🔴 Fora do Expediente',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };
}

/**
 * Métricas consolidadas das escalas de trabalho
 */
export function getScheduleMetrics() {
  const list = getOperatorSchedules();
  let inShift = 0;
  let inLunch = 0;
  let outOfShift = 0;

  list.forEach((s) => {
    const live = calculateLiveShiftStatus(s);
    if (live.state === 'EM_JORNADA') inShift++;
    else if (live.state === 'PAUSA_ALMOCO') inLunch++;
    else outOfShift++;
  });

  return {
    totalOperators: list.length,
    inShiftCount: inShift,
    inLunchCount: inLunch,
    outOfShiftCount: outOfShift,
    autoOfflinePolicyCount: list.filter((s) => s.outOfShiftBehavior === 'AUTO_OFFLINE').length,
  };
}
