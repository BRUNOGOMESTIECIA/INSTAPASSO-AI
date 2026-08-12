import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, CheckCircle2, Fingerprint, Smartphone, Laptop, Plus, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { getPasskeysPolicyConfig, savePasskeysPolicyConfig, getRegisteredPasskeysList, registerUserPasskey, type RegisteredPasskey, type PasskeysPolicyConfig } from '../../lib/passkeys-fido2';
import { toast } from 'sonner';

/**
 * 🔑 Widget do Item 009: Gestão da Política de Biometria / Passkeys (FIDO2)
 */
export function PasskeysFido2AdminWidget() {
  const [config, setConfig] = useState<PasskeysPolicyConfig>(getPasskeysPolicyConfig());
  const [passkeys, setPasskeys] = useState<RegisteredPasskey[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State para simulador de cadastro
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [deviceName, setDeviceName] = useState('MacBook Pro (TouchID)');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setConfig(getPasskeysPolicyConfig());
    setPasskeys(getRegisteredPasskeysList());
  };

  const handleTogglePolicy = async (enabled: boolean) => {
    const updated = await savePasskeysPolicyConfig({
      ...config,
      enabled,
    }, 'Bruno Gomes (Super Admin)');

    setConfig(updated);
    if (enabled) {
      toast.success('Biometria / Passkeys (FIDO2) ATIVADA pelo Administrador! Botão visível no login.');
    } else {
      toast.info('Biometria / Passkeys DESATIVADA pelo Administrador. Retornado ao login padrão.');
    }
  };

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      toast.error('Preencha o nome e e-mail para registrar a Passkey!');
      return;
    }

    setIsRegistering(true);
    try {
      const created = await registerUserPasskey(userName, userEmail, deviceName);
      loadData();
      setUserName('');
      setUserEmail('');
      setIsRegistering(false);

      toast.success(`Chave biométrica para '${created.userName}' cadastrada com sucesso!`);
    } catch (err) {
      toast.error('Erro ao cadastrar Passkey.');
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Autenticação por Biometria / Passkeys (FIDO2)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Item 009
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Login sem senha (*Passwordless*) via TouchID, FaceID, Windows Hello e YubiKey.
            </p>
          </div>
        </div>

        {/* Toggle do Administrador (Condição do Usuário) */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300">Exigência pelo Admin:</span>
          <button
            onClick={() => handleTogglePolicy(!config.enabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              config.enabled
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {config.enabled ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                🟢 MODO PASSKEYS ATIVADO
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                🔴 MODO PASSKEYS DESATIVADO
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner Informativo sobre a Condição */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
        config.enabled
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <Key className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" />
        <div>
          <strong className="block text-white font-bold mb-0.5">
            {config.enabled
              ? '🟢 Biometria Habilitada pelo Administrador'
              : '🔴 Biometria Pausada pelo Administrador'}
          </strong>
          <p className="leading-relaxed">
            {config.enabled
              ? 'O botão de login "🔑 Entrar com Biometria / Passkey (FIDO2)" está VISÍVEL e ativo nas telas de login do Portal Operacional e do Cliente.'
              : 'Conforme exigência, o recurso permanece desativado. Ative a chave acima para disponibilizar o botão de login por biometria.'}
          </p>
        </div>
      </div>

      {/* Cadastrar Nova Passkey (Simulador) */}
      <form onSubmit={handleRegisterPasskey} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Registrar Nova Credencial Biométrica (Passkey FIDO2)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Usuário *</label>
            <input
              type="text"
              required
              placeholder="Ex: Rodrigo Mendonça"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">E-mail Corporativo *</label>
            <input
              type="email"
              required
              placeholder="rodrigo@empresa.com.br"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Dispositivo Biométrico</label>
            <select
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
            >
              <option value="MacBook Pro (TouchID Biometria)">MacBook Pro (TouchID Biometria)</option>
              <option value="iPhone / iPad (FaceID)">iPhone / iPad (FaceID)</option>
              <option value="Windows Hello (FaceID & TPM 2.0)">Windows Hello (FaceID & TPM 2.0)</option>
              <option value="YubiKey 5 NFC (Chave Física FIDO2)">YubiKey 5 NFC (Chave Física FIDO2)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="submit"
            disabled={isRegistering}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Vincular Biometria / Passkey FIDO2
          </button>
        </div>
      </form>

      {/* Tabela de Passkeys Cadastradas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Key className="w-4 h-4 text-indigo-400" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Credenciais Biométricas e Chaves FIDO2 Cadastradas
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Usuário</th>
                <th className="py-2.5 px-4">Dispositivo Biométrico</th>
                <th className="py-2.5 px-4">ID de Credencial FIDO2</th>
                <th className="py-2.5 px-4 text-right">Status FIDO2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {passkeys.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{p.userName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-300">
                    {p.deviceName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {p.credentialId}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🟢 VÁLIDO & ATIVO
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
