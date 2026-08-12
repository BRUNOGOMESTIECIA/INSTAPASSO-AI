import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Clock, Users, RefreshCw, Play, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { getPasswordPolicyConfig, savePasswordPolicyConfig, getAllUsersPasswordStatuses, type UserPasswordStatus, type PasswordPolicyConfig } from '../../lib/password-rotation-policy';
import { ExpiredPasswordRenewalModal } from '../auth/ExpiredPasswordRenewalModal';
import { toast } from 'sonner';

/**
 * 🔒 Widget do Item 138: Gestão da Política de Troca de Senha Periódica (90 Dias)
 */
export function PasswordPolicyAdminWidget() {
  const [config, setConfig] = useState<PasswordPolicyConfig>(getPasswordPolicyConfig());
  const [userStatuses, setUserStatuses] = useState<UserPasswordStatus[]>([]);
  const [selectedExpiredUser, setSelectedExpiredUser] = useState<UserPasswordStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setConfig(getPasswordPolicyConfig());
    setUserStatuses(getAllUsersPasswordStatuses());
  };

  const handleMaxAgeChange = (days: number) => {
    const updated = { ...config, maxAgeDays: days };
    setConfig(updated);
    savePasswordPolicyConfig(updated);
    setUserStatuses(getAllUsersPasswordStatuses());
    toast.success(`Validade máxima da senha ajustada para ${days} dias!`);
  };

  const handleSimulateExpiredLogin = (user: UserPasswordStatus) => {
    setSelectedExpiredUser({
      ...user,
      daysActive: 95, // Força status expirado para o teste
      isExpired: true,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Exigência de Troca de Senha Periódica (Política de 90 dias)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Item 138
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Renovação obrigatória de credenciais expiradas com gravação direta no InstaPasso SSO (Banco 1).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-rose-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Política 90 Dias: ATIVA
        </span>
      </div>

      {/* Seletor de Validade da Senha */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Prazo Máximo de Validade da Senha Corporativa
            </h4>
          </div>

          <div className="flex gap-2">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleMaxAgeChange(days)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.maxAgeDays === days
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {days} dias {days === 90 ? '(Padrão)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Alerta Preventivo</span>
            <p className="font-bold text-amber-300 mt-0.5">Faltando {config.warnBeforeDays} dias para expirar</p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Proibição de Histórico</span>
            <p className="font-bold text-indigo-300 mt-0.5">Não reutilizar últimas {config.enforceHistoryCount} senhas</p>
          </div>
        </div>
      </div>

      {/* Tabela de Status de Senha por Operador */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-4 h-4 text-rose-400" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Status de Validade das Senhas no InstaPasso SSO
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Usuário</th>
                <th className="py-2.5 px-4">Idade da Senha</th>
                <th className="py-2.5 px-4">Dias Restantes</th>
                <th className="py-2.5 px-4">Status de Expiração</th>
                <th className="py-2.5 px-4 text-right">Ação de Teste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {userStatuses.map((u) => (
                <tr key={u.userEmail} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{u.userName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{u.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {u.daysActive} dias
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {u.daysRemaining} dias
                  </td>
                  <td className="py-3 px-4">
                    {u.isExpired ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔴 EXPIRADA (+90 dias)
                      </span>
                    ) : u.isWarningPeriod ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🟡 ALERTA PREVENTIVO
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 VÁLIDA
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSimulateExpiredLogin(u)}
                      className="flex items-center gap-1 px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer ml-auto"
                    >
                      <Play className="w-3 h-3" />
                      Simular Expiração
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Teste de Renovação */}
      {selectedExpiredUser && (
        <ExpiredPasswordRenewalModal
          isOpen={isModalOpen}
          userEmail={selectedExpiredUser.userEmail}
          userName={selectedExpiredUser.userName}
          daysActive={selectedExpiredUser.daysActive}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            loadData();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
