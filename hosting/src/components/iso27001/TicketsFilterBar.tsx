import React, { useState } from 'react';
import { Search, Filter, X, CheckSquare, Square } from 'lucide-react';
import { type MockTicket, MOCK_CLIENTS } from '../../mocks/data';

export interface TicketFilters {
  search: string;
  company: string[]; // empty = all
  team: string[]; // empty = all
  requesterName: string[]; // empty = all
  assigneeName: string[]; // empty = all
  period: string[]; // empty = all
}

interface Props {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  tickets: MockTicket[];
}

function MultiSelect({ 
  label, 
  options, 
  selected, 
  onChange 
}: { 
  label: string; 
  options: { label: string; value: string }[]; 
  selected: string[]; 
  onChange: (vals: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const isAll = selected.length === 0;

  return (
    <div className="flex flex-col h-48 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        {selected.length > 0 && (
          <button 
            onClick={() => onChange([])}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        <button
          onClick={() => onChange([])}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${isAll ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          {isAll ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
          <span className="truncate">Todos</span>
        </button>
        {options.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span className="truncate" title={opt.label}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TicketsFilterBar({ filters, onChange, tickets }: Props) {
  const [expanded, setExpanded] = useState(false);

  const getCompany = (requesterName: string) => {
    const client = MOCK_CLIENTS.find(c => c.name === requesterName);
    return client ? client.company : 'Desconhecida';
  };

  const uniqueCompanies = Array.from(new Set(tickets.map(t => getCompany(t.requesterName)))).sort();
  const uniqueTeams = Array.from(new Set(tickets.map(t => t.team).filter(Boolean))) as string[];
  const uniqueRequesters = Array.from(new Set(tickets.map(t => t.requesterName))).sort();
  const uniqueAssignees = Array.from(new Set(tickets.map(t => t.assigneeName).filter(Boolean))) as string[];

  const activeFiltersCount = 
    (filters.company.length > 0 ? 1 : 0) +
    (filters.team.length > 0 ? 1 : 0) +
    (filters.requesterName.length > 0 ? 1 : 0) +
    (filters.assigneeName.length > 0 ? 1 : 0) +
    (filters.period.length > 0 ? 1 : 0);

  const handleClear = () => {
    onChange({ ...filters, company: [], team: [], requesterName: [], assigneeName: [], period: [] });
  };

  const companyOptions = uniqueCompanies.map(c => ({ label: c, value: c }));


  const teamOptions = [
    { label: 'Triagem (Sem Mesa)', value: 'unassigned' },
    ...uniqueTeams.map(t => ({ label: t, value: t }))
  ];

  const requesterOptions = uniqueRequesters.map(t => ({ label: t, value: t }));
  
  const assigneeOptions = [
    { label: 'Não Atribuído', value: 'unassigned' },
    ...uniqueAssignees.map(t => ({ label: t, value: t }))
  ];

  const periodOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Últimos 7 dias', value: '7days' },
    { label: 'Últimos 30 dias', value: '30days' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-5 transition-all">
      <div className="flex flex-col sm:flex-row p-2 gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por número, título ou assunto..."
            className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center ${expanded || activeFiltersCount > 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </button>

        {activeFiltersCount > 0 && (
          <button 
            onClick={handleClear}
            title="Limpar todos os filtros"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors hidden sm:flex"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MultiSelect 
            label="Empresa" 
            options={companyOptions} 
            selected={filters.company} 
            onChange={(v) => onChange({ ...filters, company: v })} 
          />
          <MultiSelect 
            label="Mesa de Serviço" 
            options={teamOptions} 
            selected={filters.team} 
            onChange={(v) => onChange({ ...filters, team: v })} 
          />
          <MultiSelect 
            label="Solicitante" 
            options={requesterOptions} 
            selected={filters.requesterName} 
            onChange={(v) => onChange({ ...filters, requesterName: v })} 
          />
          <MultiSelect 
            label="Responsável" 
            options={assigneeOptions} 
            selected={filters.assigneeName} 
            onChange={(v) => onChange({ ...filters, assigneeName: v })} 
          />
          <MultiSelect 
            label="Período de Abertura" 
            options={periodOptions} 
            selected={filters.period} 
            onChange={(v) => onChange({ ...filters, period: v })} 
          />
        </div>
      )}
    </div>
  );
}
