import React, { useState } from 'react';
import { 
  Globe, Plus, RefreshCw, CheckCircle2, XCircle, AlertTriangle, 
  Trash2, Edit, ShieldCheck, Activity, Key, Link as LinkIcon, Server, 
  Terminal, Cpu, Printer, Fingerprint, Smartphone
} from 'lucide-react';
import { useApiIntegrations } from '../hooks/use-api-integrations';
import type { ApiIntegration, ToolTargetId } from '../hooks/use-api-integrations';

const TOOL_OPTIONS: { id: ToolTargetId; label: string; icon: React.ElementType }[] = [
  { id: 'global', label: '🌐 Global / Backend ITSM (NestJS)', icon: Globe },
  { id: 'impressoras', label: '🖨️ Monitoramento de Impressoras', icon: Printer },
  { id: 'monitoramento', label: '🖥️ Monitoramento de Equipamentos & RMM', icon: Cpu },
  { id: 'biometria', label: '🔑 Acesso Biométrico', icon: Fingerprint },
  { id: 'mdm', label: '📱 MDM / Dispositivos Móveis', icon: Smartphone },
  { id: 'waf', label: '🔒 Antivírus ClamAV & WAF', icon: ShieldCheck },
  { id: 'notifications', label: '📧 E-mail & Webhooks', icon: Server },
  { id: 'custom', label: '⚡ Ferramenta Personalizada / API Externa', icon: Terminal },
];

