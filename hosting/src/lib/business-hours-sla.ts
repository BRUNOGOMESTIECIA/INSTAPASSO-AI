import { format } from 'date-fns';

export interface BusinessScheduleDay {
  dayIndex: number; // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  dayName: string;
  active: boolean;
  startHour: number;
  endHour: number;
}

export interface BusinessHoursConfig {
  autoCollapseChatOutsideHours: boolean;
  schedule: BusinessScheduleDay[];
  holidays: string[];
}

export const DEFAULT_BUSINESS_SCHEDULE: BusinessScheduleDay[] = [
  { dayIndex: 0, dayName: 'Domingo',  active: false, startHour: 8, endHour: 18 },
  { dayIndex: 1, dayName: 'Segunda',  active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 2, dayName: 'Terça',    active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 3, dayName: 'Quarta',   active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 4, dayName: 'Quinta',   active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 5, dayName: 'Sexta',    active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 6, dayName: 'Sábado',   active: true,  startHour: 9, endHour: 13 },
];

export const STORAGE_KEY_BUSINESS_HOURS = 'portal_business_hours_config';

export function getBusinessHoursConfig(): BusinessHoursConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUSINESS_HOURS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    autoCollapseChatOutsideHours: true,
    schedule: DEFAULT_BUSINESS_SCHEDULE,
    holidays: [
      '2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07',
      '2026-10-12', '2026-11-02', '2026-11-15', '2026-12-25',
    ],
  };
}

export function saveBusinessHoursConfig(config: BusinessHoursConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUSINESS_HOURS, JSON.stringify(config));
  } catch (e) {}
}

export interface SlaPauseInfo {
  isPaused: boolean;
  reason: 'weekend' | 'holiday' | 'after_hours' | null;
  label: string;
}

/**
 * Verifica se o momento atual está fora do horário comercial configurado
 */
export function isSlaPausedNow(currentDate: Date = new Date()): SlaPauseInfo {
  const config = getBusinessHoursConfig();
  const dayOfWeek = currentDate.getDay();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const hours = currentDate.getHours();

  // 1. Verificação de Feriado
  if (config.holidays.includes(dateStr)) {
    return {
      isPaused: true,
      reason: 'holiday',
      label: '⏸️ SLA Pausado (Feriado Cadastrado)',
    };
  }

  // 2. Verificação do Dia da Semana
  const dayConfig = config.schedule.find((s) => s.dayIndex === dayOfWeek);
  if (!dayConfig || !dayConfig.active) {
    return {
      isPaused: true,
      reason: 'weekend',
      label: `⏸️ SLA Pausado (${dayOfWeek === 0 || dayOfWeek === 6 ? 'Final de Semana' : 'Dia Inativo'})`,
    };
  }

  // 3. Verificação de Horário (Início e Fim)
  if (hours < dayConfig.startHour || hours >= dayConfig.endHour) {
    return {
      isPaused: true,
      reason: 'after_hours',
      label: `⏸️ SLA Pausado (Fora do Expediente ${String(dayConfig.startHour).padStart(2, '0')}h-${String(dayConfig.endHour).padStart(2, '0')}h)`,
    };
  }

  return {
    isPaused: false,
    reason: null,
    label: '🟢 SLA Ativo (Horário Comercial)',
  };
}
