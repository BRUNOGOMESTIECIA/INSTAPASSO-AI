import { useState, useRef } from 'react';
import type { Domain, DomainStatus, Operator, OperatorRole } from '../App';
import { AVAILABLE_PAGES } from '../App';
import { db } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import AuditViewer from './AuditViewer';

interface AdminPanelProps {
  domains: Domain[];
  setDomains?: React.Dispatch<React.SetStateAction<Domain[]>>; // Mantido por compatibilidade
  operators?: Operator[];
}

const PERMISSION_GROUPS = [
  {
    category: 'GESTÃO DE TICKETS',
    permissions: [
      { id: 'tickets.view', label: 'Visualizar Tickets' },
      { id: 'tickets.create', label: 'Criar Novos Tickets' },
      { id: 'tickets.update', label: 'Editar Status & Atribuição' },
      { id: 'tickets.close', label: 'Encerrar & Resolver Tickets' },
      { id: 'tickets.delete', label: 'Excluir Registros de Tickets' },
    ]
  },
  {
    category: 'CHAT AO VIVO',
    permissions: [
      { id: 'chat.view', label: 'Acessar Fila de Atendimento' },
      { id: 'chat.attend', label: 'Assumir & Responder Chats' },
      { id: 'chat.manage', label: 'Supervisionar Chats de Outros Operadores' },
      { id: 'chat.history', label: 'Visualizar Histórico Completo de Chats' },
    ]
  },
  {
    category: 'BASE DE CONHECIMENTO & CATÁLOGO',
    permissions: [
      { id: 'kb.view', label: 'Visualizar Artigos da KB' },
      { id: 'kb.manage', label: 'Criar / Publicar Artigos da KB' },
      { id: 'catalog.view', label: 'Visualizar Catálogo de Serviços' },
      { id: 'catalog.manage', label: 'Gerenciar Serviços do Catálogo' },
    ]
  },
  {
    category: 'MONITORAMENTO & DISPOSITIVOS',
    permissions: [
      { id: 'monitoring.hardware', label: 'Painel de Equipamentos & Servidores' },
      { id: 'monitoring.printers', label: 'Painel de Impressoras & Contadores' },
    ]
  },
  {
    category: 'RELATÓRIOS & EXECUTIVE',
    permissions: [
      { id: 'reports.view', label: 'Visualizar Indicadores & Métricas' },
      { id: 'reports.export', label: 'Exportar Relatórios em PDF & Excel' },
    ]
  },
  {
    category: 'ADMINISTRAÇÃO GERAL',
    permissions: [
      { id: 'admin.users', label: 'Gerenciar Equipe / Clientes' },
      { id: 'admin.roles', label: 'Papéis e Permissões' },
      { id: 'admin.settings', label: 'Configurações Globais' },
    ]
  }
];

/**
 * @component AdminPanel
 * Painel Administrativo responsável pelo CRUD de domínios (B2B) e Equipe Interna (Operadores).
 */
