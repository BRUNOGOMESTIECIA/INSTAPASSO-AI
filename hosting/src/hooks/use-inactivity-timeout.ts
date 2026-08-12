import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Hook useInactivityTimeout
 * Monitora a inatividade do usuário (ausência de mouse, teclado, touch ou scroll).
 * Após o tempo limite (padrão: 30 minutos), bloqueia a sessão do operador por segurança (LGPD / ISO 27001).
 */
export function useInactivityTimeout(defaultTimeoutMinutes = 30) {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('portal_session_locked') === 'true';
  });

  const getDynamicTimeoutMinutes = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('session_inactivity_timeout_minutes');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return defaultTimeoutMinutes;
  };

  const timeoutMinutes = getDynamicTimeoutMinutes();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const lockSession = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem('portal_session_locked', 'true');
    toast.warning('🔒 Sessão bloqueada por inatividade prolongada (ISO 27001).');
  }, []);

  const resetTimer = useCallback(() => {
    if (localStorage.getItem('portal_session_locked') === 'true') {
      return; // Se já bloqueado, ignora resetting
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      lockSession();
    }, timeoutMs);
  }, [timeoutMs, lockSession]);

  const unlockSession = useCallback(() => {
    setIsLocked(false);
    localStorage.removeItem('portal_session_locked');
    toast.success('🔓 Sessão desbloqueada com sucesso!');
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Eventos de atividade do operador
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer(); // Inicializa o temporizador

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return {
    isLocked,
    lockSession,
    unlockSession,
  };
}
