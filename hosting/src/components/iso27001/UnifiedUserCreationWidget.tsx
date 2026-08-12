import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, UserCheck, Building2, Sparkles, Plus, RefreshCw, CheckCircle2, Search, Briefcase, Mail, Key } from 'lucide-react';
import { getUnifiedUsersList, createUnifiedUserInInstaPasso, getUnifiedUserMetrics, type UnifiedUserRecord, type UserAccountType, type UserRoleKey, ROLE_LABELS } from '../../lib/unified-user-creation';
import { toast } from 'sonner';

/**
 * 👤 Widget do Item 026: Painel Unificado de Criação de Usuários
 */
export function UnifiedUserCreationWidget() {
  const [users, setUsers] = useState<UnifiedUserRecord[]>([]);
  const [metrics, setMetrics] = useState(getUnifiedUserMetrics());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<UserAccountType>('OPERATIONAL');
  const [roleKey, setRoleKey] = useState<UserRoleKey>('N1_SUPPORT');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [departmentName, setDepartmentName] = useState('TI & Infraestrutura');
  const [costCenterCode, setCostCenterCode] = useState('CC-2020-TI');
  const [companyName, setCompanyName] = useState('TechCorp Soluções B2B');
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getUnifiedUsersList();
    setUsers(list);
    setMetrics(getUnifiedUserMetrics());
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Preencha os campos obrigatórios!');
      return;
    }

    if (roleKey === 'CUSTOM' && !customRoleTitle.trim()) {
      toast.error('Informe a denominação do cargo personalizado!');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createUnifiedUserInInstaPasso({
        name,
        email,
        accountType,
        roleKey,
        customRoleTitle,
        departmentName,
        costCenterCode,
        companyName,
        isVip,
      });

      loadData();
      setName('');
      setEmail('');
      setCustomRoleTitle('');
      setIsSubmitting(false);

      toast.success(`Usuário '${created.name}' criado e sincronizado com sucesso no InstaPasso SSO!`);
    } catch (err) {
      toast.error('Erro ao cadastrar usuário no InstaPasso SSO.');
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyOrDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Painel Unificado de Criação de Usuários (InstaPasso SSO)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Item 026
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastro único centralizado com gravação direta no InstaPasso SSO (Banco 1) e suporte a cargos personalizados.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          InstaPasso SSO LIVE
        </span>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total de Usuários</p>
              <p className="text-sm font-black text-white">{metrics.totalUsersCount} Cadastrados</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Colaboradores</p>
              <p className="text-sm font-black text-indigo-300">{metrics.operationalCount} Operacionais</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Clientes B2B</p>
              <p className="text-sm font-black text-amber-300">{metrics.clientB2bCount} Solicitantes</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sincronismo SSO</p>
              <p className="text-sm font-black text-emerald-400">100% Sincronizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário Unificado de Criação */}
      <form onSubmit={handleCreateUser} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Criar Nova Conta no InstaPasso SSO
            </h4>
          </div>

          {/* Account Type Tabs */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAccountType('OPERATIONAL');
                setRoleKey('N1_SUPPORT');
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                accountType === 'OPERATIONAL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Colaborador Operacional
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('CLIENT_B2B');
                setRoleKey('CLIENT_REGULAR');
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                accountType === 'CLIENT_B2B'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👥 Cliente Solicitante B2B
            </button>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Rodrigo Mendonça"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">E-mail Corporativo *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Ex: rodrigo.mendonca@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono pr-8"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Role & Specific Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Cargo / Papel no Sistema</label>
            <select
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value as UserRoleKey)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              {accountType === 'OPERATIONAL' ? (
                <>
                  <option value="N1_SUPPORT">{ROLE_LABELS.N1_SUPPORT}</option>
                  <option value="N2_SUPPORT">{ROLE_LABELS.N2_SUPPORT}</option>
                  <option value="N3_SPECIALIST">{ROLE_LABELS.N3_SPECIALIST}</option>
                  <option value="COORDINATOR">{ROLE_LABELS.COORDINATOR}</option>
                  <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                  <option value="CUSTOM">✨ {ROLE_LABELS.CUSTOM}</option>
                </>
              ) : (
                <>
                  <option value="CLIENT_REGULAR">{ROLE_LABELS.CLIENT_REGULAR}</option>
                  <option value="CLIENT_VIP">{ROLE_LABELS.CLIENT_VIP}</option>
                  <option value="CUSTOM">✨ {ROLE_LABELS.CUSTOM}</option>
                </>
              )}
            </select>
          </div>

          {/* Custom Role Input */}
          {roleKey === 'CUSTOM' ? (
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">Denominação do Cargo Personalizado *</label>
              <input
                type="text"
                required
                placeholder="Ex: Gestor de Cibersegurança & Infraestrutura Cloud"
                value={customRoleTitle}
                onChange={(e) => setCustomRoleTitle(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-200 outline-none focus:border-amber-400 font-bold"
              />
            </div>
          ) : accountType === 'OPERATIONAL' ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Departamento & Centro de Custo</label>
              <input
                type="text"
                value={`${departmentName} (${costCenterCode})`}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Empresa Cliente B2B</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 font-mono">
            ℹ️ A conta será ativada instantaneamente no InstaPasso SSO com acesso Single Sign-On.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Usuário no InstaPasso SSO
          </button>
        </div>
      </form>

      {/* Tabela de Usuários Cadastrados */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Usuários Sincronizados no InstaPasso SSO
            </h4>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Usuário / E-mail</th>
                <th className="py-2.5 px-4">Tipo de Conta</th>
                <th className="py-2.5 px-4">Cargo / Função</th>
                <th className="py-2.5 px-4">Lotação / Empresa</th>
                <th className="py-2.5 px-4 text-right">Status SSO</th>
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
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                      u.accountType === 'OPERATIONAL'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {u.accountType === 'OPERATIONAL' ? '🏢 Operacional' : '👥 Cliente B2B'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-200">{u.roleTitle}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {u.companyOrDepartment}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 justify-end ml-auto w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Sincronizado SSO
                    </span>
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
