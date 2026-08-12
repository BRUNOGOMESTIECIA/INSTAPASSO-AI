import { useState } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export interface InactiveUser {
  id: string;
  name: string;
  email: string;
  company: string;
  daysInactive: number;
  ticketsCount: number;
  isAnonymized: boolean;
}

const MOCK_INACTIVE_USERS: InactiveUser[] = [
  {
    id: 'usr_inact_01',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.santos@ex-cliente.com.br',
    company: 'TechCorp Logística',
    daysInactive: 820,
    ticketsCount: 4,
    isAnonymized: false,
  },
  {
    id: 'usr_inact_02',
    name: 'Fernanda Lima Oliveira',
    email: 'fernanda.lima@antigo-parceiro.com',
    company: 'Fintech Brasil',
    daysInactive: 760,
    ticketsCount: 2,
    isAnonymized: false,
  },
  {
    id: 'usr_inact_03',
    name: 'Marcos Vinicius Souza',
    email: 'marcos.souza@empresa-descontinuada.com',
    company: 'OmniRetail',
    daysInactive: 910,
    ticketsCount: 6,
    isAnonymized: false,
  },
];

export function useLgpdAnonymization() {
  const [users, setUsers] = useState<InactiveUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lgpd_inactive_users_list');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return MOCK_INACTIVE_USERS;
  });

  const saveUsers = (newList: InactiveUser[]) => {
    setUsers(newList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lgpd_inactive_users_list', JSON.stringify(newList));
    }
  };

  const runBatchAnonymization = () => {
    const pendingCount = users.filter(u => !u.isAnonymized).length;

    if (pendingCount === 0) {
      toast.info('Todos os usuários inativos elegíveis já foram anonimizados conforme a LGPD.');
      return;
    }

    const updated = users.map(u => ({
      ...u,
      name: `Solicitante Anonimizado (${u.id})`,
      email: `anonimizado_${u.id}@lgpd-privacy.internal`,
      isAnonymized: true,
    }));

    saveUsers(updated);

    logSecurityAudit({
      protocol: `LGPD_PURGE_${Date.now().toString().slice(-6)}`,
      action: '🔄 Anonimização de Usuários Inativos em Lote (LGPD Art. 16)',
      originPortal: 'Portal Operacional',
      userName: 'Encarregado DPO / Admin',
      userEmail: 'dpo@tiecia.com.br',
      details: `Executada rotina de batch purge LGPD Art. 16. ${pendingCount} cadastros inativos (+730 dias) foram anonimizados. Histórico técnico de tickets mantido 100% íntegro.`,
    });

    toast.success(`Rotina LGPD Executada com Sucesso!`, {
      description: `${pendingCount} cadastros inativos foram anonimizados. Todo o histórico técnico e métricas de chamados permanecem preservados.`,
      duration: 6000,
    });
  };

  return {
    users,
    runBatchAnonymization,
    pendingUsersCount: users.filter(u => !u.isAnonymized).length,
    anonymizedUsersCount: users.filter(u => u.isAnonymized).length,
  };
}