export default function AdminPanel({ domains, operators = [] }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'DOMAINS' | 'OPERATORS' | 'AUDIT'>('DOMAINS');
  const [newCompany, setNewCompany] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newAllowedPages, setNewAllowedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para Equipe Interna
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorEmail, setNewOperatorEmail] = useState('');
  const [newOperatorRole, setNewOperatorRole] = useState<OperatorRole>('N1');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'tickets.view', 'tickets.create', 'chat.view', 'chat.attend', 'kb.view', 'catalog.view', 'reports.view'
  ]);

  // Edição de Operador Cadastrado
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<OperatorRole>('N1');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DomainStatus | 'ALL'>('ALL');

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          domain.domainName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || domain.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = async (id: string, currentStatus: DomainStatus) => {
    setIsProcessing(true);
    try {
       const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
       const domain = domains.find(d => d.id === id);
       if (domain) {
          await setDoc(doc(db, 'domains', id), { ...domain, status: newStatus });
       }
    } catch (e) {
       console.error("Erro ao alterar status:", e);
    } finally {
       setIsProcessing(false);
    }
  };

  const toggleOperatorStatus = async (id: string, currentStatus: DomainStatus) => {
    setIsProcessing(true);
    try {
       const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
       const operator = operators.find(o => o.id === id);
       if (operator) {
          await setDoc(doc(db, 'operators', id), { ...operator, status: newStatus });
       }
    } catch (e) {
       console.error("Erro ao alterar status do operador:", e);
    } finally {
       setIsProcessing(false);
    }
  };

  const handleStartEditOperator = (op: Operator) => {
    setEditingOperatorId(op.id);
    setEditingRole(op.role || 'N1');
    setEditingPermissions(op.permissions || [
      'tickets.view', 'tickets.create', 'chat.view', 'chat.attend', 'kb.view', 'catalog.view', 'reports.view'
    ]);
  };

  const handleSaveOperatorEdit = async (op: Operator) => {
    setIsProcessing(true);
    try {
      const updatedOp = {
        ...op,
        role: editingRole,
        permissions: editingPermissions,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'operators', op.id), updatedOp);
      setEditingOperatorId(null);
    } catch (e) {
      console.error("Erro ao atualizar operador no InstaPasso:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageToggle = (page: string) => {
    setNewAllowedPages(prev => 
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    );
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newDomain) return;

    setIsProcessing(true);
    try {
       let formattedDomain = newDomain.trim();
       if (!formattedDomain.startsWith('@')) {
         formattedDomain = `@${formattedDomain}`;
       }
       
       const newId = Date.now().toString();
       const newEntry: Domain = {
         id: newId,
         companyName: newCompany,
         domainName: formattedDomain,
         status: 'ACTIVE',
         allowedPages: newAllowedPages
       };

       await setDoc(doc(db, 'domains', newId), newEntry);

       setNewCompany('');
       setNewDomain('');
       setNewAllowedPages([]);
    } catch(e) {
       console.error("Erro ao adicionar domínio:", e);
    } finally {
       setIsProcessing(false);
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperatorName || !newOperatorEmail || !newOperatorRole) return;

    let finalEmail = newOperatorEmail.trim().toLowerCase();
    if (!finalEmail.endsWith('@tiecia.com.br')) {
      finalEmail = `${finalEmail}@tiecia.com.br`;
    }

    setIsProcessing(true);
    try {
       const newId = Date.now().toString();
       const newEntry: Operator = {
         id: newId,
         fullName: newOperatorName,
         email: finalEmail,
         role: newOperatorRole,
         status: 'ACTIVE',
         permissions: selectedPermissions
       };

       await setDoc(doc(db, 'operators', newId), newEntry);

       setNewOperatorName('');
       setNewOperatorEmail('');
       setNewOperatorRole('N1');
    } catch(e: any) {
       console.error("Erro ao adicionar operador:", e);
       alert("Erro ao salvar: " + (e.message || "Permissão negada ou falha na rede."));
    } finally {
       setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "Empresa,Dominio,Permissoes,Status\n";
    
    domains.forEach(d => {
      const safeCompany = d.companyName.replace(/"/g, '""');
      const permissoes = d.allowedPages.join(';');
      csvContent += `"${safeCompany}",${d.domainName},${permissoes},${d.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dominios_autorizados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
       const text = await file.text();
       const lines = text.split('\n');
       
       const startIndex = lines[0].toLowerCase().includes('empresa') ? 1 : 0;
       const batch = writeBatch(db);
       let count = 0;

       for (let i = startIndex; i < lines.length; i++) {
         const line = lines[i].trim();
         if (!line) continue;

         let companyName = "";
         let remainder = line;
         
         if (remainder.startsWith('"')) {
            const endQuoteIdx = remainder.indexOf('"', 1);
            if (endQuoteIdx !== -1) {
               companyName = remainder.substring(1, endQuoteIdx).replace(/""/g, '"');
               remainder = remainder.substring(endQuoteIdx + 1);
               if (remainder.startsWith(',')) remainder = remainder.substring(1);
            }
         } else {
            const firstComma = remainder.indexOf(',');
            if (firstComma !== -1) {
              companyName = remainder.substring(0, firstComma);
              remainder = remainder.substring(firstComma + 1);
            }
         }

         const parts = remainder.split(',');
         if (parts.length >= 1) {
            let domainName = parts[0].trim();
            if (!domainName.startsWith('@')) domainName = `@${domainName}`;

           let allowedPages: string[] = [];
           if (parts[1]) {
              const pagesStr = parts[1].trim();
              if (pagesStr) {
                allowedPages = pagesStr.split(';').map(p => p.trim()).filter(p => p);
              }
           }

           let status: DomainStatus = 'ACTIVE';
           if (parts[2]) {
              const s = parts[2].trim().toUpperCase();
              if (s === 'ACTIVE' || s === 'INACTIVE' || s === 'DELETED') {
                status = s as DomainStatus;
              }
           }

           const newId = `imported_${Date.now()}_${i}`;
           const docRef = doc(db, 'domains', newId);
           batch.set(docRef, {
             id: newId,
             companyName: companyName.trim(),
             domainName,
             status,
             allowedPages
           });
           count++;
         }
       }

       if (count > 0) {
          await batch.commit();
       }
    } catch (e) {
       console.error("Erro na importação:", e);
    } finally {
       if (fileInputRef.current) fileInputRef.current.value = '';
       setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: DomainStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-white text-black">[✓] ATIVO</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">[⊘] INATIVO</span>;
      case 'DELETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-600 line-through">[×] EXCLUÍDO</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Sub-Navegação */}
      <div className="mb-6 flex border-b border-border">
        <button
          onClick={() => setActiveTab('DOMAINS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'DOMAINS' 
              ? 'border-foreground text-foreground' 
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Gerenciamento de Acessos
        </button>
        <button
          onClick={() => setActiveTab('OPERATORS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'OPERATORS' 
              ? 'border-foreground text-foreground' 
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Equipe Interna
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'AUDIT' 
              ? 'border-foreground text-foreground' 
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Logs de Auditoria
        </button>
      </div>

      {activeTab === 'AUDIT' ? (
        <AuditViewer />
      ) : activeTab === 'OPERATORS' ? (
        <>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Equipe Interna (TIECIA)</h1>
              <p className="text-muted text-sm">Gerenciamento exclusivo de operadores com e-mail @tiecia.com.br.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl mb-8">
            <div className="px-6 py-5 border-b border-border bg-zinc-900/50">
              <h3 className="text-lg font-medium leading-6">Cadastrar Operador</h3>
            </div>
            <form onSubmit={handleAddOperator} className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
                <div className="sm:col-span-2">
                  <label htmlFor="opName" className="block text-sm font-medium text-muted mb-2">Nome Completo</label>
                  <input
                    type="text"
                    id="opName"
                    required
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="opEmail" className="block text-sm font-medium text-muted mb-2">E-mail Corporativo</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="opEmail"
                      required
                      value={newOperatorEmail}
                      onChange={(e) => setNewOperatorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border border-r-0 rounded-l-lg focus:outline-none focus:border-muted text-foreground transition-colors text-right"
                      placeholder="joao"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-border bg-zinc-800 text-muted text-sm whitespace-nowrap">
                      @tiecia.com.br
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="opRole" className="block text-sm font-medium text-muted mb-2">Função</label>
                  <select
                    id="opRole"
                    required
                    value={newOperatorRole}
                    onChange={(e) => setNewOperatorRole(e.target.value as OperatorRole)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors"
                  >
                    <option value="N1">N1</option>
                    <option value="N2">N2</option>
                    <option value="N3">N3</option>
                    <option value="SOC">SOC</option>
                    <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Super Administrador">Super Administrador</option>
                  </select>
                </div>
              </div>

              {/* Seção Módulos e Permissões no InstaPasso */}
              <div className="border-t border-border pt-6 mb-6">
                <h4 className="text-sm font-semibold mb-1 text-foreground">Módulos e Permissões no Sistema</h4>
                <p className="text-xs text-muted mb-4">Selecione quais telas e recursos este operador poderá acessar no Portal ITSM.</p>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Tickets',
                      perms: [
                        { id: 'tickets.view', label: 'Visualizar Tickets' },
                        { id: 'tickets.create', label: 'Criar Tickets' },
                        { id: 'tickets.update', label: 'Editar Tickets (Geral)' },
                        { id: 'tickets.assign', label: 'Atribuir/Transferir' },
                        { id: 'tickets.close', label: 'Fechar Tickets' },
                      ]
                    },
                    {
                      title: 'Chat Ao Vivo',
                      perms: [
                        { id: 'chat.view', label: 'Acessar Histórico' },
                        { id: 'chat.attend', label: 'Atender Chats (Ficar Online)' },
                        { id: 'chat.manage', label: 'Gerenciar Filas/Atendentes' },
                      ]
                    },
                    {
                      title: 'Base de Conhecimento',
                      perms: [
                        { id: 'kb.view', label: 'Acesso Interno (Leitura)' },
                        { id: 'kb.write', label: 'Criar/Editar Rascunhos' },
                        { id: 'kb.publish', label: 'Publicar Artigos' },
                      ]
                    },
                    {
                      title: 'Catálogo de Serviços',
                      perms: [
                        { id: 'catalog.view', label: 'Visualizar Catálogo' },
                        { id: 'catalog.manage', label: 'Gerenciar Serviços/SLA' },
                      ]
                    },
                    {
                      title: 'Relatórios e Dashboards',
                      perms: [
                        { id: 'reports.view', label: 'Visualizar Relatórios' },
                      ]
                    },
                    {
                      title: 'Administração Geral',
                      perms: [
                        { id: 'admin.users', label: 'Gerenciar Equipe/Clientes' },
                        { id: 'admin.roles', label: 'Papéis e Permissões' },
                        { id: 'admin.settings', label: 'Configurações Globais' },
                      ]
                    }
                  ].map((group) => {
                    const groupPermIds = group.perms.map(p => p.id);
                    const allChecked = groupPermIds.every(id => selectedPermissions.includes(id));
                    return (
                      <div key={group.title} className="p-4 border border-border rounded-xl bg-zinc-900/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">{group.title}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (allChecked) {
                                setSelectedPermissions(prev => prev.filter(p => !groupPermIds.includes(p)));
                              } else {
                                const toAdd = groupPermIds.filter(p => !selectedPermissions.includes(p));
                                setSelectedPermissions(prev => [...prev, ...toAdd]);
                              }
                            }}
                            className="text-[11px] font-semibold text-muted hover:text-foreground transition-colors"
                          >
                            {allChecked ? 'Desmarcar todos' : 'Selecionar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {group.perms.map((p) => {
                            const isChecked = selectedPermissions.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-zinc-800 border-zinc-600 text-foreground font-semibold shadow-sm'
                                    : 'bg-zinc-900/30 border-zinc-800 text-muted hover:border-zinc-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedPermissions(prev =>
                                      prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                                    );
                                  }}
                                  className="rounded border-zinc-700 bg-zinc-900 text-foreground focus:ring-0"
                                />
                                <span>{p.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!newOperatorName || !newOperatorEmail || !newOperatorRole || isProcessing}
                  className="bg-foreground text-background font-medium py-2.5 px-6 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isProcessing ? 'Processando...' : 'Cadastrar Operador'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-border bg-zinc-900/50">
              <h3 className="text-lg font-medium leading-6">Operadores Cadastrados</h3>
            </div>
            <div className="divide-y divide-border">
              {operators.map((op) => {
                const isEditing = editingOperatorId === op.id;
                return (
                  <div key={op.id} className="flex flex-col hover:bg-zinc-900/30 transition-colors">
                    <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <div className="mb-3 sm:mb-0">
                          <p className="text-sm font-medium text-foreground">{op.fullName}</p>
                          <p className="text-xs text-muted">{op.email}</p>
                        </div>
                        <div className="sm:ml-4 flex flex-col space-y-2">
                          <div>{getStatusBadge(op.status)}</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/30 text-blue-400 border border-blue-900/50">
                              {op.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {op.status !== 'DELETED' && (
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              if (isEditing) {
                                setEditingOperatorId(null);
                              } else {
                                handleStartEditOperator(op);
                              }
                            }}
                            className={`text-xs font-medium px-3 py-1.5 border rounded-md transition-colors ${
                              isEditing
                                ? 'border-amber-700 bg-amber-950/40 text-amber-300'
                                : 'border-blue-900/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/50'
                            } disabled:opacity-50`}
                          >
                            {isEditing ? 'Cancelar Edição' : 'Editar Permissões'}
                          </button>
                        )}
                        {op.status !== 'DELETED' && (
                          <button
                            disabled={isProcessing}
                            onClick={() => toggleOperatorStatus(op.id, op.status)}
                            className="text-xs font-medium px-3 py-1.5 border border-border rounded-md hover:bg-zinc-800 transition-colors text-muted hover:text-foreground disabled:opacity-50"
                          >
                            {op.status === 'ACTIVE' ? 'Desabilitar' : 'Habilitar'}
                          </button>
                        )}
                        <button
                          className="text-xs font-medium px-3 py-1.5 border border-red-900/30 rounded-md hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={op.status === 'DELETED' || isProcessing}
                          onClick={async () => {
                             try {
                                setIsProcessing(true);
                                await setDoc(doc(db, 'operators', op.id), { ...op, status: 'DELETED' });
                             } catch(e) {
                                console.error('Erro ao excluir:', e);
                             } finally {
                                setIsProcessing(false);
                             }
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    {/* Painel de Edição Expansível */}
                    {isEditing && (
                      <div className="px-6 py-5 bg-zinc-950/80 border-t border-border border-b border-zinc-800/80 space-y-5 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <h4 className="text-sm font-semibold text-blue-400">Reajustar Acessos & Cargo de: {op.fullName}</h4>
                          <span className="text-xs text-muted">ID: {op.id}</span>
                        </div>

                        {/* Seleção do Cargo */}
                        <div>
                          <label className="block text-xs font-medium text-muted mb-2">Cargo / Nível de Acesso</label>
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value as OperatorRole)}
                            className="w-full sm:w-72 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500"
                          >
                            <option value="N1">N1 — Suporte Inicial (Restrito)</option>
                            <option value="N2">N2 — Analista Pleno</option>
                            <option value="N3">N3 — Especialista</option>
                            <option value="SOC">SOC — Segurança da Informação</option>
                            <option value="INFRAESTRUTURA">INFRAESTRUTURA — Servidores e Redes (Restrito)</option>
                            <option value="Administrador">Administrador — Acesso Total</option>
                            <option value="Super Administrador">Super Administrador — Master TIECIA</option>
                          </select>
                        </div>

                        {/* Árvore de Permissões */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Permissões de Módulos (ITSM Portal)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PERMISSION_GROUPS.map((group) => {
                              const groupPermIds = group.permissions.map(p => p.id);
                              const allSelected = groupPermIds.every(id => editingPermissions.includes(id));
                              
                              const toggleGroup = () => {
                                if (allSelected) {
                                  setEditingPermissions(prev => prev.filter(id => !groupPermIds.includes(id)));
                                } else {
                                  setEditingPermissions(prev => Array.from(new Set([...prev, ...groupPermIds])));
                                }
                              };

                              return (
                                <div key={group.category} className="p-3.5 bg-card/60 border border-border rounded-lg space-y-2.5">
                                  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                                    <span className="text-xs font-bold text-foreground">{group.category}</span>
                                    <button
                                      type="button"
                                      onClick={toggleGroup}
                                      className="text-[10px] text-blue-400 hover:underline font-medium"
                                    >
                                      {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {group.permissions.map((perm) => {
                                      const isChecked = editingPermissions.includes(perm.id);
                                      return (
                                        <label key={perm.id} className="flex items-start space-x-2 text-xs text-muted hover:text-foreground cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              if (isChecked) {
                                                setEditingPermissions(prev => prev.filter(id => id !== perm.id));
                                              } else {
                                                setEditingPermissions(prev => [...prev, perm.id]);
                                              }
                                            }}
                                            className="mt-0.5 rounded border-border bg-background text-blue-500 focus:ring-0 cursor-pointer"
                                          />
                                          <span>{perm.label}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingOperatorId(null)}
                            className="px-4 py-2 border border-border rounded-lg text-xs text-muted hover:text-foreground transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSaveOperatorEdit(op)}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shadow-md disabled:opacity-50"
                          >
                            {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {operators.length === 0 && (
                <div className="px-6 py-8 text-center text-muted text-sm">
                  Nenhum operador da TIECIA cadastrado.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Painel Administrativo</h1>
              <p className="text-muted text-sm">Gerenciamento de empresas, domínios e permissões de acesso.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium px-4 py-2 border border-border rounded-md hover:bg-zinc-800 transition-colors text-foreground"
              >
                Importar CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="text-sm font-medium px-4 py-2 border border-border rounded-md hover:bg-zinc-800 transition-colors text-foreground"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl mb-8">
        <div className="px-6 py-5 border-b border-border bg-zinc-900/50">
          <h3 className="text-lg font-medium leading-6">Adicionar Novo Domínio</h3>
        </div>
        <form onSubmit={handleAddDomain} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
            <div className="sm:col-span-3">
              <label htmlFor="companyName" className="block text-sm font-medium text-muted mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                id="companyName"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors"
                placeholder="Ex: Acme Corp"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="domainName" className="block text-sm font-medium text-muted mb-2">
                Domínio Autorizado
              </label>
              <input
                type="text"
                id="domainName"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors"
                placeholder="Ex: acme.com"
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
             <label className="block text-sm font-medium text-muted mb-3">
                Permissões de Acesso aos Sistemas
             </label>
             <div className="flex flex-wrap gap-4 sm:gap-6">
                {AVAILABLE_PAGES.map(page => (
                   <label key={page} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                         type="checkbox"
                         className="rounded border-border bg-background text-foreground focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                         checked={newAllowedPages.includes(page)}
                         onChange={() => handlePageToggle(page)}
                      />
                      <span className="text-sm">{page}</span>
                   </label>
                ))}
             </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!newCompany || !newDomain || isProcessing}
              className="bg-foreground text-background font-medium py-2.5 px-6 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isProcessing ? 'Processando...' : 'Cadastrar Domínio'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-border bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium leading-6">Domínios Cadastrados</h3>
          
          <div className="flex w-full sm:w-auto flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
             <input
               type="text"
               placeholder="Buscar empresa ou domínio..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors w-full sm:w-64"
             />
             <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value as any)}
               className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-muted text-foreground transition-colors w-full sm:w-auto"
             >
               <option value="ALL">Todos os Status</option>
               <option value="ACTIVE">Somente Ativos</option>
               <option value="INACTIVE">Somente Inativos</option>
               <option value="DELETED">Excluídos</option>
             </select>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredDomains.map((domain) => (
            <div key={domain.id} className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-900/30 transition-colors space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm font-medium text-foreground">
                    {domain.companyName}
                  </p>
                  <p className="text-xs text-muted">
                    {domain.domainName}
                  </p>
                </div>
                <div className="sm:ml-4 flex flex-col space-y-2">
                  <div>{getStatusBadge(domain.status)}</div>
                  {domain.allowedPages.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {domain.allowedPages.map(p => (
                           <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                              {p}
                           </span>
                        ))}
                     </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {domain.status !== 'DELETED' && (
                  <button
                    disabled={isProcessing}
                    onClick={() => toggleStatus(domain.id, domain.status)}
                    className="text-xs font-medium px-3 py-1.5 border border-border rounded-md hover:bg-zinc-800 transition-colors text-muted hover:text-foreground disabled:opacity-50"
                  >
                    {domain.status === 'ACTIVE' ? 'Desabilitar' : 'Habilitar'}
                  </button>
                )}
                <button
                  className="text-xs font-medium px-3 py-1.5 border border-red-900/30 rounded-md hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={domain.status === 'DELETED' || isProcessing}
                  onClick={async () => {
                     try {
                        setIsProcessing(true);
                        await setDoc(doc(db, 'domains', domain.id), { ...domain, status: 'DELETED' });
                     } catch(e) {
                        console.error('Erro ao excluir:', e);
                     } finally {
                        setIsProcessing(false);
                     }
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {filteredDomains.length === 0 && (
            <div className="px-6 py-8 text-center text-muted text-sm">
              Nenhum domínio encontrado.
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
