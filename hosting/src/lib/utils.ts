import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = 'America/Sao_Paulo';

// All dates displayed in UTC-3 (America/Sao_Paulo)
export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy HH:mm'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(toZonedTime(d, TZ), fmt, { locale: ptBR });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

export function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  };
  return map[priority] ?? priority;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    new: 'Novo',
    open: 'Aberto',
    in_progress: 'Em Andamento',
    pending: 'Pendente',
    resolved: 'Resolvido',
    closed: 'Encerrado',
    cancelled: 'Cancelado',
    waiting: 'Aguardando',
    active: 'Em Atendimento',
    finished: 'Finalizado',
    escalated: 'Escalado',
    abandoned: 'Abandonado',
  };
  return map[status] ?? status;
}

export function slaStatus(dueAt: string | null): 'ok' | 'warning' | 'breach' | 'none' {
  if (!dueAt) return 'none';
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  const remaining = due - now;
  if (remaining < 0) return 'breach';
  if (remaining < 30 * 60 * 1000) return 'warning'; // < 30 min
  return 'ok';
}

// --- Funções de Mascaramento LGPD ---
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 3) return email;
  const maskedName = name.substring(0, 3) + '*'.repeat(name.length - 3);
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return phone;
  // Ex: (11) 98765-4321 -> (11) 9****-4321
  return phone.replace(/(\d)(\d{4})-(\d{4})/, '$1****-$3');
}
