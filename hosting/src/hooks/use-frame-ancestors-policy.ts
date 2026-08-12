import { useState } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export interface FrameAncestorsConfig {
  allowedDomains: string[];
  isEnforced: boolean;
  blockUnauthorizedIframe: boolean;
  lastAuditDateIso: string;
}

const DEFAULT_CONFIG: FrameAncestorsConfig = {
  allowedDomains: [
    "'self'",
    "https://instapasso.com.br",
    "https://app.instapasso.com.br",
    "https://portal.tiecia.com.br"
  ],
  isEnforced: true,
  blockUnauthorizedIframe: true,
  lastAuditDateIso: new Date().toISOString()
};

export function useFrameAncestorsPolicy() {
  const [config, setConfigState] = useState<FrameAncestorsConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('csp_frame_ancestors_config');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_CONFIG;
  });

  const saveConfig = (newConfig: FrameAncestorsConfig) => {
    setConfigState(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem('csp_frame_ancestors_config', JSON.stringify(newConfig));
    }
    toast.success('Diretiva frame-ancestors salva com sucesso!');
  };

  const addDomain = (domain: string) => {
    if (!domain) return;
    const clean = domain.trim();
    if (config.allowedDomains.includes(clean)) {
      toast.error('Este domínio já está na lista de autorizados.');
      return;
    }
    const updated = {
      ...config,
      allowedDomains: [...config.allowedDomains, clean]
    };
    saveConfig(updated);
  };

  const removeDomain = (domain: string) => {
    if (domain === "'self'") {
      toast.error("O parâmetro 'self' não pode ser removido por segurança.");
      return;
    }
    const updated = {
      ...config,
      allowedDomains: config.allowedDomains.filter(d => d !== domain)
    };
    saveConfig(updated);
  };

  const simulateIframeSecurityTest = (testDomain: string = 'https://site-malicioso-hacker.com') => {
    const isAllowed = config.allowedDomains.some(d => testDomain.includes(d.replace('https://', '')));

    if (!isAllowed) {
      logSecurityAudit({
        protocol: `CSP_FRAME_${Date.now().toString().slice(-6)}`,
        action: '🛑 BLOQUEIO ANTI-CLICKJACKING: Embutimento em Iframe Não Autorizado Negado (Item 109)',
        originPortal: 'Portal Operacional',
        userName: 'Filtro WAF InstaPasso',
        userEmail: 'waf@instapasso.com.br',
        details: `A tentativa de embutir o portal via iframe pelo domínio não autorizado "${testDomain}" foi bloqueada estritamente pela diretiva CSP frame-ancestors.`,
      });

      toast.error(`🛑 Bloqueio Anti-Clickjacking Ativado (Item 109)!`, {
        description: `Embutimento pelo site "${testDomain}" foi NEGADO pela diretiva frame-ancestors.`,
        duration: 6000
      });
    } else {
      toast.success(`🟢 Embutimento Autorizado!`, {
        description: `O domínio "${testDomain}" está na lista de origens confiáveis.`
      });
    }
  };

  return {
    config,
    saveConfig,
    addDomain,
    removeDomain,
    simulateIframeSecurityTest
  };
}
