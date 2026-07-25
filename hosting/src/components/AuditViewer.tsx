import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGICAL_DELETE';
  targetDomain: string;
  targetCompany: string;
  timestamp: any;
  previousState: any;
  newState: any;
}

export default function AuditViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Consulta os últimos 50 logs ordenados do mais recente para o mais antigo
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setLogs(logsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar logs de auditoria:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-900/50 text-green-400 border border-green-800">CRIADO</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-800">ATUALIZADO</span>;
      case 'LOGICAL_DELETE':
      case 'DELETE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">EXCLUÍDO</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">{action}</span>;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Logs de Auditoria (ISO 27001)</h1>
        <p className="text-muted text-sm">Registro inalterável de todas as modificações de acesso realizadas no sistema.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-border bg-zinc-900/50">
          <h3 className="text-lg font-medium leading-6">Últimas Atividades (Top 50)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 border-border bg-zinc-900/30">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-muted">Data / Hora</th>
                <th scope="col" className="px-6 py-4 font-semibold text-muted">Ação</th>
                <th scope="col" className="px-6 py-4 font-semibold text-muted">Domínio Afetado</th>
                <th scope="col" className="px-6 py-4 font-semibold text-muted">Empresa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    Carregando logs de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4 text-muted">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {log.targetDomain}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {log.targetCompany}
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
