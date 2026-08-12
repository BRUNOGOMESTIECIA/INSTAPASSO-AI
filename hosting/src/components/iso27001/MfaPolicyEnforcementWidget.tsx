import React, { useState } from 'react';
import { useMfaPolicy } from '../../hooks/use-mfa-policy';
import { ShieldCheck, Lock, Smartphone, KeyRound, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export function MfaPolicyEnforcementWidget() {
  const { config, saveMfaPolicy, verifyTotpCode } = useMfaPolicy();
  const [testCode, setTestCode] = useState('123456');

  const handleToggleEnforced = () => {
    saveMfaPolicy({
      ...config,
      isMfaEnforced: !config.isMfaEnforced,
      lastUpdatedIso: new Date().toISOString(),
    });
  };

  const handleScopeChange = (scope: 'all' | 'admins_only') => {
    saveMfaPolicy({
      ...config,
      targetScope: scope,
      lastUpdatedIso: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Forçar MFA (Dois Fatores / 2FA) no SSO (Item 010)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exigência de segundo fator de autenticação (TOTP Authenticator / SMS) para operadores e admins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
            config.isMfaEnforced
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          }`}>
            {config.isMfaEnforced ? '🟢 2FA Obrigatorio' : '🟡 2FA Opcional'}
          </span>
          <button
            onClick={handleToggleEnforced}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {config.isMfaEnforced ? 'Desativar Exigência' : 'Ativar Exigência 2FA'}
          </button>
        </div>
      </div>

      {/* Escopo da Exigência */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Escopo de Aplicação Obrigatória do 2FA
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleScopeChange('admins_only')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer space-y-1 ${
              config.targetScope === 'admins_only'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              🔒 Apenas Administradores e Atendentes N1/N2 (Recomendado)
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Exige 2FA de quem gerencia chamados e tem permissões de TI.
            </p>
          </button>

          <button
            onClick={() => handleScopeChange('all')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer space-y-1 ${
              config.targetScope === 'all'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Lock className="w-4 h-4 text-blue-500" />
              🌐 Todos os Usuários do Sistema (Inclui Clientes)
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Exige segundo fator de todos os usuários cadastrados na plataforma.
            </p>
          </button>
        </div>
      </div>

      {/* Teste de Validação de Código 2FA */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-500" />
          Testar Validador TOTP de 6 Dígitos
        </h4>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            maxLength={6}
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Ex: 123456"
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-center tracking-widest text-slate-900 dark:text-slate-100 outline-none"
          />
          <button
            onClick={() => verifyTotpCode(testCode)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            🔑 Validar Código 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
