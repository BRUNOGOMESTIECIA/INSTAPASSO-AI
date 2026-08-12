import { useState, useEffect } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export interface IpBlockInfo {
  ip: string;
  failedCount: number;
  blockedUntilMs: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Hook de Proteção Anti-Brute Force por IP (Item 114)
 * Bloqueia o IP temporariamente por 15 minutos ao detectar 5 falhas de login seguidas.
 */
export function useBruteForceGuard() {
  const [ipData, setIpData] = useState<Record<string, IpBlockInfo>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brute_force_blocked_ips');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return {};
  });

  const saveToStorage = (newData: Record<string, IpBlockInfo>) => {
    setIpData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('brute_force_blocked_ips', JSON.stringify(newData));
    }
  };

  /**
   * Verifica se o IP está temporariamente bloqueado
   */
  const checkIpBlocked = (ip: string) => {
    const info = ipData[ip];
    if (!info || !info.blockedUntilMs) return { isBlocked: false, remainingSeconds: 0, failedCount: info?.failedCount || 0 };

    const now = Date.now();
    if (now >= info.blockedUntilMs) {
      // Bloqueio expirou, reseta o IP
      const updated = { ...ipData };
      delete updated[ip];
      saveToStorage(updated);
      return { isBlocked: false, remainingSeconds: 0, failedCount: 0 };
    }

    const remainingSeconds = Math.ceil((info.blockedUntilMs - now) / 1000);
    return { isBlocked: true, remainingSeconds, failedCount: info.failedCount };
  };

  /**
   * Registra uma tentativa incorreta de login
   */
  const recordFailedAttempt = (ip: string, userEmail: string = 'desconhecido') => {
    const current = ipData[ip] || { ip, failedCount: 0, blockedUntilMs: null };
    const newCount = current.failedCount + 1;

    let blockedUntilMs = current.blockedUntilMs;

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      blockedUntilMs = Date.now() + LOCKOUT_DURATION_MS;

      // Trilha de Auditoria ISO 27001
      logSecurityAudit({
        protocol: `BRUTE_${Date.now().toString().slice(-6)}`,
        action: `🚨 BLOQUEIO ANTI-BRUTE FORCE: IP ${ip} Bloqueado por 15 Minutos`,
        originPortal: 'Portal Operacional',
        userName: `Tentativa com ${userEmail}`,
        userEmail: userEmail,
        details: `Identificadas ${newCount} falhas seguidas de senha. O IP ${ip} foi suspenso temporariamente por 15 min.`,
      });

      toast.error(`🔒 IP Bloqueado por Segurança (Item 114)!`, {
        description: `Foram detectadas ${newCount} falhas seguidas. Tente novamente em 15 minutos.`,
        duration: 8000,
      });
    } else {
      toast.warning(`Senha incorreta (${newCount}/${MAX_FAILED_ATTEMPTS} tentativas)`, {
        description: `Após 5 falhas, seu IP será bloqueado temporariamente por 15 minutos.`,
      });
    }

    const updated = {
      ...ipData,
      [ip]: { ip, failedCount: newCount, blockedUntilMs },
    };
    saveToStorage(updated);
  };

  /**
   * Reseta o contador do IP após login bem-sucedido
   */
  const resetAttempts = (ip: string) => {
    if (ipData[ip]) {
      const updated = { ...ipData };
      delete updated[ip];
      saveToStorage(updated);
    }
  };

  return {
    checkIpBlocked,
    recordFailedAttempt,
    resetAttempts,
    blockedIpsList: Object.values(ipData).filter(i => i.blockedUntilMs && Date.now() < i.blockedUntilMs),
  };
}
