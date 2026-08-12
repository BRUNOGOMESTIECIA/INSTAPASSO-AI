import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import { SocketEvent } from '@portal/shared';
import { toast } from 'sonner';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

// Sound notification
const notifSound = typeof window !== 'undefined' ? new Audio('/sounds/notification.mp3') : null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const tenantSlug = window.location.hostname.split('.')[0];

    const socket = io({
      withCredentials: true,
      transports: ['websocket'],
      query: { tenant: tenantSlug, userId: user.id },
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Global notification handler
    socket.on(SocketEvent.NOTIFICATION_NEW, (notification: any) => {
      toast.info(notification.title, { description: notification.body });
      notifSound?.play().catch(() => {}); // respect browser autoplay restrictions
    });

    // SLA breach warning
    socket.on(SocketEvent.SLA_BREACH, (data: any) => {
      toast.warning(`SLA em Risco: ${data.title}`, {
        description: `Chamado #${data.ticketNumber}`,
        duration: 10000,
      });
      notifSound?.play().catch(() => {});
    });

    // AI service unavailable
    socket.on(SocketEvent.AI_SERVICE_UNAVAILABLE, () => {
      toast.error('Serviço de IA indisponível', {
        description: 'O atendimento foi redirecionado para agente humano.',
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
