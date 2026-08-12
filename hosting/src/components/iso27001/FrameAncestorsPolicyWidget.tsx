import React, { useState } from 'react';
import { useFrameAncestorsPolicy } from '../../hooks/use-frame-ancestors-policy';
import { LayoutTemplate, ShieldCheck, Lock, Plus, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function FrameAncestorsPolicyWidget() {
  const { config, addDomain, removeDomain, simulateIframeSecurityTest } = useFrameAncestorsPolicy();
  const [newDomain, setNewDomain] = useState('');
  const [testDomain, setTestDomain] = useState('https://site-malicioso-hacker.com');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    addDomain(newDomain);
    setNewDomain('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Topo do Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Diretiva CSP frame-ancestors no InstaPasso (Item 109)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Especificação estrita de quais domínios podem embutir o portal via iframe (Proteção Anti-Clickjacking)
            </p>
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 px-3 py-1 rounded-full border border-violet-300 dark:border-violet-800">
          🟢 frame-ancestors Ativo
        </span>
      </div>

      {/* Lista de Origens Autorizadas */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Domínios Autorizados para Embutimento via iframe (`frame-ancestors`)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.allowedDomains.map((dom) => (
            <div
              key={dom}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
            >
              <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate">{dom}</span>
              </div>
              {dom !== "'self'" && (
                <button
                  onClick={() => removeDomain(dom)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remover domínio autorizado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar Novo Domínio */}
        <form onSubmit={handleAdd} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Ex: https://parceiro.com.br"
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar Origem
          </button>
        </form>
      </div>

      {/* Caixa de Teste de Simulação de Tentativa de Clickjacking */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Testar Simulação de Embutimento em Iframe Não Autorizado
        </h4>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testDomain}
            onChange={(e) => setTestDomain(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
          />
          <button
            onClick={() => simulateIframeSecurityTest(testDomain)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            💥 Testar Bloqueio Anti-Clickjacking
          </button>
        </div>
      </div>
    </div>
  );
}
