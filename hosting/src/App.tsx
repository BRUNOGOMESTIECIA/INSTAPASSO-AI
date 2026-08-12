import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

import PublicValidationScreen from './components/PublicValidationScreen';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { ApiIntegrationsProvider } from './hooks/use-api-integrations';

/**
 * @typedef {'ACTIVE' | 'INACTIVE' | 'DELETED'} DomainStatus
 * Representa o estado do domínio no sistema. 'DELETED' indica exclusão lógica (Soft Delete).
 */
export type DomainStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type OperatorRole = 'N1' | 'N2' | 'N3' | 'SOC' | 'INFRAESTRUTURA' | 'Administrador' | 'Super Administrador';

/**
 * @typedef {Object} Domain
 * Representa um cliente (Domínio) cadastrado no sistema de segurança.
 */
export interface Domain {
  id: string;
  companyName: string;
  domainName: string;
  status: DomainStatus;
  allowedPages: string[];
}

export interface Operator {
  id: string;
  fullName: string;
  email: string;
  role: OperatorRole;
  status: DomainStatus;
  permissions?: string[];
}

/** 
 * Lista de portais permitidos pelo sistema (Roles de Autorização).
 * O usuário só conseguirá acessar a aplicação se sua role exata estiver no array 'allowedPages'.
 */
export const AVAILABLE_PAGES = ['Portal Cliente', 'Portal Operacional'];

/**
 * @component App
 * Componente principal do InstaPasso. Gerencia o estado de autenticação (User Session)
 * e atua como um 'Guard' de rotas (Zero-Trust) para proteger o AdminPanel.
 */
function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('admin');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Monitorar estado de autenticação e aplicar regra Zero-Trust
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timer);
      setIsAuthLoading(true);
      
      if (firebaseUser) {
        try {
          const email = firebaseUser.email || '';
          const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const isTiecia = email.toLowerCase().endsWith('@tiecia.com.br');
          
          if (!isTiecia && !isDev) {
             setAuthError('Acesso Negado: Apenas e-mails corporativos (@tiecia.com.br) têm acesso ao Painel Admin.');
             await signOut(auth);
             setUser(null);
             setIsAuthLoading(false);
             return;
          }

          // Consulta a tabela de operadores
          const q = query(collection(db, 'operators'), where('email', '==', email.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          let hasAdminAccess = isDev; // Em dev local, libera acesso de Admin para testes
          
          querySnapshot.forEach((doc) => {
             const op = doc.data() as Operator;
             if (op.status === 'ACTIVE' && (op.role === 'Super Administrador' || op.role === 'Administrador')) {
                hasAdminAccess = true;
             }
          });

          if (hasAdminAccess) {
             // Acesso permitido
             setUser(firebaseUser);
             setAuthError('');
             setIsAuthLoading(false);
             return;
          } else {
             // Auto-seed no ambiente local (Emulador) para facilitar os testes
             if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                  const newOpRef = doc(collection(db, 'operators'));
                  await setDoc(newOpRef, {
                    id: newOpRef.id,
                    name: firebaseUser.displayName || 'Admin Local',
                    email: email.toLowerCase(),
                    role: 'Super Administrador',
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    modules: ['*']
                  });
                  console.log("Auto-seed de operador criado no emulador.");
                  setUser(firebaseUser);
                  setAuthError('');
                  setIsAuthLoading(false);
                  return;
                } catch (err) {
                  console.error("Falha no auto-seed do emulador", err);
                }
             }
             setAuthError('Acesso Negado: Você não possui privilégios de Administrador ou Super Administrador.');
             await signOut(auth);
             setUser(null);
             setIsAuthLoading(false);
          }
          
        } catch(e) {
           console.error("Erro na validação de segurança:", e);
           setAuthError('Erro ao validar permissões no servidor.');
           await signOut(auth);
           setUser(null);
           setIsAuthLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthLoading(false);
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Carregar domínios e operadores do Firestore em tempo real
  useEffect(() => {
    if (!user) {
      setDomains([]);
      setOperators([]);
      return;
    }

    const unsubscribeDomains = onSnapshot(collection(db, 'domains'), (snapshot) => {
      const domainsData: Domain[] = [];
      snapshot.forEach((doc) => {
        domainsData.push({ id: doc.id, ...doc.data() } as Domain);
      });
      setDomains(domainsData);
    }, (error) => {
      console.error('Erro ao buscar domínios do Firestore:', error);
    });

    const unsubscribeOperators = onSnapshot(collection(db, 'operators'), (snapshot) => {
      const operatorsData: Operator[] = [];
      snapshot.forEach((doc) => {
        operatorsData.push({ id: doc.id, ...doc.data() } as Operator);
      });
      setOperators(operatorsData);
    }, (error) => {
      console.error('Erro ao buscar operadores do Firestore:', error);
    });

    return () => {
        unsubscribeDomains();
        unsubscribeOperators();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
  };

  return (
    <ApiIntegrationsProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center">
                <span className="text-zinc-950 font-black text-xs">IP</span>
              </div>
              <span className="font-bold tracking-tight text-zinc-100">InstaPasso</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <nav className="flex space-x-1 border border-zinc-800 rounded-lg p-1 bg-zinc-900">
                <button
                  onClick={() => setCurrentView('public')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'public'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  Tela Pública
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'admin'
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  Painel Admin
                </button>
              </nav>

              {user && (
                <button 
                  onClick={handleLogout}
                  className="text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded-md transition-colors"
                >
                  Sair
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col">
          {currentView === 'public' ? (
            <PublicValidationScreen />
          ) : (
            isAuthLoading ? (
              <div className="flex-grow flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-zinc-400 text-sm font-medium">Verificando segurança do InstaPasso...</p>
                </div>
              </div>
            ) : user ? (
              <AdminPanel domains={domains} setDomains={setDomains} operators={operators} />
            ) : (
              <AdminLogin authError={authError} />
            )
          )}
        </main>
        
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} InstaPasso. Conformidade LGPD e ISO 27001.
        </footer>
      </div>
    </ApiIntegrationsProvider>
  );
}

export default App;
