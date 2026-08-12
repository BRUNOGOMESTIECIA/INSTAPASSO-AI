import React, { useState } from 'react';
import {
  X, Search, CheckCircle2, ChevronDown, Paperclip, Send,
  UserCircle2, Users, Tag, AlertCircle, Building2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEscapeModal } from '../../hooks/use-escape-modal';
import { useAuth } from '../../hooks/use-mock-auth';
import { useChats } from '../../hooks/use-chats';
import { useTickets } from '../../hooks/use-tickets';
import { MOCK_CLIENTS, MOCK_STAFF, type TicketPriority, type MockTicket, TICKET_CATEGORIES } from '../../mocks/data';

// ─── Options ──────────────────────────────────────────────────────────────────
const TICKET_TYPES = ['Incidente', 'Solicitação', 'Dúvida', 'Manutenção Preventiva'];

const TEAMS = ['N1', 'N2', 'N3', 'SOC', 'Infraestrutura', 'Segurança', 'Triagem'];

const PRIORITIES: { value: TicketPriority; label: string; color: string; dot: string }[] = [
  { value: 'low',      label: 'Baixa',   color: 'text-slate-500',  dot: 'bg-slate-400' },
  { value: 'medium',   label: 'Média',   color: 'text-amber-600',  dot: 'bg-amber-400' },
  { value: 'high',     label: 'Alta',    color: 'text-orange-600', dot: 'bg-orange-500' },
  { value: 'critical', label: 'Crítica', color: 'text-red-600',    dot: 'bg-red-500' },
];

// Empresas únicas dos clientes mock
const COMPANIES = Array.from(new Set(MOCK_CLIENTS.map(c => c.company))).sort();

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  companySlug: z.string().min(1, 'Selecione um cliente.'),
  requesterId: z.string().min(1, 'Selecione o solicitante.'),
  title:       z.string().min(5, 'Mínimo de 5 caracteres.'),
  type:        z.string().min(1),
  category:    z.string().min(1, 'Selecione uma categoria.'),
  priority:    z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(5, 'Mínimo de 5 caracteres.'),
  internalNote: z.string().optional(),
  team:        z.string().optional(),
  assigneeId:  z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Sub-component: Company Search ───────────────────────────────────────────
