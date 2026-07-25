import { useState, useRef } from 'react';
import type { Domain, DomainStatus } from '../App';
import { AVAILABLE_PAGES } from '../App';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

interface AdminPanelProps {
  domains: Domain[];
  setDomains?: React.Dispatch<React.SetStateAction<Domain[]>>; // Mantido por compatibilidade
}

export default function AdminPanel({ domains }: AdminPanelProps) {
  const [newCompany, setNewCompany] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newAllowedPages, setNewAllowedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
             <div className="flex space-x-6">
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
            <div key={domain.id} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <div className="mb-2 sm:mb-0">
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
                     <div className="flex space-x-1">
                        {domain.allowedPages.map(p => (
                           <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                              {p}
                           </span>
                        ))}
                     </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
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
    </div>
  );
}
