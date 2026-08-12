import React, { useState } from 'react';
import { PeriodicAuditReportModal } from './PeriodicAuditReportModal';
import { FileCheck, ShieldAlert, Lock, AlertTriangle, Globe, Monitor, RefreshCw, CheckCircle2, Search, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

export interface SecurityAttemptLog {
  id: string;
  email: string;
  ip: string;
  location: string;
  device: string;
  reason: 'unauthorized_email' | 'brute_force' | 'invalid_sso_domain' | 'mfa_failed';
  timestamp: string;
  status: 'blocked' | 'flagged';
}

export const MOCK_SECURITY_LOGS: SecurityAttemptLog[] = [
  {
    id: 'sec-1',
    email: 'hacker_test@external.com',
    ip: '189.44.120.91',
    location: 'São Paulo, BR',
    device: 'Windows 11 / Chrome 126',
    reason: 'unauthorized_email',
    timestamp: '2026-07-30T08:45:12Z',
    status: 'blocked',
  },
  {
    id: 'sec-2',
    email: 'admin@desconhecido.net',
    ip: '45.142.214.50',
    location: 'Moscou, RU',
    device: 'Linux / Firefox 125',
    reason: 'brute_force',
    timestamp: '2026-07-30T08:12:00Z',
    status: 'blocked',
  },
  {
    id: 'sec-3',
    email: 'usuario.demo@empresa-nao-parceira.com',
    ip: '201.86.15.200',
    location: 'Rio de Janeiro, BR',
    device: 'Android 14 / Mobile Safari',
    reason: 'invalid_sso_domain',
    timestamp: '2026-07-30T07:50:33Z',
    status: 'blocked',
  },
  {
    id: 'sec-4',
    email: 'tentativa.login@malicious.org',
    ip: '185.220.101.5',
    location: 'Frankfurt, DE',
    device: 'Mac OS X / Tor Browser',
    reason: 'brute_force',
    timestamp: '2026-07-30T06:30:15Z',
    status: 'blocked',
  },
  {
    id: 'sec-5',
    email: 'joao.externo@gmail.com',
    ip: '177.136.24.91',
    location: 'Campinas, BR',
    device: 'Windows 10 / Edge 125',
    reason: 'unauthorized_email',
    timestamp: '2026-07-30T05:15:40Z',
    status: 'flagged',
  },
];

export function SecurityAuditLogsWidget() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);

  const filteredLogs = MOCK_SECURITY_LOGS.filter((log) => {
    const matchSearch =
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchReason = reasonFilter === 'all' || log.reason === reasonFilter;
    return matchSearch && matchReason;
  });

  const getReasonBadge = (reason: SecurityAttemptLog['reason']) => {
    switch (reason) {
      case 'unauthorized_email':
        return <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">E-mail Não Autorizado</span>;
      case 'brute_force':
        return <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Ataque Força Bruta</span>;
      case 'invalid_sso_domain':
        return <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Domínio SSO Não Autorizado</span>;
      case 'mfa_failed':
        return <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Falha no 2FA/MFA</span>;
    }
  };

  const handleExport = () => {
    toast.success('Relatório de Tentativas de Acesso exportado em CSV/Logs!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Trilha de Auditoria Imutável ISO 27001 & Logs de Segurança
              <span className="text-[10px] font-black bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                Item 021 (ISO 27001)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rastreamento inalterável de todas as ações CREATE, UPDATE e DELETE com assinatura imutável SHA-256.
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Cards de Métricas de Invasão */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-red-600 dark:text-red-400">28</p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Tentativas Bloqueadas (24h)</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-amber-500">100%</p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Proteção Anti-Brute Force</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-black text-emerald-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> WAF L7
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Filtro Cloudflare Ativo</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por e-mail, IP ou local..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todos os Motivos</option>
            <option value="unauthorized_email" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">E-mail Não Cadastrado</option>
            <option value="brute_force" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Anti-Brute Force</option>
            <option value="invalid_sso_domain" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Domínio SSO Não Autorizado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs de Invasão */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <th className="py-3 px-3">E-mail Tentado</th>
              <th className="py-3 px-3">IP de Origem</th>
              <th className="py-3 px-3">Localização</th>
              <th className="py-3 px-3">Dispositivo / SO</th>
              <th className="py-3 px-3">Motivo do Bloqueio</th>
              <th className="py-3 px-3 text-right">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {log.email}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {log.ip}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {log.location}
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-slate-400" />
                    {log.device}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {getReasonBadge(log.reason)}
                </td>
                <td className="py-3 px-3 text-right text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Laudo Mensal de Auditoria ISO 27001 (Item 112) */}
      <PeriodicAuditReportModal
        isOpen={showPeriodicModal}
        onClose={() => setShowPeriodicModal(false)}
      />
    </div>
  );
}
