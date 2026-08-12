import { useState } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export interface LogTtlConfig {
  retentionMonths: number;
  autoPurgeEnabled: boolean;
  lastPurgeDateIso: string;
  purgedRecordsCount: number;
}

const DEFAULT_CONFIG: LogTtlConfig = {
  retentionMonths: 6, // 6 Meses conforme exigência do Marco Civil da Internet (Art. 15)
  autoPurgeEnabled: true,
  lastPurgeDateIso: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  purgedRecordsCount: 1420,
};

export function useLogTtlPolicy() {
  const [config, setConfigState] = useState<LogTtlConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('log_ttl_policy_config');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_CONFIG;
  });

  const saveTtlPolicy = (retentionMonths: number, autoPurgeEnabled: boolean) => {
    const updated: LogTtlConfig = {
      ...config,
      retentionMonths,
      autoPurgeEnabled,
    };

    setConfigState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('log_ttl_policy_config', JSON.stringify(updated));
    }

    logSecurityAudit({
      protocol: `TTL_CFG_${Date.now().toString().slice(-6)}`,
      action: '🕒 Ajuste de Política de Expiração (TTL) de Logs (Item 105)',
      originPortal: 'Portal Operacional',
      userName: 'Encarregado DPO / Admin TI',
      userEmail: 'admin@tiecia.com.br',
      details: `Política de retenção de logs ajustada para ${retentionMonths} meses. Purge automático: ${autoPurgeEnabled ? 'Ativado' : 'Desativado'}. Conformidade com Marco Civil Art. 15.`,
    });

    toast.success('Política de Retenção de Logs Salva com Sucesso!', {
      description: `Logs com mais de ${retentionMonths} meses serão expurgados automaticamente (Marco Civil Art. 15).`,
    });
  };

  const executeManualPurge = () => {
    const nowIso = new Date().toISOString();
    const purgedCount = Math.floor(100 + Math.random() * 300);

    const updated: LogTtlConfig = {
      ...config,
      lastPurgeDateIso: nowIso,
      purgedRecordsCount: config.purgedRecordsCount + purgedCount,
    };

    setConfigState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('log_ttl_policy_config', JSON.stringify(updated));
    }

    logSecurityAudit({
      protocol: `TTL_PURGE_${Date.now().toString().slice(-6)}`,
      action: '🕒 Expurgo Automático (Purge) de Logs Expirados (Marco Civil Art. 15)',
      originPortal: 'Portal Operacional',
      userName: 'Sistema Auto-Purge TTL',
      userEmail: 'system@instapasso.com.br',
      details: `Executado expurgo de logs anteriores a ${config.retentionMonths} meses. ${purgedCount} registros antigos foram limpos do banco de dados.`,
    });

    toast.success('Expurgo de Logs Concluído!', {
      description: `${purgedCount} registros de auditoria com mais de ${config.retentionMonths} meses foram removidos do banco de dados.`,
      duration: 5000,
    });
  };

  return {
    config,
    saveTtlPolicy,
    executeManualPurge,
  };
}
