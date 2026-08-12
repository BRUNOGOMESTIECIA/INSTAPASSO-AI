import { useEffect, useRef } from 'react';
import { getSoundSettings, playAlertSound } from '../lib/sound-effects';

/**
 * Hook useTabNotification (Item 039)
 * Quando o navegador estiver minimizado ou em outra aba e uma nova mensagem de chat/notificação chegar:
 * 1. Faz o título do navegador piscar: "(1) 💬 Nova Mensagem do Cliente..."
 * 2. Toca um alerta sonoro suave se o som estiver ativado nas preferências.
 */
export function useTabNotification(unreadCount: number, alertMessage?: string) {
  const originalTitleRef = useRef<string>(document.title);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Guarda o título original se ainda não tiver guardado
    if (!originalTitleRef.current.includes('💬')) {
      originalTitleRef.current = document.title || 'Portal ITSM';
    }

    const isTabHidden = document.hidden;

    // Se houver mensagens não lidas e a aba estiver oculta/minimizada
    if (unreadCount > 0 && isTabHidden) {
      // Toca som de alerta
      const soundConfig = getSoundSettings();
      if (soundConfig.enabled) {
        playAlertSound('chime', soundConfig.volume);
      }

      // Inicia a piscagem do título da aba
      if (!intervalRef.current) {
        let toggle = false;
        const msg = alertMessage || `(${unreadCount}) 💬 Nova Mensagem!`;

        intervalRef.current = setInterval(() => {
          document.title = toggle ? msg : originalTitleRef.current;
          toggle = !toggle;
        }, 1000);
      }
    } else {
      // Limpa a piscagem e restaura o título original
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.title = originalTitleRef.current;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        document.title = originalTitleRef.current;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = originalTitleRef.current;
    };
  }, [unreadCount, alertMessage]);
}
