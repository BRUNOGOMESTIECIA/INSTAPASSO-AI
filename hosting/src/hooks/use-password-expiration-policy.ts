import { useState } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

const POLICY_DAYS_LIMIT = 90;

export function usePasswordExpirationPolicy() {
  const [lastChangeIso, setLastChangeIso] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_last_password_change_date');
      if (saved) return saved;
      // Mock inicial de 95 dias atrás para demonstrar a política ativa no sistema
      const ninetyFiveDaysAgo = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('user_last_password_change_date', ninetyFiveDaysAgo);
      return ninetyFiveDaysAgo;
    }
    return new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();
  });

  const lastChangeDate = new Date(lastChangeIso);
  const diffDays = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays >= POLICY_DAYS_LIMIT;
  const daysRemaining = Math.max(0, POLICY_DAYS_LIMIT - diffDays);

  const updatePassword = (newPassword: string) => {
    if (newPassword.length < 8) {
      toast.error('A nova senha deve possuir pelo menos 8 caracteres.');
      return false;
    }

    const nowIso = new Date().toISOString();
    setLastChangeIso(nowIso);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_last_password_change_date', nowIso);
    }

    // Registro no Audit Log ISO 27001
    logSecurityAudit({
      protocol: `PASS_RENEW_${Date.now().toString().slice(-6)}`,
      action: '🔐 Renovação Periódica de Senha (Política 90 Dias - ISO 27001)',
      originPortal: 'Portal Operacional',
      userName: 'Operador',
      userEmail: 'operador@portal.com.br',
      details: `Senha corporativa renovada com sucesso após ${diffDays} dias de uso.`,
    });

    toast.success('Senha corporativa atualizada com sucesso!');
    return true;
  };

  return {
    diffDays,
    isExpired,
    daysRemaining,
    lastChangeDate,
    updatePassword,
  };
}