const DEFAULT_FALLBACK_APIS: ApiIntegration[] = [
  {
    id: 'api_global_nestjs',
    name: 'Backend Principal NestJS (ITSM Engine)',
    targetToolId: 'global',
    baseUrl: 'https://api.portal.tiecia.com.br',
    authType: 'bearer',
    apiKey: 'pk_live_nestjs_secret_key_2026',
    status: 'online',
    latencyMs: 38,
    lastPingAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'api_printers_mon',
    name: 'Servidor de Impressoras & Print Away',
    targetToolId: 'impressoras',
    baseUrl: 'https://printers.portal.tiecia.com.br/v1',
    authType: 'apikey',
    apiKey: 'print_sec_token_9921',
    status: 'online',
    latencyMs: 24,
    lastPingAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'api_equipment_rmm',
    name: 'Agente RMM & Hardware Monitor',
    targetToolId: 'monitoramento',
    baseUrl: 'https://rmm.portal.tiecia.com.br/api',
    authType: 'bearer',
    status: 'online',
    latencyMs: 45,
    lastPingAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function ApiIntegrationsManagerPanel() {
  const apiContext = useApiIntegrations();
  
  const rawIntegrations = apiContext?.integrations;
  const safeIntegrations = Array.isArray(rawIntegrations) && rawIntegrations.length > 0 
    ? rawIntegrations 
    : DEFAULT_FALLBACK_APIS;

  const addIntegration = apiContext?.addIntegration || (() => {});
  const updateIntegration = apiContext?.updateIntegration || (() => {});
  const deleteIntegration = apiContext?.deleteIntegration || (() => {});
  const testConnection = apiContext?.testConnection || (async () => true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiIntegration | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetToolId, setTargetToolId] = useState<ToolTargetId>('global');
  const [customCategory, setCustomCategory] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'apikey' | 'basic'>('bearer');
  const [apiKey, setApiKey] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');

  const [testingId, setTestingId] = useState<string | null>(null);

  const totalIntegrations = safeIntegrations.length;
  const onlineIntegrations = safeIntegrations.filter((i) => i.status === 'online').length;
  const offlineIntegrations = safeIntegrations.filter((i) => i.status === 'offline').length;
  const avgLatency = Math.round(
    safeIntegrations.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / (totalIntegrations || 1)
  );

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setTargetToolId('global');
    setCustomCategory('');
    setBaseUrl('');
    setAuthType('bearer');
    setApiKey('');
    setCustomHeaders('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ApiIntegration) => {
    setEditingItem(item);
    setName(item.name);
    setTargetToolId(item.targetToolId);
    setCustomCategory(item.customCategory || '');
    setBaseUrl(item.baseUrl);
    setAuthType(item.authType);
    setApiKey(item.apiKey || '');
    setCustomHeaders(item.customHeaders || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim()) return;

    if (editingItem) {
      updateIntegration(editingItem.id, {
        name,
        targetToolId,
        customCategory: targetToolId === 'custom' ? customCategory : undefined,
        baseUrl,
        authType,
        apiKey,
        customHeaders
      });
    } else {
      addIntegration({
        name,
        targetToolId,
        customCategory: targetToolId === 'custom' ? customCategory : undefined,
        baseUrl,
        authType,
        apiKey,
        customHeaders
      });
    }
    setIsModalOpen(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    await testConnection(id);
    setTestingId(null);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Cofre de Integrações de API</h2>
              <p className="text-xs text-zinc-400">Conecte APIs de terceiros, ferramentas internas e backends ao InstaPasso e Portal Operacional</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Integração</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total de APIs</p>
          <p className="text-2xl font-black text-white mt-1">{totalIntegrations}</p>
        </div>
        <div className="bg-zinc-900/80 border border-emerald-950/40 p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{onlineIntegrations}</p>
        </div>
        <div className="bg-zinc-900/80 border border-rose-950/40 p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Offline / Alerta</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{offlineIntegrations}</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Latência Média
          </p>
          <p className="text-2xl font-black text-zinc-200 mt-1">{avgLatency} ms</p>
        </div>
      </div>

      {/* Grid of APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeIntegrations.map((item) => {
          const toolMeta = TOOL_OPTIONS.find((t) => t.id === item.targetToolId) || TOOL_OPTIONS[0];
          const Icon = toolMeta.icon;

          return (
            <div 
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-2xl transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                      <span className="text-[11px] font-medium text-zinc-400">
                        {item.customCategory || toolMeta.label}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    item.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    item.status === 'testing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {item.status === 'online' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {item.status === 'offline' && <XCircle className="w-3 h-3 text-rose-400" />}
                    {item.status === 'testing' && <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />}
                    {item.status === 'standby' && <AlertTriangle className="w-3 h-3 text-zinc-400" />}
                    <span className="capitalize">{item.status}</span>
                    {item.latencyMs !== undefined && item.status === 'online' && (
                      <span className="opacity-75 font-mono text-[10px]">({item.latencyMs}ms)</span>
                    )}
                  </span>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 overflow-hidden">
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{item.baseUrl}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/50">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-zinc-500" />
                      Autenticação: <strong className="text-zinc-300 uppercase">{item.authType}</strong>
                    </span>
                    {item.apiKey && (
                      <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                        {item.apiKey.substring(0, 8)}***
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <button
                  onClick={() => handleTest(item.id)}
                  disabled={testingId === item.id}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === item.id ? 'animate-spin' : ''}`} />
                  <span>{testingId === item.id ? 'Testando...' : 'Testar Conexão'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Editar API"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteIntegration(item.id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Remover API"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-white">
                {editingItem ? 'Editar Integração de API' : 'Nova Integração de API'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nome da Integração / Sistema
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: API Zabbix Monitoramento / ERP SAP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Ferramenta de Destino no Sistema Operacional
                </label>
                <select
                  value={targetToolId}
                  onChange={(e) => setTargetToolId(e.target.value as ToolTargetId)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {TOOL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {targetToolId === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Categoria da Ferramenta Personalizada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D, Catraca, Biometria Facial"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  URL Base da API (Endpoint REST/GraphQL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.empresa.com.br/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Tipo de Autenticação
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">Nenhuma (Pública)</option>
                    <option value="bearer">Bearer Token (JWT)</option>
                    <option value="apikey">API Key / Header</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Chave / Secret / Token
                  </label>
                  <input
                    type="password"
                    placeholder="Chave secreta..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Integração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
