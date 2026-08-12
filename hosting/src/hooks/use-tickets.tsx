import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, getDocs, writeBatch 
} from 'firebase/firestore';
import { type MockTicket } from '../mocks/data';
import { toast } from 'sonner';

interface TicketsContextValue {
  tickets: MockTicket[];
  isLoading: boolean;
  createTicket: (ticket: MockTicket) => Promise<void>;
  updateTicket: (id: string, updates: Partial<MockTicket>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  // Inicializa limpo (sem injetar bots/mock data se o localStorage for limpo)
  const [tickets, setTickets] = useState<MockTicket[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const fallbackTicketsRef = useRef<MockTicket[]>(tickets);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const saveFallbackTickets = useCallback((newTickets: MockTicket[]) => {
    fallbackTicketsRef.current = newTickets;
    setTickets(newTickets);
    try {
      localStorage.setItem('portal_fallback_tickets', JSON.stringify(newTickets));
    } catch (e) {
      console.warn('Não foi possível salvar tickets no localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('ticket_sync_fallback');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'SYNC_TICKETS') {
          fallbackTicketsRef.current = event.data.payload;
          setTickets([...fallbackTicketsRef.current]);
          localStorage.setItem('portal_fallback_tickets', JSON.stringify(event.data.payload));
        }
      };
    } catch (e) {}
    return () => channelRef.current?.close();
  }, []);

  // Conecta diretamente com a coleção 'tickets' do Firestore em tempo real
  useEffect(() => {
    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreTickets: MockTicket[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreTickets.push({
          id: docSnap.id,
          number: data.number || parseInt(docSnap.id.replace(/\D/g, '').slice(-5)) || 1000,
          title: data.title || 'Chamado de Suporte',
          description: data.description || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          type: data.type || 'Incidente',
          category: data.category || 'Outros',
          requesterId: data.requesterId || data.requesterEmail || '',
          requesterName: data.requesterName || data.requesterEmail || 'Cliente',
          requesterEmail: data.requesterEmail || data.requesterId || '',
          assigneeName: data.assigneeName || null,
          team: data.team || null,
          slaFirstResponseDue: data.slaFirstResponseDue || data.createdAt || new Date().toISOString(),
          slaResolutionDue: data.slaResolutionDue || data.createdAt || new Date().toISOString(),
          slaFirstResponseMet: data.slaFirstResponseMet ?? true,
          slaResolutionMet: data.slaResolutionMet ?? true,
          source: data.source || 'portal',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          closedAt: data.closedAt || null,
          tags: data.tags || [],
          comments: data.comments || [],
          rating: data.rating,
          ratingComment: data.ratingComment,
          ratedAt: data.ratedAt,
          parentTicketId: data.parentTicketId
        });
      });

      firestoreTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackTickets(firestoreTickets);
      setIsLoading(false);
    }, (error) => {
      console.warn("Aviso Firestore Tickets:", error?.message);
      setIsLoading(false);
      const saved = localStorage.getItem('portal_fallback_tickets');
      if (saved) {
        try { setTickets(JSON.parse(saved)); } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, [saveFallbackTickets]);

  const createTicket = useCallback(async (ticket: MockTicket) => {
    const updated = [ticket, ...fallbackTicketsRef.current];
    saveFallbackTickets(updated);
    channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: updated });

    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    } catch (error) {
      console.warn("Erro ao salvar ticket no Firestore:", error);
    }
  }, [saveFallbackTickets]);

  const updateTicket = useCallback(async (id: string, updates: Partial<MockTicket>) => {
    const currentList = [...fallbackTicketsRef.current];
    const idx = currentList.findIndex(t => t.id === id);
    if (idx > -1) {
      currentList[idx] = { ...currentList[idx], ...updates } as MockTicket;
      saveFallbackTickets(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_TICKETS', payload: currentList });
    }

    try {
      await updateDoc(doc(db, 'tickets', id), updates);
    } catch (error) {
      console.warn("Erro ao atualizar ticket no Firestore:", error);
    }
  }, [saveFallbackTickets]);

  const seedMockData = useCallback(async () => {}, []);

  return (
    <TicketsContext.Provider value={{ tickets, isLoading, createTicket, updateTicket, seedMockData }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) throw new Error('useTickets must be used within a TicketsProvider');
  return context;
}
