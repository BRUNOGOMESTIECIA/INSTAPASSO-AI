import React, { useState, useEffect } from 'react';
import { Building2, Tag, DollarSign, Plus, Users, CheckCircle2, TrendingUp, Search, UserCheck, Wallet } from 'lucide-react';
import { getCostCenters, addCostCenter, getCostCenterMetrics, type CostCenter } from '../../lib/departments-cost-centers';
import { toast } from 'sonner';

/**
 * 🏷️ Widget do Item 030: Cadastro de Departamentos e Centros de Custo
 */
export function DepartmentCostCenterWidget() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [metrics, setMetrics] = useState(getCostCenterMetrics());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [deptName, setDeptName] = useState('');
  const [ccCode, setCcCode] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [budget, setBudget] = useState('25000');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getCostCenters();
    setCostCenters(list);
    setMetrics(getCostCenterMetrics());
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !ccCode || !managerName) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      await addCostCenter({
        code: ccCode.toUpperCase(),
        departmentName: deptName,
        managerName,
        managerEmail: managerEmail || `${managerName.toLowerCase().replace(/\s+/g, '.')}@empresa.com.br`,
        budgetMonthly: parseFloat(budget) || 25000,
        status: 'ACTIVE',
      });

      loadData();
      setShowAddModal(false);
      setDeptName('');
      setCcCode('');
      setManagerName('');
      setManagerEmail('');
      setBudget('25000');

      toast.success(`Departamento '${deptName}' (${ccCode.toUpperCase()}) cadastrado com sucesso!`);
    } catch (err) {
      toast.error('Erro ao cadastrar Centro de Custo.');
    }
  };

  const filteredList = costCenters.filter(
    (c) =>
      c.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.managerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Cadastro de Departamentos e Centros de Custo
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Item 030
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mapeamento de setores corporativos, gestores responsáveis e rateio orçamentário de TI.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Novo Departamento / CC
        </button>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Setores Ativos</p>
              <p className="text-sm font-black text-white">{metrics.activeDepartmentsCount} Departamentos</p>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Centros de Custo (CC)</p>
              <p className="text-sm font-black text-indigo-300">{metrics.totalCostCenters} Mapeados</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orçamento Mensal</p>
              <p className="text-sm font-black text-amber-300">
                R$ {metrics.totalMonthlyBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tickets Consumidos</p>
              <p className="text-sm font-black text-slate-200">{metrics.totalTicketsAssociated} Chamados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Centros de Custo */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Centros de Custo e Departamentos Cadastrados
          </h4>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar setor, código ou gestor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Código CC</th>
                <th className="py-2.5 px-4">Departamento / Setor</th>
                <th className="py-2.5 px-4">Gestor Responsável</th>
                <th className="py-2.5 px-4">Orçamento Mensal</th>
                <th className="py-2.5 px-4">Tickets Consumidos</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredList.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {c.departmentName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="font-medium text-slate-200">{c.managerName}</span>
                        <span className="block text-[10px] font-mono text-slate-500">{c.managerEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    R$ {c.budgetMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {c.ticketsConsumed} tickets
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Inclusão de Departamento / Centro de Custo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h4 className="font-extrabold text-base text-white">Cadastrar Departamento & Centro de Custo</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marketing & Growth"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Código do Centro de Custo (CC) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CC-6060-MKT"
                  value={ccCode}
                  onChange={(e) => setCcCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Gestor Responsável *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fernando Souza"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">E-mail do Gestor</label>
                <input
                  type="email"
                  placeholder="Ex: fernando.souza@empresa.com.br"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Orçamento Mensal Alocado (R$)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Salvar Departamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
