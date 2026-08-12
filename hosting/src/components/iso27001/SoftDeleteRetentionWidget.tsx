import React, { useState, useEffect } from 'react';
import { Trash2, UserX, ShieldCheck, Archive, RotateCcw, CheckCircle2, UserCheck, AlertTriangle, FileText, Search } from 'lucide-react';
import { getUsersWithSoftDelete, performSoftDelete, restoreSoftDeletedUser, getSoftDeleteMetrics, type SoftDeleteUser } from '../../lib/soft-delete-retention';
import { toast } from 'sonner';

/**
 * 🗑️ Widget do Item 031: Soft Delete com Retenção Histórica
 */
export function SoftDeleteRetentionWidget() {
  const [users, setUsers] = useState<SoftDeleteUser[]>([]);
  const [metrics, setMetrics] = useState(getSoftDeleteMetrics());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<SoftDeleteUser | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getUsersWithSoftDelete();
    setUsers(list);
    setMetrics(getSoftDeleteMetrics());
  };

  const handleConfirmSoftDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDelete) return;

    if (!deleteReason.trim()) {
      toast.error('Informe a justificativa de desativação para o audit log!');
      return;
    }

    try {
      await performSoftDelete(selectedUserForDelete.id, deleteReason, 'Bruno Gomes (Super Admin)');
      loadData();
      setSelectedUserForDelete(null);
      setDeleteReason('');

      toast.success(`Soft Delete executado! A conta de '${selectedUserForDelete.name}' foi desativada e seu histórico mantido.`);
    } catch (err) {
      toast.error('Erro ao executar Soft Delete.');
    }
  };

  const handleRestoreUser = async (user: SoftDeleteUser) => {
    try {
      await restoreSoftDeletedUser(user.id, 'Bruno Gomes (Super Admin)');
      loadData();
      toast.success(`Conta de '${user.name}' restaurada e reativada com sucesso!`);
    } catch (err) {
      toast.error('Erro ao restaurar conta.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Soft Delete com Retenção Histórica
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Item 031
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Desativação lógica de contas com bloqueio instantâneo de SSO e preservação total de tickets e auditorias (LGPD / ISO 27001).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-rose-400">
          Retenção: 100% Preservada
        </span>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contas Ativas</p>
              <p className="text-sm font-black text-white">{metrics.activeUsersCount} Usuários</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserX className="w-4 h-4 text-rose-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contas Desativadas (Soft Delete)</p>
              <p className="text-sm font-black text-rose-300">{metrics.softDeletedUsersCount} Inativas</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Archive className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Histórico de Tickets Mantido</p>
              <p className="text-sm font-black text-indigo-300">{metrics.totalPreservedTickets} Tickets Intactos</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Restauração de Conta</p>
              <p className="text-sm font-black text-slate-200">1-Clique (Instantânea)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Gestão de Contas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-rose-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Gerenciamento de Contas e Retenção Lógica
            </h4>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Usuário / E-mail</th>
                <th className="py-2.5 px-4">Cargo & Empresa</th>
                <th className="py-2.5 px-4">Histórico Preservado</th>
                <th className="py-2.5 px-4">Status SSO</th>
                <th className="py-2.5 px-4 text-right">Ação de Governança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{u.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-300">{u.role}</div>
                    <div className="text-[11px] text-slate-500">{u.companyName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-indigo-400 font-bold">{u.historicalTicketsCount} tickets</span>
                    <span className="block text-[10px] text-amber-400">CSAT {u.historicalCsatAverage} ★</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      u.isSoftDeleted 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {u.isSoftDeleted ? '🔴 SOFT DELETED (Bloqueado)' : '🟢 ATIVO'}
                    </span>
                    {u.deletedReason && (
                      <span className="block text-[10px] text-slate-500 italic mt-0.5 max-w-xs truncate" title={u.deletedReason}>
                        Motivo: "{u.deletedReason}"
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.isSoftDeleted ? (
                      <button
                        onClick={() => handleRestoreUser(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all ml-auto cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reativar Conta
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUserForDelete(u);
                          setDeleteReason('Desligamento corporativo a pedido da gestão de RH');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-all ml-auto cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Soft Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Justificativa para Soft Delete */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmSoftDelete} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h4 className="font-extrabold text-base text-white">Executar Soft Delete</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Aviso de Retenção LGPD / ISO 27001
              </p>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                A conta de <strong>{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email}) será desativada e bloqueada no InstaPasso SSO. Todos os <strong>{selectedUserForDelete.historicalTicketsCount} tickets passados</strong> permanecerão preservados nos relatórios.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Justificativa de Desativação (Audit Log) *</label>
              <textarea
                required
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Informe o motivo da desativação (ex: Desligamento corporativo)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Confirmar Soft Delete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
