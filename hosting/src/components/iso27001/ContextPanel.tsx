import React, { useState, useEffect, useRef } from 'react';
import { Shield, User, Monitor, Clock, CheckCircle2, AlertCircle, ExternalLink, Pencil, Check, ChevronDown } from 'lucide-react';
import { type MockChatSession, MOCK_CLIENTS, MOCK_STAFF, TICKET_CATEGORIES } from '../../mocks/data';
import { useNavigate } from 'react-router-dom';
import { NewManualTicketModal, type TicketInitialData } from './NewManualTicketModal';
import { maskEmail } from '../../lib/utils';
import { generateCorporateProtocol } from '../../lib/audit-logger';

// Variável global para manter o tempo rolando continuamente no sistema
const APP_START_TIME = Date.now();

export function ContextPanel({ 
  session, 
  onStatusChange,
  priority = 'alta',
  onPriorityChange
}: { 
  session: MockChatSession | null;
  onStatusChange?: (status: 'waiting' | 'active' | 'finished' | 'closed', ticketId?: string) => void;
  priority?: string;
  onPriorityChange?: (priority: string) => void;
}) {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const navigate = useNavigate();

  const [clientDetails, setClientDetails] = useState({
    nome: '',
    cargo: 'Analista de Vendas',
    email: '',
    unidade: 'São Paulo - SP',
    setor: 'Comercial',
    matricula: 'MAT-00892',
    telefone: '',
    categoria: 'Sistemas > ERP'
  });
  const [editingField, setEditingField] = useState<keyof typeof clientDetails | null>(null);

  useEffect(() => {
    if (session) {
      setClientDetails(prev => ({
        ...prev,
        nome: session.clientName,
        email: session.clientEmail,
      }));
    }
  }, [session]);

  // Estado global para forçar atualização da tela a cada segundo
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcula o SLA dinamicamente, sem nunca "resetar"
  let slaSeconds = 0;
  if (session) {
    const elapsedSeconds = Math.floor((now - APP_START_TIME) / 1000);
    if (session.status === 'waiting') {
      slaSeconds = (session.waitingMinutes || 0) * 60 + elapsedSeconds; // Fila: Conta para cima
    } else {
      slaSeconds = Math.max(0, 6320 - elapsedSeconds); // Ativo: SLA de resolução para baixo
    }
  }

  const formatSla = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cálculo da barra de progresso
  let slaPercentage = 0;
  let isSlaCritical = false;
  
  if (session?.status === 'waiting') {
    // SLA de primeira resposta: Supondo 15 min (900 seg)
    slaPercentage = Math.max(0, Math.min(100, (slaSeconds / 900) * 100));
    isSlaCritical = slaSeconds > 600; // Crítico se passou de 10 min
  } else {
    // SLA de resolução: Supondo 2 horas (7200 segundos)
    slaPercentage = Math.max(0, Math.min(100, (slaSeconds / 7200) * 100));
    isSlaCritical = slaPercentage < 15; // Menos de 15% do tempo = vermelho
  }

  // Helper para buscar dados do cliente logado no mock
  const getClientData = () => {
    if (!session?.clientEmail) return null;
    
    // 1. Busca por email exato primeiro
    const exactMatch = MOCK_CLIENTS.find(c => c.email === session.clientEmail);
    if (exactMatch) return exactMatch;
    
    // 2. Se não achar, cai no fallback de domínio (para mock)
    const domain = session.clientEmail.split('@')[1];
    return MOCK_CLIENTS.find(c => c.email.split('@')[1] === domain) || null;
  };

  const PRIORITIES = [
    { value: 'baixa',    label: 'Baixa',   color: 'text-slate-500',  dot: 'bg-slate-400' },
    { value: 'media',    label: 'Média',   color: 'text-amber-600',  dot: 'bg-amber-400' },
    { value: 'alta',     label: 'Alta',    color: 'text-orange-600', dot: 'bg-orange-500' },
    { value: 'critica',  label: 'Crítica', color: 'text-red-600',    dot: 'bg-red-500' },
  ];

  const getInitialTicketData = (): TicketInitialData => {
    const client = getClientData();
    const staff = MOCK_STAFF.find(s => s.name === session?.agentName);
    
    const chatHistory = session?.messages.map(m => {
      let time = '';
      try { time = new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch(e) {}
      return `[${time}] ${m.senderName}: ${m.body}`;
    }).join('\n') || '';

    const priorityMap: Record<string, any> = {
      baixa: 'low',
      media: 'medium',
      alta: 'high',
      critica: 'critical'
    };
    
    return {
      companyName: client?.company || session?.clientName || 'Cliente Novo',
      companySlug: client?.companySlug || session?.clientEmail.split('@')[1]?.split('.')[0] || 'novo',
      requesterId: client?.id || session?.clientEmail || '',
      title: '',
      description: chatHistory,
      priority: priorityMap[priority || 'alta'],
      type: 'Incidente',
      category: 'Sistemas / ERP',
      assigneeId: staff?.id || '',
      team: 'N1',
      ticketId: session?.ticketId,
    };
  };

  // Filtrando equipamentos vinculados ao colaborador atual via API
  const [userDevices, setUserDevices] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetch(`/api/v1/assets/users/${encodeURIComponent(session.clientName)}/devices`)
        .then(res => res.json())
        .then(data => setUserDevices(data))
        .catch(err => {
          console.error('Failed to fetch user devices, using mock for presentation:', err);
          if (session.clientName === 'André Carvalho') {
            setUserDevices([
              { id: 'dev-1', type: 'notebook', name: 'MacBook Pro 14"', status: 'online', model: 'Apple M2 Pro', user: 'André Carvalho', patrimony: 'NT-0098', ip: '192.168.1.5', location: 'São Paulo - SP', lastSeen: 'Agora' },
              { id: 'dev-2', type: 'smartphone', name: 'iPhone 13 Corp', status: 'online', model: 'Apple 128GB', user: 'André Carvalho', patrimony: 'SM-0142', ip: '10.0.0.42', location: 'São Paulo - SP', lastSeen: 'Há 5 min', battery: 82 }
            ] as any);
          }
        });
    } else {
      setUserDevices([]);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-6">
        <p className="text-slate-400 text-sm text-center">Selecione uma conversa para ver o contexto do cliente.</p>
      </div>
    );
  }

  return (
    <div className="h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Client Profile Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold mb-3 shadow-sm">
          {clientDetails.nome.charAt(0).toUpperCase() || 'C'}
        </div>

        {/* Nome */}
        <div className="w-full flex justify-center group mb-1 relative h-7">
          {editingField === 'nome' ? (
            <input
              type="text"
              autoFocus
              className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 w-full max-w-[200px] outline-none focus:border-blue-500 absolute top-0"
              value={clientDetails.nome}
              onChange={(e) => setClientDetails({ ...clientDetails, nome: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <div className="flex items-center justify-center gap-1 absolute top-0 w-full">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center truncate px-1">{clientDetails.nome}</h3>
              {session.status !== 'closed' && (
                <button onClick={() => setEditingField('nome')} className="opacity-0 group-hover:opacity-100 p-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"><Pencil className="w-3 h-3" /></button>
              )}
            </div>
          )}
        </div>

        {/* Cargo */}
        <div className="w-full flex justify-center group mb-1 relative h-5">
          {editingField === 'cargo' ? (
            <input
              type="text"
              autoFocus
              className="text-xs text-slate-500 dark:text-slate-400 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 w-full max-w-[180px] outline-none focus:border-blue-500 absolute top-0"
              value={clientDetails.cargo}
              onChange={(e) => setClientDetails({ ...clientDetails, cargo: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 absolute top-0 w-full">
              <User className="w-3 h-3 shrink-0" /> 
              <span className="truncate px-1">{clientDetails.cargo}</span>
              {session.status !== 'closed' && (
                <button onClick={() => setEditingField('cargo')} className="opacity-0 group-hover:opacity-100 p-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"><Pencil className="w-3 h-3" /></button>
              )}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="w-full flex justify-center group relative h-5">
          {editingField === 'email' ? (
            <input
              type="text"
              autoFocus
              className="text-xs text-slate-400 dark:text-slate-500 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 w-full max-w-[200px] outline-none focus:border-blue-500 absolute top-0"
              value={clientDetails.email}
              onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              onBlur={() => setEditingField(null)}
            />
          ) : (
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500 absolute top-0 w-full">
              <span className="truncate px-1" title={clientDetails.email}>{maskEmail(clientDetails.email)}</span>
              {session.status !== 'closed' && (
                <button onClick={() => setEditingField('email')} className="opacity-0 group-hover:opacity-100 p-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"><Pencil className="w-3 h-3" /></button>
              )}
            </div>
          )}
        </div>

        {/* Extra info: Unidade, Setor, Matrícula */}
        <div className="mt-3 w-full border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
          {[
            { key: 'unidade', label: 'Unidade', placeholder: 'Não informado' },
            { key: 'setor', label: 'Setor', placeholder: 'Não informado' },
            { key: 'matricula', label: 'Matrícula', placeholder: 'Não informado' },
            { key: 'telefone', label: 'Telefone', placeholder: 'Não informado (Opcional)' },
          ].map((field) => {
            const isEditing = editingField === field.key;
            const value = clientDetails[field.key as keyof typeof clientDetails];
            const displayValue = value.trim() ? value : field.placeholder;
            const displayClasses = value.trim() ? 'font-semibold text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-400 dark:text-slate-500 italic font-normal';

            return (
              <div key={field.key} className="flex items-center justify-between text-xs group">
                <span className="text-slate-400 dark:text-slate-500 shrink-0 mr-2">{field.label}</span>
                <div className="flex items-center gap-1.5 justify-end w-[130px]">
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      className="w-full text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                      value={value}
                      onChange={(e) => setClientDetails({ ...clientDetails, [field.key as keyof typeof clientDetails]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <>
                      <span className={`${displayClasses} truncate`} title={displayValue}>{displayValue}</span>
                      {session.status !== 'closed' && (
                        <button 
                          onClick={() => setEditingField(field.key as keyof typeof clientDetails)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">

        {/* Security IP Audit Card (Sincronizado com InstaPasso) */}
        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-2 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-blue-400 flex items-center gap-1.5 text-[11px]">
              <Shield className="w-3.5 h-3.5" /> Protocolo {generateCorporateProtocol(session.ticketId || session.id)}
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              InstaPasso SSO
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">IP de Origem:</span>
              <span className="font-mono text-slate-200 font-semibold">187.52.190.44</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Dispositivo:</span>
              <span className="text-slate-200 truncate block">Chrome / Win11</span>
            </div>
          </div>
        </div>

        {/* Ticket Link */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500 font-medium">Protocolo / Ticket</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{generateCorporateProtocol(session.ticketId || session.id)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500 font-medium">Status</span>
            <select 
              disabled={session.status === 'closed' || session.status === 'finished'}
              value={session.status === 'closed' || session.status === 'finished' ? 'closed' : session.status}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value as any)}
              className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1 outline-none text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="active">Em atendimento</option>
              <option value="waiting">Aguardando</option>
              <option value="closed">Encerrado / Auditado</option>
            </select>
          </div>
          <div className="mb-4">
            <span className="block text-xs text-slate-500 font-medium mb-2">Prioridade</span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map(p => (
                <button key={p.value} type="button"
                  disabled={session.status === 'closed' || session.status === 'finished'}
                  onClick={() => onPriorityChange && onPriorityChange(p.value)}
                  className={`relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border-2 text-[10px] font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                    ${priority === p.value
                      ? `border-current ${p.color} bg-current/5 shadow-sm scale-[1.02]`
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.dot} ${priority === p.value ? 'ring-2 ring-current/20' : ''}`} />
                  {p.label}
                  {priority === p.value && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500 font-medium">Abertura</span>
            <span className="text-xs text-slate-700 dark:text-slate-300">24/05/2024 09:14</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500 font-medium">SLA</span>
            <span className={`text-xs font-bold flex items-center gap-1 ${isSlaCritical ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
              <Clock className="w-3 h-3"/> {formatSla(slaSeconds)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isSlaCritical ? 'bg-rose-600' : 'bg-emerald-500'}`} 
              style={{ width: `${slaPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs group mb-3">
            <span className="text-slate-500 font-medium shrink-0 mr-2">Categoria</span>
            <div className="flex items-center gap-1.5 justify-end w-[140px]">
              {editingField === 'categoria' ? (
                <div className="relative w-full">
                  <select
                    autoFocus
                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1 pl-2 pr-6 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 shadow-sm"
                    value={clientDetails.categoria}
                    onChange={(e) => {
                      setClientDetails({ ...clientDetails, categoria: e.target.value });
                      setEditingField(null);
                    }}
                    onBlur={() => setEditingField(null)}
                  >
                    {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              ) : (
                <>
                  <span className="text-slate-700 dark:text-slate-300 truncate" title={clientDetails.categoria}>{clientDetails.categoria}</span>
                  {session.status !== 'closed' && session.status !== 'finished' && (
                    <button 
                      onClick={() => setEditingField('categoria')}
                      className="opacity-0 group-hover:opacity-100 p-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-all rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500 font-medium">Responsável</span>
            <span className="text-xs text-slate-700 dark:text-slate-300">Bruno Santos (N1)</span>
          </div>

          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-slate-500 font-medium mt-1">Tags</span>
            <div className="flex flex-wrap gap-1 justify-end">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">erp</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">acesso</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">login</span>
            </div>
          </div>
        </section>

        {/* History */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex justify-between items-center">
            Histórico Recente
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer lowercase normal-case text-[10px]">ver tudo</span>
          </h4>
          <div className="space-y-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">Erro de VPN corporativa</p>
                <p className="text-[10px] text-slate-400 mt-1">Resolvido há 2 dias</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">Lentidão no CRM</p>
                <p className="text-[10px] text-slate-400 mt-1">Em andamento (Mesa N2)</p>
              </div>
            </div>
          </div>
        </section>
        {/* Equipment Monitoring */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Monitoramento {userDevices.length > 0 ? `(${userDevices.length})` : ''}</h4>
            {userDevices.length > 0 && (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Online</span>
            )}
          </div>
          <div className="space-y-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2 bg-slate-50/50 dark:bg-slate-900/50">
            {userDevices.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">Nenhum equipamento vinculado</p>
            ) : (
              userDevices.map((device, idx) => (
                <React.Fragment key={device.id}>
                  <button
                    onClick={() => navigate(`/operacional/app/tools/equipment/${device.id}`)}
                    className="w-full flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg px-2 py-1.5 transition-colors group/dev"
                  >
                    {device.type === 'smartphone' ? (
                      <div className="w-5 h-6 border border-slate-300 dark:border-slate-600 rounded-sm shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-slate-500" />
                      </div>
                    ) : (
                      <Monitor className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover/dev:text-blue-600 dark:group-hover/dev:text-blue-400 transition-colors truncate">{device.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{device.model} · {device.patrimony}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : device.status === 'warning' ? 'bg-amber-500' : 'bg-slate-400'}`}/>
                      <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover/dev:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  {idx < userDevices.length - 1 && (
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </section>

      </div>
      

      {/* Hidden button para ser acionado remotamente pelo botão Finalizar */}
      <button id="btn-open-ticket-modal" className="hidden" onClick={() => setShowTicketModal(true)} />

      {showTicketModal && (
        <NewManualTicketModal 
          onClose={() => setShowTicketModal(false)} 
          initialData={getInitialTicketData()}
          isFromChat={true}
          onSuccess={(ticketId) => {
            onStatusChange?.('closed', ticketId);
          }}
        />
      )}
    </div>
  );
}