function CompanySearch({
  selected, onSelect, onClear, error,
}: {
  selected: { name: string; slug: string } | null;
  onSelect: (name: string, slug: string) => void;
  onClear: () => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);

  const results = query.length > 0
    ? COMPANIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : COMPANIES.slice(0, 6);

  const getSlug = (name: string) => MOCK_CLIENTS.find(c => c.company === name)?.companySlug ?? name;

  const handleSelect = (company: string) => {
    onSelect(company, getSlug(company));
    setQuery('');
    setOpen(false);
  };

  // Cor do avatar por empresa (hash simples)
  const avatarColors = [
    'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  ];
  const colorFor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="relative">
      {selected ? (
        <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorFor(selected.name)}`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{selected.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cliente selecionado</p>
          </div>
          <button type="button" onClick={onClear}
            className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar empresa cliente..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all shadow-sm placeholder-slate-400 dark:bg-slate-800 dark:text-slate-200
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
          />
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {results.map(company => (
                <button key={company} type="button" onMouseDown={() => handleSelect(company)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorFor(company)}`}>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {MOCK_CLIENTS.filter(c => c.company === company).length} contato(s)
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {open && query.length > 0 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 px-4 py-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma empresa encontrada.</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

// ─── Sub-component: Requester Select (filtrado por empresa) ───────────────────
function RequesterSelect({
  companyName, value, onChange, error,
}: {
  companyName: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const contacts = MOCK_CLIENTS.filter(c => c.company === companyName);

  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={!companyName}
          className={`w-full appearance-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all pr-10 shadow-sm cursor-pointer
            ${!companyName
              ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
              : error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-50 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
        >
          <option value="">{!companyName ? 'Selecione um cliente primeiro' : 'Selecione o solicitante...'}</option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
          ))}
          {/* Dynamic fallback for users not in MOCK_CLIENTS */}
          {value && !contacts.find(c => c.id === value) && (
            <option key={value} value={value}>{value}</option>
          )}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
      {companyName && contacts.length === 0 && (
        <p className="text-amber-600 text-xs mt-1.5">Nenhum contato cadastrado para esta empresa.</p>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export interface TicketInitialData {
  companyName?: string;
  companySlug?: string;
  requesterId?: string;
  type?: string;
  category?: string;
  priority?: TicketPriority;
  title?: string;
  description?: string;
  team?: string;
  assigneeId?: string;
  ticketId?: string;
}

interface Props { 
  onClose: () => void; 
  initialData?: TicketInitialData;
  onSuccess?: (ticketId: string) => void;
  isFromChat?: boolean;
}

export function NewManualTicketModal({ onClose, initialData, onSuccess, isFromChat }: Props) {
  useEscapeModal(true, onClose);
  const { user } = useAuth();

  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
  const [intendedStatus, setIntendedStatus] = useState<'resolved' | 'new' | 'pending'>('new');
  const [createdNumber, setCreatedNumber] = useState(() => {
    if (initialData?.ticketId) return Number(initialData.ticketId);
    return Math.floor(Math.random() * 900) + 1100;
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const { chats } = useChats();
  const { createTicket } = useTickets();
  
  // Infra/Externo feature states
  const [showInfraBox, setShowInfraBox] = useState(false);
  const [infraTitle, setInfraTitle] = useState('');
  const [infraDescription, setInfraDescription] = useState('');
  const [isInfraTicket, setIsInfraTicket] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState<{ name: string; slug: string } | null>(
    initialData?.companyName && initialData?.companySlug
      ? { name: initialData.companyName, slug: initialData.companySlug }
      : null
  );

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      companySlug: initialData?.companySlug || '', 
      requesterId: initialData?.requesterId || '', 
      type: initialData?.type || TICKET_TYPES[0],
      category: initialData?.category || '', 
      priority: initialData?.priority || 'medium', 
      title: initialData?.title || '', 
      description: initialData?.description || '',
      internalNote: '',
      team: initialData?.team || '', 
      assigneeId: initialData?.assigneeId || user?.id || '',
    },
  });

  // Ensure assigneeId defaults to the logged-in user once loaded if it's empty
  React.useEffect(() => {
    if (user?.id) {
      const currentAssignee = watch('assigneeId');
      if (!currentAssignee) {
        setValue('assigneeId', user.id);
      }
    }
  }, [user?.id, setValue, watch]);

  // Autofill from active chat if opened from the sidebar while viewing a chat
  React.useEffect(() => {
    if (!initialData && window.location.pathname.includes('/chat')) {
      const activeChatId = localStorage.getItem('portal_active_chat');
      if (activeChatId) {
        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat) {
          let client = MOCK_CLIENTS.find(c => c.email === activeChat.clientEmail);
          if (!client) {
            const domain = activeChat.clientEmail.split('@')[1];
            client = MOCK_CLIENTS.find(c => c.email.split('@')[1] === domain) || undefined;
          }
          
          const staff = MOCK_STAFF.find(s => s.name === activeChat.agentName);
          const chatHistory = activeChat.messages.map(m => {
            let time = '';
            try { time = new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch(e) {}
            return `[${time}] ${m.senderName}: ${m.body}`;
          }).join('\\n') || '';

          if (client) {
            setSelectedCompany({ name: client.company, slug: client.companySlug });
            setValue('companySlug', client.companySlug);
            setValue('requesterId', client.id);
          } else {
            // Dynamic client from chat
            setSelectedCompany({ name: activeChat.clientName, slug: activeChat.clientEmail.split('@')[1]?.split('.')[0] || 'novo' });
            setValue('companySlug', activeChat.clientEmail.split('@')[1]?.split('.')[0] || 'novo');
            setValue('requesterId', activeChat.clientEmail);
          }
          
          if (activeChat.ticketId) {
            setCreatedNumber(Number(activeChat.ticketId));
          }
          
          setValue('title', ''); // Solicitado para deixar o título em branco
          setValue('type', 'Incidente');
          setValue('category', 'Sistemas / ERP');
          setValue('priority', 'high');
          setValue('description', chatHistory);
          setValue('team', 'N1');
          setValue('assigneeId', staff?.id || user?.id || '');
        }
      }
    }
  }, [initialData, chats, setValue, user?.id]);

  const priority = watch('priority');

  const handleCompanySelect = (name: string, slug: string) => {
    setSelectedCompany({ name, slug });
    setValue('companySlug', slug, { shouldValidate: true });
    setValue('requesterId', '', { shouldValidate: false }); // reset solicitante
  };

  const handleCompanyClear = () => {
    setSelectedCompany(null);
    setValue('companySlug', '', { shouldValidate: true });
    setValue('requesterId', '', { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const submitAsResolved = handleSubmit((data) => {
    setIntendedStatus('resolved');
    setFormDataToSubmit(data);
    setIsInfraTicket(false);
    setShowConfirmModal(true);
  });

  const submitAsUnresolved = handleSubmit((data) => {
    setIntendedStatus('new');
    setFormDataToSubmit(data);
    setIsInfraTicket(false);
    setShowConfirmModal(true);
  });

  const prepareInfra = handleSubmit((data) => {
    setFormDataToSubmit(data);
    setInfraTitle(`[INFRA] ${data.title}`);
    setShowInfraBox(true);
  });

  const submitInfraAndShowConfirm = () => {
    if (!infraDescription.trim() || !infraTitle.trim()) return;
    setIntendedStatus('resolved'); // Marca o ticket do atendente como resolvido
    setIsInfraTicket(true);
    setShowInfraBox(false);
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (formDataToSubmit) {
      const client = MOCK_CLIENTS.find(c => c.id === formDataToSubmit.requesterId);
      const assignee = MOCK_STAFF.find(s => s.id === formDataToSubmit.assigneeId);
      
      const newTicket: MockTicket = {
        id: `t${Date.now()}`,
        number: createdNumber,
        title: formDataToSubmit.title,
        description: formDataToSubmit.description,
        status: intendedStatus, 
        priority: formDataToSubmit.priority,
        type: formDataToSubmit.type,
        category: formDataToSubmit.category,
        requesterId: formDataToSubmit.requesterId,
        requesterName: client?.name || 'Desconhecido',
        requesterEmail: client?.email || '',
        assigneeName: assignee?.name || null,
        team: formDataToSubmit.team || null,
        slaFirstResponseDue: new Date().toISOString(),
        slaResolutionDue: new Date().toISOString(),
        slaFirstResponseMet: true,
        slaResolutionMet: true,
        source: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        tags: [],
        comments: formDataToSubmit.internalNote ? [{
          id: `c_${Date.now()}`,
          authorName: assignee?.name || 'Sistema',
          authorType: 'staff',
          body: formDataToSubmit.internalNote,
          isInternal: true,
          createdAt: new Date().toISOString()
        }] : [],
      };
      
      createTicket(newTicket);

      if (isInfraTicket && infraDescription.trim() && infraTitle.trim()) {
        const infraTicket: MockTicket = {
          ...newTicket,
          id: `t${Date.now() + 1}`,
          number: createdNumber + 1,
          title: infraTitle.trim(),
          description: infraDescription,
          team: 'Infraestrutura',
          assigneeName: null,
          status: 'new',
          parentTicketId: newTicket.id
        };
        createTicket(infraTicket);
      }
    }
    
    setShowConfirmModal(false);
    setSubmitted(true);
    onSuccess?.(String(createdNumber));
  };

  // ─ Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">Ticket criado!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            Ticket <span className="font-bold text-slate-700 dark:text-slate-300">#{createdNumber}</span> adicionado ao board.
          </p>
          {selectedCompany && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
              Cliente: <strong className="text-slate-600 dark:text-slate-300">{selectedCompany.name}</strong>
            </p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            O solicitante será notificado por e-mail.
          </p>
          <button onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-[1px] shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // ─ Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/50">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Novo Ticket Manual</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Aberto pela equipe operacional · source: technician</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all duration-200 hover:rotate-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form id="manual-ticket-form" onSubmit={submitAsResolved} className="p-6 space-y-5">

            {/* ── Bloco: Identificação do cliente ─────────────────────────── */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Identificação do cliente
              </p>

              {/* Campo 1: Cliente (empresa) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Cliente (empresa) <span className="text-red-500">*</span>
                </label>
                <CompanySearch
                  selected={selectedCompany}
                  onSelect={handleCompanySelect}
                  onClear={handleCompanyClear}
                  error={errors.companySlug?.message}
                />
              </div>

              {/* Campo 2: Solicitante — ativado após selecionar empresa */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider transition-colors ${selectedCompany ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                  <UserCircle2 className="inline w-3 h-3 mr-1" />
                  Solicitante <span className="text-red-500">*</span>
                  {!selectedCompany && <span className="ml-1.5 text-slate-400 dark:text-slate-600 font-normal normal-case">(selecione o cliente primeiro)</span>}
                </label>
                <RequesterSelect
                  companyName={selectedCompany?.name ?? ''}
                  value={watch('requesterId')}
                  onChange={(id) => setValue('requesterId', id, { shouldValidate: true })}
                  error={errors.requesterId?.message}
                />
              </div>
            </div>

            {/* ── Título ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                placeholder="Ex: Servidor de e-mail inacessível no setor financeiro"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all shadow-sm placeholder-slate-400 text-slate-900 dark:bg-slate-800 dark:text-slate-200
                  ${errors.title
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
            </div>

            {/* ── Tipo + Categoria ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Tipo</label>
                <div className="relative">
                  <select {...register('type')}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer font-medium"
                  >
                    {TICKET_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select {...register('category')}
                    className={`w-full appearance-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all pr-10 shadow-sm cursor-pointer font-medium
                      ${errors.category
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-50 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <option value="" disabled>Selecione...</option>
                    {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>}
              </div>
            </div>

            {/* ── Prioridade ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Prioridade <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button"
                    onClick={() => setValue('priority', p.value, { shouldValidate: true })}
                    className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                      ${priority === p.value
                        ? `border-current ${p.color} bg-current/5 scale-[1.02] shadow-sm`
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${p.dot} ${priority === p.value ? 'ring-4 ring-current/20' : ''}`} />
                    {p.label}
                    {priority === p.value && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-current" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Mesa + Responsável ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  <Users className="inline w-3 h-3 mr-1" />Mesa
                </label>
                <div className="relative">
                  <select {...register('team')}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                  >
                    <option value="">Triagem / Sem Mesa</option>
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Responsável</label>
                <div className="relative">
                  <select {...register('assigneeId')}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                  >
                    <option value="">Não atribuído</option>
                    {MOCK_STAFF.map(s =>
                      <option key={s.id} value={s.id}>{s.name}</option>
                    )}
                    {user && !MOCK_STAFF.some(s => s.id === user.id) && (
                      <option key={user.id} value={user.id}>{user.name} (Você)</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ── Descrição ───────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
                rows={4}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all shadow-sm placeholder-slate-400 text-slate-900 dark:bg-slate-800 dark:text-slate-200
                  ${errors.description
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
            </div>

            {/* ── Nota Interna ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                NOTA INTERNA / RESOLUÇÃO (OPCIONAL)
              </label>
              <textarea
                {...register('internalNote')}
                placeholder="Ex: O problema foi resolvido reinstalando o aplicativo, ou escalonado para a equipe de redes..."
                rows={3}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all shadow-sm placeholder-slate-400 text-slate-900 dark:bg-slate-800 dark:text-slate-200
                  ${errors.internalNote
                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              />
              {errors.internalNote && <p className="text-red-500 text-xs mt-1.5">{errors.internalNote.message}</p>}
            </div>

            {/* ── Anexos ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Anexos (opcional)</label>
              <div className="space-y-2">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{file.name}</span>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400 group">
                  <Paperclip className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
                  Adicionar arquivos ou imagens
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* ── Info banner ─────────────────────────────────────────────── */}
            <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Ticket registrado como <strong>source: technician</strong>. O solicitante receberá notificação por e-mail após a criação.
              </p>
            </div>

          </form>
        </div>

        {/* Footer / Actions */}
        {showInfraBox ? (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl animate-in fade-in duration-200">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Título do Ticket Infra/Externo</label>
              <input 
                type="text"
                value={infraTitle}
                onChange={e => setInfraTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                placeholder="Ex: Visita técnica para cabeamento..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Instruções para a equipe de Infra/Externo</label>
              <textarea 
                value={infraDescription}
                onChange={e => setInfraDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                rows={3}
                placeholder="Descreva a demanda para a equipe..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowInfraBox(false)} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancelar</button>
              <button type="button" onClick={submitInfraAndShowConfirm} disabled={!infraDescription.trim() || !infraTitle.trim()} className="w-full sm:w-auto px-5 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-xl shadow-md disabled:opacity-50 transition-all">Confirmar e Gerar Tickets</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex-shrink-0 animate-in fade-in duration-200">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              Cancelar
            </button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button type="button" onClick={prepareInfra}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-[1px] active:translate-y-px"
              >
                INFRA/EXTERNO
              </button>
              <button type="button" onClick={submitAsUnresolved}
                className="w-full sm:w-auto px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-[1px] active:translate-y-px"
              >
                Não resolvido
              </button>
              <button type="submit" onClick={submitAsResolved}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-[1px] active:translate-y-px"
              >
                <Send className="h-4 w-4" />
                Resolvido
              </button>
            </div>
          </div>
        )}

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Confirmar Criação</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {intendedStatus === 'resolved' 
                  ? 'Tem certeza que deseja criar o ticket e encerrar o chat (como Resolvido)?'
                  : 'Tem certeza que deseja escalonar este ticket como Não Resolvido?'}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmSubmit}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Sim, confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
