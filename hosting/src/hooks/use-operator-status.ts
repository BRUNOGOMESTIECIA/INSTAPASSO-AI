import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type OperatorPresenceStatus = 'online' | 'lunch' | 'pause' | 'busy';

export interface StatusConfig {
  id: OperatorPresenceStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  description: string;
  icon: string;
}

export const STATUS_CONFIGS: Record<OperatorPresenceStatus, StatusConfig> = {
  online: {
    id: 'online',
    label: '🟢 Disponível (On-line)',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
    description: 'Recebendo chamados e chats normalmente',
    icon: '🟢',
  },
  lunch: {
    id: 'lunch',
    label: '🍔 Em Pausa para Almoço',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    description: 'Fila de novos chats pausada temporariamente (1h)',
    icon: '🍔',
  },
  pause: {
    id: 'pause',
    label: '☕ Pausa Técnica / Banheiro',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
    description: 'Intervalo curto (15 min). Transbordo ativo.',
    icon: '☕',
  },
  busy: {
    id: 'busy',
    label: '🔴 Em Reunião / Ocupado',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
    badgeText: 'text-rose-700 dark:text-rose-300',
    dotColor: 'bg-rose-500',
    description: 'Apenas emergências e chamados atribuídos',
    icon: '🔴',
  },
};

export function useOperatorStatus() {
  const [status, setStatusState] = useState<OperatorPresenceStatus>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('operator_presence_status');
      if (saved && (saved in STATUS_CONFIGS)) return saved as OperatorPresenceStatus;
    }
    return 'online';
  });

  const setStatus = (newStatus: OperatorPresenceStatus) => {
    setStatusState(newStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('operator_presence_status', newStatus);
    }
    const config = STATUS_CONFIGS[newStatus];
    toast.info(`Status alterado para: ${config.label}`, {
      description: config.description,
    });
  };

  return {
    status,
    setStatus,
    config: STATUS_CONFIGS[status],
    isAvailable: status === 'online',
  };
}
