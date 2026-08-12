import { useState, useEffect, useCallback, useRef } from 'react';

export interface TypingState {
  chatId: string;
  senderRole: 'client' | 'agent';
  senderName: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Hook para gerenciar e sincronizar o estado "Digitando..." entre abas/portais via BroadcastChannel.
 */
export function useTypingIndicator(chatId: string | undefined, currentRole: 'client' | 'agent', currentName: string) {
  const [peerTypingState, setPeerTypingState] = useState<{ isTyping: boolean; name: string }>({
    isTyping: false,
    name: '',
  });

  const channelRef = useRef<BroadcastChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa o BroadcastChannel para comunicação instantânea inter-abas
  useEffect(() => {
    if (!chatId) return;

    try {
      channelRef.current = new BroadcastChannel(`typing_channel_${chatId}`);
      channelRef.current.onmessage = (event) => {
        const data: TypingState = event.data;
        // Só processa se for do outro papel (se sou client, quero ver agent digitando e vice-versa)
        if (data.chatId === chatId && data.senderRole !== currentRole) {
          if (data.isTyping) {
            setPeerTypingState({ isTyping: true, name: data.senderName });

            // Auto-limpa após 3.5 segundos sem nova digitação (fallback safety)
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setPeerTypingState({ isTyping: false, name: '' });
            }, 3500);
          } else {
            setPeerTypingState({ isTyping: false, name: '' });
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel não suportado para digitação:', e);
    }

    return () => {
      channelRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [chatId, currentRole]);

  // Função para notificar que EU estou digitando
  const notifyTyping = useCallback(() => {
    if (!chatId) return;

    const payload: TypingState = {
      chatId,
      senderRole: currentRole,
      senderName: currentName,
      isTyping: true,
      timestamp: Date.now(),
    };

    channelRef.current?.postMessage(payload);

    // Salva fallback no localStorage
    try {
      localStorage.setItem(`typing_${chatId}_${currentRole}`, JSON.stringify(payload));
    } catch (e) {}
  }, [chatId, currentRole, currentName]);

  // Função para notificar que parei de digitar
  const notifyStopTyping = useCallback(() => {
    if (!chatId) return;

    const payload: TypingState = {
      chatId,
      senderRole: currentRole,
      senderName: currentName,
      isTyping: false,
      timestamp: Date.now(),
    };

    channelRef.current?.postMessage(payload);

    try {
      localStorage.removeItem(`typing_${chatId}_${currentRole}`);
    } catch (e) {}
  }, [chatId, currentRole, currentName]);

  return {
    isPeerTyping: peerTypingState.isTyping,
    peerTypingName: peerTypingState.name,
    notifyTyping,
    notifyStopTyping,
  };
}
