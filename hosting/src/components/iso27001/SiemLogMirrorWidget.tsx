import React, { useState, useEffect } from 'react';
import { Globe, Radio, ShieldCheck, Terminal, Settings, CheckCircle2, Zap, Clock, RefreshCw, Send, Lock } from 'lucide-react';
import { getSiemConfig, saveSiemConfig, getSiemMetrics, testSiemLogMirror, type SiemConfig, type SiemStreamMetrics, type SiemProvider, type SiemLogFormat } from '../../lib/siem-log-mirror';
import { toast } from 'sonner';

/**
 * 🌐 Widget do Item 020: Espelhamento de Logs de Auditoria para SIEM / Datadog
 */
export function SiemLogMirrorWidget() {
  const [config, setConfig] = useState<SiemConfig>(getSiemConfig());
  const [metrics, setMetrics] = useState<SiemStreamMetrics>(getSiemMetrics());
  const [isTesting, setIsTesting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastTestPayload, setLastTestPayload] = useState<any>(null);

  useEffect(() => {
    setMetrics(getSiemMetrics());
  }, []);

  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const res = await testSiemLogMirror();
      setMetrics(res.metrics);
      setLastTestPayload(res.payload);
      toast.success(`Log de auditoria enviado com sucesso para o ${config.provider.toUpperCase()}!`);
    } catch (err) {
      toast.error('Erro ao enviar teste para o SIEM.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiemConfig(config);
    setShowConfigModal(false);
    toast.success('Configurações do espelhamento SIEM atualizadas com sucesso!');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 relative">
            <Globe className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Espelhamento de Logs para SIEM / Datadog
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Item 020
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Stream contínuo da trilha de auditoria ISO 27001 para Datadog, Splunk, Elastic e Syslog.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            Configurar SIEM
          </button>
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Testar Envio SIEM / Datadog
          </button>
        </div>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status do Envio</p>
              <p className="text-sm font-black text-emerald-400">🟢 SIEM STREAM LIVE</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Eventos Espelhados</p>
              <p className="text-sm font-black text-white">{metrics.totalMirroredEvents.toLocaleString()} Logs</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Provedor Ativo</p>
              <p className="text-sm font-black text-indigo-300 uppercase">{config.provider}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {config.format.toUpperCase()}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Última Transmissão</p>
              <p className="text-sm font-black text-slate-200">
                {new Date(metrics.lastExportTimestamp).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exibição do Payload do Último Envio ao SIEM */}
      {lastTestPayload && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-200">Payload Transmitido ao {config.provider.toUpperCase()} (JSON / CEF)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">200 OK - HTTP INTAKE</span>
          </div>

          <pre className="text-slate-300 max-h-40 overflow-y-auto p-2 bg-slate-900/60 rounded-lg text-[11px] leading-relaxed border border-slate-800">
            {typeof lastTestPayload === 'string'
              ? lastTestPayload
              : JSON.stringify(lastTestPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Modal de Configuração do Provedor SIEM */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveConfig} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-base text-white">Configurar Espelhamento SIEM / SOC</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Provedor SIEM / SOC</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as SiemProvider })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="datadog">Datadog Logs (HTTP Intake)</option>
                  <option value="splunk">Splunk HEC (HTTP Event Collector)</option>
                  <option value="elastic">Elastic / Logstash</option>
                  <option value="syslog">Syslog UDP/TCP (RFC 5424)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Formato do Payload</label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value as SiemLogFormat })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="json_datadog">JSON Datadog Standard (`ddsource` / `ddtags`)</option>
                  <option value="cef">CEF (Common Event Format - ArcSight / Micro Focus)</option>
                  <option value="syslog_rfc5424">Syslog Standard RFC 5424</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">API Key / Token do SIEM</label>
                <div className="relative">
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono pr-8"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">URL de Intake / Webhook</label>
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Salvar Configurações SIEM
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
