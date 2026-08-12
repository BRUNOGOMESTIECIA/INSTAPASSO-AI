import React, { useState } from 'react';
import { useSecurityHeadersPolicy, type SecurityHeadersConfig } from '../../hooks/use-security-headers-policy';
import { ShieldCheck, Lock, Globe, Server, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function HttpSecurityHeadersWidget() {
  const { config, saveConfig, runHeaderAuditTest } = useSecurityHeadersPolicy();
  const [form, setForm] = useState<SecurityHeadersConfig>(config);

  const handleChange = <K extends keyof SecurityHeadersConfig>(key: K, value: SecurityHeadersConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(form);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Cabeçalhos HTTP de Segurança (CSP & Hardening - Item 108)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proteção anti-XSS, anti-clickjacking e anti-MIME-sniffing em conformidade com a ISO 27001
            </p>
          </div>
        </div>

        <button
          onClick={runHeaderAuditTest}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Testar & Auditar Cabeçalhos
        </button>
      </div>

      {/* Badges de Status dos Cabeçalhos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              Content-Security-Policy
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {form.cspEnabled ? '🟢 Ativo (Anti-XSS)' : '🔴 Desativado'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              X-Content-Type-Options
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {form.noSniffEnabled ? '🟢 nosniff (Anti-MIME)' : '🔴 Desativado'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              Frame-Ancestors
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={form.frameAncestors}>
            🟢 Anti-Clickjacking
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              Referrer-Policy
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={form.referrerPolicy}>
            🟢 strict-origin
          </p>
        </div>
      </div>

      {/* Formulário de Parâmetros */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Parâmetros Globais dos Cabeçalhos de Resposta HTTP
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Diretiva CSP script-src (Fontes de Scripts Autorizadas):
            </label>
            <input
              type="text"
              value={form.cspScriptSrc}
              onChange={(e) => handleChange('cspScriptSrc', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Diretiva frame-ancestors (Domínios Autorizados para iframe):
            </label>
            <input
              type="text"
              value={form.frameAncestors}
              onChange={(e) => handleChange('frameAncestors', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.noSniffEnabled}
                onChange={(e) => handleChange('noSniffEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Habilitar X-Content-Type-Options: nosniff
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.hstsEnabled}
                onChange={(e) => handleChange('hstsEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Habilitar HSTS (Strict-Transport-Security)
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Salvar Parâmetros de Cabeçalhos HTTP
        </button>
      </form>
    </div>
  );
}
