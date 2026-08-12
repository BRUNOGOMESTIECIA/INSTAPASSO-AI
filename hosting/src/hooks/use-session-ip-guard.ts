import { useState, useEffect } from 'react';
import { logSecurityAudit } from '../lib/audit-logger';
import { toast } from 'sonner';

export function useSessionIpGuard() {
  const [initialIp] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('session_initial_ip');
      if (saved) return saved;
      const mockIp = `187.32.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
      sessionStorage.setItem('session_initial_ip', mockIp);
      return mockIp;
    }
    return '200.150.88.42';
  });

  const [currentIp, setCurrentIp] = useState<string>(initialIp);
  const [isIpDriftDetected, setIsIpDriftDetected] = useState(false);

  // Função para simular teste de mudança de IP pelo administrador
  const simulateIpChange = (newIp: string) => {
    setCurrentIp(newIp);
    if (newIp !== initialIp) {
      setIsIpDriftDetected(true);
      logSecurityAudit({
        protocol: `SEC_IP_${Date.now().toString().slice(-6)}`,
        action: '🚨 Alerta de Segurança: Troca de IP em Sessão Ativa (Session Hijacking Guard)',
        originPortal: 'Portal Operacional',
        userName: 'Operador Logado',
        userEmail: 'operador@portal.com.br',
        details: `O IP da sessão mudou de ${initialIp} para ${newIp} durante a navegação ativa. Ação de revalidação exigida.`
      });

      toast.error('🚨 Alerta de Segurança: Troca Repentina de IP Detectada!', {
        description: `IP inicial: ${initialIp} -> Novo IP: ${newIp}. Sessão colocada em quarentena por segurança.`,
        duration: 8000
      });
    } else {
      setIsIpDriftDetected(false);
      toast.success('IP verificado com sucesso. Nenhuma anomalia detectada.');
    }
  };

  const resolveIpDrift = () => {
    setIsIpDriftDetected(false);
    sessionStorage.setItem('session_initial_ip', currentIp);
    toast.success('Credenciais de sessão revalidadas com sucesso!');
  };

  return {
    initialIp,
    currentIp,
    isIpDriftDetected,
    simulateIpChange,
    resolveIpDrift
  };
}
