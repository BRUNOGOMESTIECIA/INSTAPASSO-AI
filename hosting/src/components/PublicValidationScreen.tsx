import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import type { Domain } from '../App';

interface PublicValidationScreenProps {
  domains: Domain[];
}

export default function PublicValidationScreen({ domains }: PublicValidationScreenProps) {
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
          setStatus({ type: 'error', message: 'Não foi possível obter o e-mail da sua conta Google.' });
          setLoading(false);
          return;
      }

      const emailParts = user.email.toLowerCase().split('@');
      const domainName = `@${emailParts[1]}`;

      // Validação contra a lista de domínios cadastrados (que está no App)
      const foundDomain = domains.find(d => d.domainName === domainName);

      if (!foundDomain) {
         setStatus({ type: 'error', message: `O domínio ${domainName} não está cadastrado no sistema.` });
      } else if (foundDomain.status === 'INACTIVE') {
         setStatus({ type: 'error', message: 'O domínio corporativo do seu e-mail foi desabilitado. Entre em contato com o administrador.' });
      } else if (foundDomain.status === 'DELETED') {
         setStatus({ type: 'error', message: 'O domínio corporativo do seu e-mail foi excluído do sistema.' });
      } else {
         const permissoesStr = foundDomain.allowedPages.length > 0 
            ? foundDomain.allowedPages.join(', ')
            : 'Nenhum sistema específico';
         setStatus({ type: 'success', message: `Acesso permitido! Autenticado via Google como: ${user.email}. Sistemas liberados: ${permissoesStr}` });
      }

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-api-key') {
         setStatus({ type: 'error', message: '⚠️ Erro de configuração: As chaves do Firebase (API Key) não foram configuradas no código ainda.' });
      } else {
         setStatus({ type: 'error', message: 'Erro ao autenticar com o Google. Verifique o console.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Acesso Corporativo</h2>
          <p className="text-muted text-sm">Faça login com sua conta Google corporativa para validar seu acesso.</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
             </svg>
            <span>{loading ? 'Processando...' : 'Continuar com Google'}</span>
          </button>
        </div>

        {status.type !== 'idle' && (
          <div className={`mt-6 p-4 rounded-lg text-sm border ${status.type === 'success' ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-red-950/30 border-red-900 text-red-400'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
