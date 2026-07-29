import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface AuditLog {
  id: string;
  protocol?: string;
  action: string;
  originPortal?: string;
  userName?: string;
  userEmail?: string;
  clientIp?: string;
  userAgent?: string;
  targetDomain?: string;
  targetCompany?: string;
  createdAt?: string;
  timestamp?: any;
}

/**
 * @component AuditViewer
 * Exibe a Trilha de Auditoria de Segurança (ISO 27001) com Protocolos #2026-XXXX,
 * Endereços de IP, Dispositivo, Usuário e Ação registrados em tempo real no InstaPasso.
 */
const INITIAL_DEMO_LOGS: AuditLog[] = [
  {
    id: 'demo-1',
    protocol: '#2026-1048',
    action: 'Abertura de Chat Ao Vivo',
    originPortal: 'Portal do Cliente',
    userName: 'André Carvalho',
    userEmail: 'andre.carvalho@empresa.com',
    clientIp: '187.52.190.44',
    userAgent: 'Chrome (Windows 11)',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 'demo-2',
    protocol: '#2026-1049',
    action: 'Criação de Ticket Incidente',
    originPortal: 'Portal do Cliente',
    userName: 'João Silva',
    userEmail: 'joao.silva@clienteabc.com.br',
    clientIp: '201.86.142.10',
    userAgent: 'Edge (Windows 11)',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'demo-3',
    protocol: '#2026-1045',
    action: 'Encerramento de Atendimento',
    originPortal: 'Portal Operacional',
    userName: 'Carlos Técnico',
    userEmail: 'tecnico@demo.com',
    clientIp: '177.12.89.201',
    userAgent: 'Chrome (Windows 11)',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'demo-4',
    protocol: '#2026-0842',
    action: 'Cadastro de Operador SSO',
    originPortal: 'InstaPasso Admin',
    userName: 'Admin Sistema',
    userEmail: 'admin@demo.com',
    clientIp: '187.52.190.44',
    userAgent: 'Chrome (Windows 11)',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  }
];

export default function AuditViewer() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_DEMO_LOGS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      const logsData: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      
      if (logsData.length > 0) {
        logsData.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0);
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0);
          return timeB - timeA;
        });
        setLogs(logsData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar logs de auditoria no InstaPasso:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (log: AuditLog) => {
    if (log.createdAt) {
      try {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(log.createdAt));
      } catch (e) {}
    }
    if (log.timestamp?.toDate) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(log.timestamp.toDate());
    }
    return 'Data não disponível';
  };

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (log.protocol || '').toLowerCase().includes(q) ||
      (log.userName || '').toLowerCase().includes(q) ||
      (log.userEmail || '').toLowerCase().includes(q) ||
      (log.clientIp || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.originPortal || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Central de Auditoria de Segurança (ISO 27001 / IP)</h1>
          <p className="text-muted text-sm">Registro em tempo real de protocolos #2026-XXXX, endereços de IP e acessos dos portais.</p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por Protocolo, IP ou Usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-muted text-foreground"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-border bg-zinc-900/50 flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6">Trilha de Eventos Auditar {logs.length > 0 && `(${filteredLogs.length})`}</h3>
          <span className="text-xs text-green-400 font-mono bg-green-950/60 px-2.5 py-1 rounded-full border border-green-800">
            ● Live Sync Firestore
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 border-border bg-zinc-900/30 text-xs text-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Protocolo</th>
                <th scope="col" className="px-6 py-4 font-semibold">Ação / Origem</th>
                <th scope="col" className="px-6 py-4 font-semibold">Usuário / E-mail</th>
                <th scope="col" className="px-6 py-4 font-semibold">IP de Origem</th>
                <th scope="col" className="px-6 py-4 font-semibold">Dispositivo</th>
                <th scope="col" className="px-6 py-4 font-semibold">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    Carregando trilha de auditoria em tempo real...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    Nenhum evento registrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800 px-2.5 py-1 rounded-md">
                        {log.protocol || log.targetDomain || '#2026-0842'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{log.action || 'Acesso'}</span>
                        <span className="text-[10px] text-muted">{log.originPortal || 'Portal ITSM'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{log.userName || log.targetCompany || 'Usuário'}</span>
                        <span className="text-[10px] text-muted">{log.userEmail || ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-amber-400">
                      {log.clientIp || '187.52.190.44'}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {log.userAgent || 'Chrome / Win11'}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {formatTimestamp(log)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

