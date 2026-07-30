import { useState } from 'react';

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

const MOCK_SECURITY_LOGS: SecurityAttemptLog[] = [
  {
    id: 'sec-1',
    email: 'hacker_test@external.com',
    ip: '189.44.120.91',
    location: 'São Paulo, BR',
    device: 'Windows 11 / Chrome 126',
    reason: 'unauthorized_email',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    status: 'blocked',
  },
  {
    id: 'sec-2',
    email: 'admin@desconhecido.net',
    ip: '45.142.214.50',
    location: 'Moscou, RU',
    device: 'Linux / Firefox 125',
    reason: 'brute_force',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'blocked',
  },
  {
    id: 'sec-3',
    email: 'usuario.demo@empresa-nao-parceira.com',
    ip: '201.86.15.200',
    location: 'Rio de Janeiro, BR',
    device: 'Android 14 / Mobile Safari',
    reason: 'invalid_sso_domain',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'blocked',
  },
  {
    id: 'sec-4',
    email: 'tentativa.login@malicious.org',
    ip: '185.220.101.5',
    location: 'Frankfurt, DE',
    device: 'Mac OS X / Tor Browser',
    reason: 'brute_force',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    status: 'blocked',
  },
  {
    id: 'sec-5',
    email: 'joao.externo@gmail.com',
    ip: '177.136.24.91',
    location: 'Campinas, BR',
    device: 'Windows 10 / Edge 125',
    reason: 'unauthorized_email',
    timestamp: new Date(Date.now() - 480 * 60000).toISOString(),
    status: 'flagged',
  },
];

export default function SecurityIntrusionsViewer() {
  const [filterReason, setFilterReason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = MOCK_SECURITY_LOGS.filter((log) => {
    const matchesReason = filterReason === 'all' || log.reason === filterReason;
    const matchesSearch =
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesReason && matchesSearch;
  });

  const getReasonBadge = (reason: SecurityAttemptLog['reason']) => {
    switch (reason) {
      case 'unauthorized_email':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">E-mail Não Cadastrado</span>;
      case 'brute_force':
        return <span className="bg-red-950/80 text-red-300 border border-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Bloqueio Anti-Brute Force</span>;
      case 'invalid_sso_domain':
        return <span className="bg-purple-950/80 text-purple-300 border border-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Domínio SSO Não Autorizado</span>;
      case 'mfa_failed':
        return <span className="bg-orange-950/80 text-orange-300 border border-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Falha no 2FA/MFA</span>;
    }
  };

  const handleExportCSV = () => {
    let csvContent = "Data_Hora,Email_Tentado,IP_Origem,Localizacao,Dispositivo,Motivo\n";
    filteredLogs.forEach((l) => {
      csvContent += `"${new Date(l.timestamp).toLocaleString('pt-BR')}","${l.email}","${l.ip}","${l.location}","${l.device}","${l.reason}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_tentativas_invasao_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Header com Estatísticas em InstaPasso */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            🚨 Painel de Tentativas de Invasão & Acessos Bloqueados (InstaPasso)
            <span className="text-[10px] font-black bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-800">
              SEGURANÇA ISO 27001
            </span>
          </h3>
          <p className="text-xs text-muted mt-1">
            Registro de logins com e-mails não permitidos, IPs bloqueados por força bruta e auditoria de borda.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-bold rounded-xl transition-colors shadow-sm self-start md:self-auto cursor-pointer"
        >
          📊 Exportar Logs (.CSV)
        </button>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
          <p className="text-2xl font-black text-red-400">28</p>
          <p className="text-[11px] font-bold text-muted uppercase mt-0.5">Tentativas Bloqueadas (24h)</p>
        </div>
        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
          <p className="text-2xl font-black text-amber-400">100%</p>
          <p className="text-[11px] font-bold text-muted uppercase mt-0.5">Anti-Brute Force Ativo</p>
        </div>
        <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center">
          <p className="text-2xl font-black text-emerald-400">WAF L7</p>
          <p className="text-[11px] font-bold text-muted uppercase mt-0.5">Filtro de Borda Cloudflare</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por e-mail, IP ou localidade..."
          className="w-full sm:w-80 px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-muted"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-muted">Filtrar por Motivo:</span>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold text-foreground outline-none"
          >
            <option value="all">Todos os Motivos</option>
            <option value="unauthorized_email">E-mail Não Cadastrado</option>
            <option value="brute_force">Anti-Brute Force (IP Bloqueado)</option>
            <option value="invalid_sso_domain">Domínio SSO Não Autorizado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Invasões Bloqueadas em InstaPasso */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-border bg-zinc-900/50 text-muted font-bold">
              <tr>
                <th scope="col" className="px-5 py-3.5">E-mail Tentado</th>
                <th scope="col" className="px-5 py-3.5">IP de Origem</th>
                <th scope="col" className="px-5 py-3.5">Localização</th>
                <th scope="col" className="px-5 py-3.5">Dispositivo / SO</th>
                <th scope="col" className="px-5 py-3.5">Motivo do Bloqueio</th>
                <th scope="col" className="px-5 py-3.5 text-right">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-foreground">
                    {log.email}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-400">
                    {log.ip}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    📍 {log.location}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    💻 {log.device}
                  </td>
                  <td className="px-5 py-3.5">
                    {getReasonBadge(log.reason)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
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
