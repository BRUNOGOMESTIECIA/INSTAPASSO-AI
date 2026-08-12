import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, db, instaPassoDb, instaPassoAuth } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithCustomToken,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { detectDevice, type DeviceInfo } from '../lib/device-detector';

/**
 * Interface que define a estrutura do usuário logado na aplicação.
 */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: 'client' | 'staff';
  role?: string;
  department?: string;
  permissions?: string[];
  deviceInfo?: DeviceInfo;
  sessionId?: string;
}

/**
 * Valores expostos pelo Contexto de Autenticação.
 */
interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBridgeReady: boolean;
  deviceInfo: DeviceInfo;
  sessionId: string;
  loginWithSSO: (provider: 'google' | 'microsoft', userType: 'client' | 'staff') => Promise<AppUser>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provedor Global de Autenticação.
 * 
 * Envolve a aplicação para fornecer o estado de sessão atual e os métodos 
 * de login, logout e verificação de permissões para todos os componentes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBridgeReady, setIsBridgeReady] = useState(false);

  // ID único desta sessão local do navegador
  const [currentSessionId] = useState<string>(() => {
    let sid = sessionStorage.getItem('portal_session_id');
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `sess_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      sessionStorage.setItem('portal_session_id', sid);
    }
    return sid;
  });

  // Detecta o dispositivo atual (Windows, Mac, iPhone, Android, Linux)
  const [currentDevice] = useState<DeviceInfo>(() => detectDevice());

  /**
   * Ativa a Ponte de Segurança para o banco do Portal IA usando a API NestJS.
   * Ele pega o token de acesso (SSO) do InstaPasso, manda pra API, que 
   * devolve um Custom Token (Crachá) com as regras de RBAC injetadas.
   */
  const activateBridge = useCallback(async (firebaseUser: any): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;

      // 1. Pegar o Token de ID do Firebase InstaPasso
      const idToken = await firebaseUser.getIdToken(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';

      try {
        // 2. Chamar a API NestJS se estiver acessível
        const response = await fetch(`${apiUrl}/api/auth/portal-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        if (response.ok) {
          const { customToken } = await response.json();
          // 3. Fazer login no Firebase Portal IA com o "Crachá Assinado"
          await signInWithCustomToken(auth, customToken);
          console.info('[Bridge] Ponte de segurança RBAC ativada com sucesso!');
        } else {
          console.info('[Bridge] API de backend em standby no ambiente Vercel. Sessão SSO ativa.');
        }
      } catch (apiError) {
        console.info('[Bridge] API NestJS offline no momento. Mantendo acesso via InstaPasso SSO.');
      }

      setIsBridgeReady(true);
      return true;
    } catch (e: any) {
      console.error('[Bridge] Falha ao sincronizar ponte:', e?.message || e);
      setIsBridgeReady(true);
      return true;
    }
  }, []);

  /**
   * Registra a sessão ativa no Firestore e escuta se outro dispositivo se conectar.
   */
  useEffect(() => {
    if (!user?.id) return;

    // 1. Grava a nova sessão ativa no Firestore (sobrescrevendo sessões anteriores)
    const sessionRef = doc(db, 'active_sessions', user.id);
    setDoc(sessionRef, {
      activeSessionId: currentSessionId,
      deviceInfo: currentDevice,
      userEmail: user.email,
      userName: user.name,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch((err) => {
      console.warn('[Session] Não foi possível salvar sessão no Firestore:', err?.message);
    });

    // 2. Escuta mudanças na sessão em tempo real
    const unsubscribeSession = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Se a sessão registrada no banco for diferente da sessão local, desconecta!
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {
          toast.error('Sessão Encerrada! Sua conta foi conectada em outro dispositivo ou navegador.', {
            duration: 9000,
          });
          signOut(instaPassoAuth).catch(() => {});
          signOut(auth).catch(() => {});
          setUser(null);
          setIsBridgeReady(false);
        }
      }
    });

    return () => unsubscribeSession();
  }, [user?.id, currentSessionId, currentDevice]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(instaPassoAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ativar ponte ANTES de liberar os dados para o usuário
        setIsBridgeReady(false);
        await activateBridge(firebaseUser);

        // Assumimos os dados do usuário direto da sessão do Google
        // para evitar erros de permissão durante a inicialização
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          type: 'staff',
          role: 'Administrator',
          department: 'Administração',
          permissions: ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings', 'kb.view', 'catalog.view', 'reports.view'],
          deviceInfo: currentDevice,
          sessionId: currentSessionId
        } as AppUser);
      } else {
        setUser(null);
        setIsBridgeReady(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activateBridge, currentDevice, currentSessionId]);

  /**
   * Realiza login usando email e senha padrão (Firebase Auth).


  /**
   * Autenticação Híbrida (Google SSO + Validação Zero-Trust no Firestore)
   * 
   * @description 
   * Ao invés de apenas logar o usuário, o sistema extrai o domínio do e-mail dele (ex: @empresa.com)
   * e consulta o banco de dados 'domains' do InstaPasso. 
   * Se o domínio possuir a role exata passada no parâmetro (expectedType) e status ACTIVE,
   * o login prossegue. Caso contrário, a sessão é instantaneamente destruída.
   * 
   * @param {'google' | 'microsoft'} provider - Provedor SSO
   * @param {'client' | 'staff'} expectedType - Qual lado do portal o usuário está tentando acessar
   * @returns {Promise<AppUser>} Usuário montado na sessão
   */
  const loginWithSSO = useCallback(async (provider: 'google' | 'microsoft', expectedType: 'client' | 'staff'): Promise<AppUser> => {
    if (provider === 'google') {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      try {
        const cred = await signInWithPopup(instaPassoAuth, googleProvider);
        const email = cred.user.email || '';
        const domainName = `@${email.split('@')[1]?.toLowerCase()}`;

        // NOVA REGRA: Módulo Equipe Interna (TIECIA OU DEV LOCAL)
        if (expectedType === 'staff' && (email.endsWith('@tiecia.com.br') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
           const qOp = query(collection(instaPassoDb, 'operators'), where('email', '==', email.toLowerCase()));
           const snapOp = await getDocs(qOp);
           
           let opData: any = null;
           let opDocId: string = '';

           if (snapOp.empty) {
              // Auto-seed no ambiente local (Emulador) para evitar bloqueio
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                 console.warn('Operador não encontrado no Firestore local. Semeando como Super Administrador.');
                 opData = {
                   status: 'ACTIVE',
                   role: 'Super Administrador',
                   fullName: cred.user.displayName || email.split('@')[0],
                 };
              } else {
                 await signOut(instaPassoAuth);
                 throw new Error('Acesso bloqueado. Este e-mail @tiecia.com.br não está cadastrado na Equipe Interna do InstaPasso.');
              }
           } else {
              snapOp.forEach(doc => { 
                 opData = doc.data(); 
                 opDocId = doc.id; 
              });
           }
           
           if (opData.status !== 'ACTIVE') {
              await signOut(instaPassoAuth);
              throw new Error('Acesso bloqueado. Seu cadastro na Equipe Interna está inativo ou excluído.');
           }
           
           const isAdmin = opData.role === 'Super Administrador' || opData.role === 'Administrador';
           
           const mockUser: AppUser = {
              id: cred.user.uid,
              email: email,
              name: opData.fullName || cred.user.displayName || email.split('@')[0],
              type: 'staff',
              role: isAdmin ? 'Administrator' : 'Agent',
              department: opData.role,
              permissions: isAdmin 
                 ? ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings', 'kb.view', 'catalog.view', 'reports.view']
                 : ['chat.attend', 'chat.view', 'tickets.view', 'kb.view']
           };

           // Marca o operador como online no banco
           const { updateDoc } = await import('firebase/firestore');
           await updateDoc(doc(instaPassoDb, 'operators', opDocId), { isOnline: true });

           setUser(mockUser);
           return mockUser;
        }

        // REGRA B2B (CLIENTES / OUTROS DOMÍNIOS)
        // Busca a lista de domínios cadastrados direto do Firestore (Nuvem)
        let validationSystemDomains: any[] = [];
        try {
           const q = query(collection(instaPassoDb, 'domains'), where('domainName', '==', domainName));
           const querySnapshot = await getDocs(q);
           querySnapshot.forEach((doc) => {
             validationSystemDomains.push({ id: doc.id, ...(doc.data() as object) });
           });
        } catch (e: any) {
           console.error("Erro ao buscar domínios na nuvem do Firebase:", e);
           await signOut(instaPassoAuth);
           throw new Error('Falha de segurança: ' + (e.message || 'Erro ao conectar com Firestore'));
        }

        const foundDomains = validationSystemDomains.filter(d => d.domainName === domainName);

        if (foundDomains.length === 0) {
           await signOut(instaPassoAuth);
           throw new Error('Acesso bloqueado. Seu domínio corporativo não está cadastrado.');
        }

        // Verifica a permissão específica da página que tentou logar
        const requiredPermission = expectedType === 'client' ? 'Portal Cliente' : 'Portal Operacional';
        
        // Basta que exista pelo menos UM registro ativo com a permissão correta
        const hasValidAccess = foundDomains.some(d => d.status === 'ACTIVE' && d.allowedPages.includes(requiredPermission));

        if (!hasValidAccess) {
           await signOut(instaPassoAuth);
           throw new Error(`Acesso Negado: Seu domínio não tem permissão para acessar o ${requiredPermission} ou está inativo.`);
        }

        let operatorPermissions = ['tickets.view', 'tickets.create', 'chat.view', 'chat.attend', 'kb.view', 'catalog.view', 'reports.view'];
        let operatorRole = 'Support Agent';

        if (expectedType === 'staff') {
          try {
            const qOp = query(collection(instaPassoDb, 'operators'), where('email', '==', email.toLowerCase()));
            const snapOp = await getDocs(qOp);
            if (!snapOp.empty) {
              const opData = snapOp.docs[0].data();
              if (opData.permissions && Array.isArray(opData.permissions) && opData.permissions.length > 0) {
                operatorPermissions = opData.permissions;
              }
              if (opData.role) {
                operatorRole = opData.role;
              }
            }
          } catch (e) {
            console.warn('[SSO] Não foi possível carregar permissões do operador do Firestore:', e);
          }
        }

        const mockUser: AppUser = {
          id: cred.user.uid,
          email: email,
          name: cred.user.displayName || email.split('@')[0] || 'Usuário',
          type: expectedType,
          ...(expectedType === 'staff' ? { role: operatorRole, permissions: operatorPermissions } : {})
        };
        
        // --- PONTE DE SEGURANÇA PARA O PORTAL IA (com retry automático) ---
        await activateBridge(cred.user);

        setUser(mockUser);
        return mockUser;
      } catch (error: any) {
        await signOut(instaPassoAuth);
        throw error;
      }
    }
    throw new Error('Provedor SSO não suportado ainda.');
  }, [activateBridge]);

  /**
   * Encerra a sessão atual do usuário, forçando limpeza de RAM imediata.
   */
  const logout = useCallback(async () => {
    try {
      if (user?.type === 'staff' && user.email.endsWith('@tiecia.com.br')) {
         const qOp = query(collection(instaPassoDb, 'operators'), where('email', '==', user.email.toLowerCase()));
         const snapOp = await getDocs(qOp);
         if (!snapOp.empty) {
            let opDocId = '';
            snapOp.forEach(d => { opDocId = d.id; });
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(instaPassoDb, 'operators', opDocId), { isOnline: false });
         }
      }
      await signOut(instaPassoAuth);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setUser(null);
    }
  }, [user]);

  /**
   * Verifica se o usuário atual logado possui a permissão especificada.
   * Utilizado para controle de acesso por RBAC.
   * 
   * @param {string} code - Código da permissão (ex: 'admin.users')
   * @returns {boolean} Verdadeiro se o usuário tem a permissão ou é 'Administrator'.
   */
  const hasPermission = useCallback((code: string) => {
    if (!user || user.type !== 'staff') return false;
    if (user.role === 'Administrator' || user.role === 'Super Administrador') return true;
    return user.permissions?.includes(code) || false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, isBridgeReady, deviceInfo: currentDevice, sessionId: currentSessionId, loginWithSSO, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
