import React from 'react';
import { useCryptographyAudit } from '../../hooks/use-cryptography-audit';
import { ShieldCheck, Lock, Key, Server, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';

export function EncryptionComplianceWidget() {
  const { cryptoStatus, runEncryptionComplianceAudit } = useCryptographyAudit();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Criptografia em Trânsito (TLS 1.3) & Repouso (AES-256) (Item 111)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Painel de auditoria e verificação de chaves de cifragem para conformidade ISO 27001 / FIPS 140-2
            </p>
          </div>
        </div>

        <button
          onClick={runEncryptionComplianceAudit}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Auditar Criptografia
        </button>
      </div>

      {/* Cards de Status de Criptografia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Criptografia em Trânsito */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Criptografia em Trânsito
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">
              {cryptoStatus.inTransitVersion}
            </p>
            <p className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 truncate" title={cryptoStatus.inTransitCipher}>
              Cifra: {cryptoStatus.inTransitCipher}
            </p>
          </div>
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            🟢 HTTPS Forçado
          </span>
        </div>

        {/* Criptografia em Repouso */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Criptografia em Repouso
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">
              {cryptoStatus.atRestAlgorithm}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Banco de Dados & Object Storage Cifrados
            </p>
          </div>
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            🔒 Hardware Security Module (HSM)
          </span>
        </div>

        {/* Rotação de Chaves */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Política de Rotação de Chaves
            </span>
            <Key className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">
              A cada {cryptoStatus.keyRotationDays} Dias
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Última rotação: {new Date(cryptoStatus.lastKeyRotationIso).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            🔑 FIPS 140-2 Conforme
          </span>
        </div>
      </div>
    </div>
  );
}
