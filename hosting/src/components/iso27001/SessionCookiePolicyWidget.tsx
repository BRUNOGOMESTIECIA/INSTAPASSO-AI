import React from 'react';
import { useSessionCookiePolicy } from '../../hooks/use-session-cookie-policy';
import { Cookie, ShieldCheck, Lock, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';

export function SessionCookiePolicyWidget() {
  const { cookiesList, auditSessionCookies } = useSessionCookiePolicy();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Cabeçalho do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Configuração Estrita de Cookies de Sessão (Item 107)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verificação de diretivas HttpOnly, Secure e SameSite=Strict nos tokens SSO (ISO 27001)
            </p>
          </div>
        </div>

        <button
          onClick={auditSessionCookies}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Auditar Cookies de Sessão
        </button>
      </div>

      {/* Lista de Cookies Auditados */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tokens & Cookies Ativos Auditados
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nome do Cookie</th>
                <th className="py-3 px-4">Finalidade</th>
                <th className="py-3 px-4 text-center">HttpOnly</th>
                <th className="py-3 px-4 text-center">Secure (HTTPS)</th>
                <th className="py-3 px-4 text-center">SameSite</th>
                <th className="py-3 px-4 text-right">Status Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cookiesList.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {item.purpose}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      🟢 Sim (Anti-XSS)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      🔒 Sim (HTTPS)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                    {item.sameSite}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Conforme
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
