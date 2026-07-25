import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

interface AdminLoginProps {
  authError?: string;
}

/**
 * @component AdminLogin
 * Responsável pela autenticação e autorização (Zero-Trust) para a área administrativa.
 * O componente não aceita mais e-mail e senha, utilizando exclusivamente o Google OAuth2.
 */
export default function AdminLogin({ authError }: AdminLoginProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fluxo de autenticação híbrida (Auth + Firestore Rules)
   * 1. Autentica via Google SSO.
   * 2. Extrai o domínio corporativo do usuário.
   * 3. Consulta a coleção `domains` validando: Domínio Exato + Status ACTIVE + Role "Portal Operacional".
   * 4. Se falhar na autorização, desloga o usuário (Firebase signOut) para garantir o bloqueio da sessão.
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // O Firebase Authenticator gerencia o popup OAuth2 do Google.
      // A verdadeira validação (Zero-Trust) ocorrerá no componente Pai (App.tsx)
      // que detecta a mudança de estado e consulta o Firestore.
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google SSO error:", err);
      setError(err.message || 'Falha ao autenticar com o Google.');
      setIsLoading(false);
    }
    // Não damos isLoading(false) no sucesso porque o App.tsx vai interceptar o login e fazer o loading da validação.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded bg-foreground flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-bold text-xl">IP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Acesso Operacional</h1>
          <p className="text-muted text-sm mt-2">Área restrita para administradores do InstaPasso</p>
        </div>

        {(error || authError) && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start space-x-3">
            <span className="text-red-500 font-bold">!</span>
            <p className="text-sm text-red-500 font-medium">{error || authError}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-white text-black font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{isLoading ? 'Autenticando...' : 'Entrar com Conta Google'}</span>
        </button>
        
        <p className="text-center text-xs text-muted mt-4">
          O acesso é validado automaticamente pelas regras cadastradas no próprio sistema ("Portal Operacional").
        </p>

      </div>
    </div>
  );
}
