import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query 
} from 'firebase/firestore';
import { type MockChatSession } from '../mocks/data';
import { redactSensitiveData } from '../lib/redaction';

interface ChatsContextValue {
  chats: MockChatSession[];
  isLoading: boolean;
  createChat: (chat: MockChatSession) => Promise<void>;
  updateChat: (id: string, updates: Partial<MockChatSession>) => Promise<void>;
  seedMockData: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  // Inicializa limpo (sem injetar bots/mock data se o localStorage for limpo)
  const [chats, setChats] = useState<MockChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('portal_fallback_chats');
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
  const fallbackChatsRef = useRef<MockChatSession[]>(chats);

  const saveFallbackChats = useCallback((newChats: MockChatSession[]) => {
    fallbackChatsRef.current = newChats;
    setChats(newChats);
    try {
      localStorage.setItem('portal_fallback_chats', JSON.stringify(newChats));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage:', e);
    }
  }, []);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('chat_sync_fallback');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'SYNC_CHATS') {
          fallbackChatsRef.current = event.data.payload;
          setChats([...fallbackChatsRef.current]);
          localStorage.setItem('portal_fallback_chats', JSON.stringify(event.data.payload));
        }
      };
    } catch (e) {}
    return () => channelRef.current?.close();
  }, []);

  // Escuta diretamente na coleção 'chat_sessions' do Firestore em tempo real
  useEffect(() => {
    const q = query(collection(db, 'chat_sessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChats: MockChatSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        firestoreChats.push({
          id: docSnap.id,
          clientName: data.clientName || data.clientEmail?.split('@')[0] || 'Cliente',
          clientEmail: data.clientEmail || data.clientId || data.requesterId || '',
          status: data.status || 'waiting',
          agentName: data.agentName || null,
          queue: data.queue || 'Chat ao vivo',
          waitingMinutes: data.waitingMinutes ?? 0,
          messages: data.messages || [],
          createdAt: data.createdAt || new Date().toISOString(),
          ticketId: data.ticketId,
          rating: data.rating,
          ratingComment: data.ratingComment
        });
      });

      firestoreChats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveFallbackChats(firestoreChats);
      setIsLoading(false);
    }, (error) => {
      console.warn("Aviso Firestore Chats:", error?.message);
      setIsLoading(false);
      const saved = localStorage.getItem('portal_fallback_chats');
      if (saved) {
        try { setChats(JSON.parse(saved)); } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, [saveFallbackChats]);

function sanitizeMessages(messages?: any[]): any[] | undefined {
  if (!messages) return undefined;
  return messages.map((m) => ({
    ...m,
    body: redactSensitiveData(m.body || ''),
  }));
}

  const createChat = useCallback(async (chat: MockChatSession) => {
    const sanitizedChat = {
      ...chat,
      messages: sanitizeMessages(chat.messages) || [],
    };

    const updated = [sanitizedChat, ...fallbackChatsRef.current];
    saveFallbackChats(updated);
    channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: updated });

    try {
      await setDoc(doc(db, 'chat_sessions', sanitizedChat.id), sanitizedChat);
    } catch (error) {
      console.warn("Erro ao salvar chat no Firestore:", error);
    }
  }, [saveFallbackChats]);

  const updateChat = useCallback(async (id: string, updates: Partial<MockChatSession>) => {
    const sanitizedUpdates = {
      ...updates,
      ...(updates.messages ? { messages: sanitizeMessages(updates.messages) } : {}),
    };

    const currentList = [...fallbackChatsRef.current];
    const idx = currentList.findIndex(c => c.id === id);
    if (idx > -1) {
      currentList[idx] = { ...currentList[idx], ...sanitizedUpdates };
      saveFallbackChats(currentList);
      channelRef.current?.postMessage({ type: 'SYNC_CHATS', payload: currentList });
    }

    try {
      await updateDoc(doc(db, 'chat_sessions', id), sanitizedUpdates);
    } catch (error) {
      console.warn("Erro ao atualizar chat no Firestore:", error);
    }
  }, [saveFallbackChats]);

  const seedMockData = useCallback(async () => {}, []);

  return (
    <ChatsContext.Provider value={{ chats, isLoading, createChat, updateChat, seedMockData }}>
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatsContext);
  if (!context) throw new Error('useChats must be used within a ChatsProvider');
  return context;
}
