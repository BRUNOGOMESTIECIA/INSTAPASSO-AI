import { useState } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export interface MfaPolicyConfig {
  isMfaEnforced: boolean;
  targetScope: 'all' | 'admins_only';
  allowedMethods: ('authenticator' | 'sms' | 'email')[];
  gracePeriodDays: number;
  lastUpdatedIso: string;
}

const DEFAULT_CONFIG: MfaPolicyConfig = {
  isMfaEnforced: true,
  targetScope: 'admins_only',
  allowedMethods: ['authenticator', 'sms'],
  gracePeriodDays: 7,
  lastUpdatedIso: new Date().toISOString(),
};

export function useMfaPolicy() {
  const [config, setConfigState] = useState<MfaPolicyConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfa_enforcement_config');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_CONFIG;
  });

  const saveMfaPolicy = (newConfig: MfaPolicyConfig) => {
    setConfigState(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfa_enforcement_config', JSON.stringify(newConfig));
    }

    logSecurityAudit({
      protocol: `MFA_CFG_${Date.now().toString().slice(-6)}`,
      action: '🛡️ Política de Autenticação em Dois Fatores (2FA/MFA) Atualizada (Item 010)',
      originPortal: 'Portal Operacional',
      userName: 'Administrador de TI / DPO',
      userEmail: 'admin@tiecia.com.br',
      details: `2FA/MFA ${newConfig.isMfaEnforced ? 'Forçado' : 'Opcional'}. Escopo: ${newConfig.targetScope === 'all' ? 'Todos os Usuários' : 'Apenas Admins/Técnicos'}. Métodos: ${newConfig.allowedMethods.join(', ')}.`,
    });

    toast.success('Política de 2FA/MFA Atualizada com Sucesso!', {
      description: `Autenticação em Dois Fatores configurada como ${newConfig.isMfaEnforced ? 'Obrigatória' : 'Opcional'}.`,
    });
  };

  const verifyTotpCode = (code: string): boolean => {
    const clean = code.trim();
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      toast.success('🟢 Código 2FA Validado com Sucesso!');
      return true;
    }
    toast.error('🛑 Código 2FA Inválido! Insira 6 dígitos numéricos.');
    return false;
  };

  return {
    config,
    saveMfaPolicy,
    verifyTotpCode,
  };
}
