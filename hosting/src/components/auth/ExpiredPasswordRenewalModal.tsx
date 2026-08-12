import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, CheckCircle2, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { updateUserPasswordWithPolicy } from '../../lib/password-rotation-policy';
import { toast } from 'sonner';

interface ExpiredPasswordRenewalModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  daysActive: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 🔒 Modal do Item 138: Renovação Obrigatória de Senha Expirada (90 Dias)
 */
export function ExpiredPasswordRenewalModal({
  isOpen,
  userEmail,
  userName,
  daysActive,
  onClose,
  onSuccess,
}: ExpiredPasswordRenewalModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('As senhas digitadas não coincidem!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserPasswordWithPolicy(userEmail, newPassword);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Erro ao renovar senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-100 relative overflow-hidden"
      >
        {/* Glow de Alerta Vermelho */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Sua Senha Expirou!</h3>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Item 138
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Política de Segurança de 90 Dias (ISO 27001)</p>
            </div>
          </div>
        </div>

        {/* Banner de Aviso de Expiração */}
        <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-between text-xs text-rose-200">
          <div>
            <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider block">Status da Credencial</span>
            <span className="font-extrabold text-sm text-rose-100">
              {daysActive} dias sem alteração (Excedeu 90 dias)
            </span>
          </div>
          <span className="px-2 py-1 bg-rose-500 text-slate-950 font-black rounded-lg text-[10px]">
            🔴 EXPIRADA
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          Olá, <strong>{userName}</strong>! Para sua proteção e em conformidade com as políticas corporativas de TI, é obrigatório redefinir sua senha para prosseguir.
        </p>

        {/* Form Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nova Senha Corporativa *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Nova Senha *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Digite exatamente a mesma senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        {/* Dica de Segurança */}
        <p className="text-[10.5px] text-slate-400 font-mono">
          ℹ️ A nova senha não pode ser igual a nenhuma das suas últimas 3 senhas utilizadas.
        </p>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            Renovar Senha & Conectar ao Portal
          </button>
        </div>
      </form>
    </div>
  );
}
