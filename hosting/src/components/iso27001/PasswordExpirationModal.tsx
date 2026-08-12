import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordExpirationModalProps {
  isOpen: boolean;
  daysOld: number;
  onSuccess: (newPass: string) => boolean;
}

export function PasswordExpirationModal({ isOpen, daysOld, onSuccess }: PasswordExpirationModalProps) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      toast.error('Informe sua senha atual.');
      return;
    }
    if (newPass.length < 8) {
      toast.error('A nova senha precisa de pelo menos 8 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('A confirmação da nova senha não confere.');
      return;
    }

    const ok = onSuccess(newPass);
    if (ok) {
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  const hasLength = newPass.length >= 8;
  const hasNumber = /\d/.test(newPass);
  const hasLetter = /[a-zA-Z]/.test(newPass);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900 dark:text-slate-100">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
              POLÍTICA DE SENHA 90 DIAS (Item 115)
            </span>
            <h2 className="text-base font-extrabold mt-1">
              Renovação Obrigatória de Senha
            </h2>
          </div>
        </div>

        {/* Mensagem de Alerta */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Sua senha expirou há {daysOld} dias.
          </p>
          <p className="text-[11px] leading-relaxed">
            De acordo com a norma corporativa ISO 27001, é necessário cadastrar uma nova credencial a cada 90 dias.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Senha Atual:
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Digite sua senha atual"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nova Senha Forte:
              </label>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirme a Nova Senha:
            </label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Validador de Requisitos de Senha */}
          <div className="space-y-1 pt-1 text-[11px] text-slate-500">
            <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 font-bold' : ''}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Pelo menos 8 caracteres
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber && hasLetter ? 'text-emerald-600 font-bold' : ''}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Letras e números combinados
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Lock className="w-4 h-4" />
            Salvar Nova Senha Corporativa
          </button>
        </form>
      </div>
    </div>
  );
}
