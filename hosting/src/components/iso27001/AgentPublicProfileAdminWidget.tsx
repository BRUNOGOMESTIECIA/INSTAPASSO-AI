import React, { useState, useEffect } from 'react';
import { UserCheck, Image as ImageIcon, Star, Award, Eye, Edit3, CheckCircle2, Sparkles, Plus, Save } from 'lucide-react';
import { getAgentProfiles, saveAgentPublicProfile, type AgentPublicProfile } from '../../lib/agent-public-profile';
import { AgentPublicProfileModal } from '../chat/AgentPublicProfileModal';
import { toast } from 'sonner';

/**
 * 🖼️ Widget do Item 033: Gestão do Perfil Público do Atendente no Chat
 */
export function AgentPublicProfileAdminWidget() {
  const [profiles, setProfiles] = useState<AgentPublicProfile[]>([]);
  const [selectedProfileForPreview, setSelectedProfileForPreview] = useState<AgentPublicProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<AgentPublicProfile | null>(null);
  const [specialtiesText, setSpecialtiesText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProfiles(getAgentProfiles());
  };

  const handleEditClick = (p: AgentPublicProfile) => {
    setEditingProfile(p);
    setSpecialtiesText(p.specialties.join(', '));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updatedSpecialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: AgentPublicProfile = {
      ...editingProfile,
      specialties: updatedSpecialties.length > 0 ? updatedSpecialties : editingProfile.specialties,
    };

    try {
      await saveAgentPublicProfile(updated);
      loadData();
      setEditingProfile(null);
      toast.success(`Perfil público de '${updated.name}' atualizado com sucesso!`);
    } catch (err) {
      toast.error('Erro ao salvar perfil público.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Perfil Público de Atendente no Chat
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Item 033
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Exibição de foto, cargo, especialidades técnicas, nota CSAT e biografia no atendimento ao vivo.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-blue-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Exibição no Chat: ATIVA
        </span>
      </div>

      {/* Tabela de Perfis Públicos dos Atendentes */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Atendentes e Credenciais Públicas
            </h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Foto & Atendente</th>
                <th className="py-2.5 px-4">Cargo Público</th>
                <th className="py-2.5 px-4">Especialidades Técnicas</th>
                <th className="py-2.5 px-4">Métricas CSAT</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {profiles.map((p) => (
                <tr key={p.agentId} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-slate-200">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-300">
                    {p.jobTitle}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.specialties.map((spec, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {p.csatRating.toFixed(1)} / 5.0
                    </div>
                    <div className="text-[10px] text-slate-500">{p.totalResolved} resolvidos</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedProfileForPreview(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                        title="Pré-visualizar Cartão do Cliente"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pré-visualização do Cartão do Cliente */}
      {selectedProfileForPreview && (
        <AgentPublicProfileModal
          profile={selectedProfileForPreview}
          isOpen={!!selectedProfileForPreview}
          onClose={() => setSelectedProfileForPreview(null)}
        />
      )}

      {/* Modal de Edição de Perfil Público */}
      {editingProfile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-base text-white">Editar Perfil Público: {editingProfile.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">URL da Foto de Perfil (Avatar)</label>
                <input
                  type="text"
                  value={editingProfile.avatarUrl}
                  onChange={(e) => setEditingProfile({ ...editingProfile, avatarUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Cargo Público de Atendimento</label>
                <input
                  type="text"
                  value={editingProfile.jobTitle}
                  onChange={(e) => setEditingProfile({ ...editingProfile, jobTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Biografia Curta para o Cliente</label>
                <textarea
                  rows={2}
                  value={editingProfile.bioShort}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bioShort: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Especialidades Técnicas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  placeholder="Ex: Windows Server, VPN & Firewall, Office 365"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Salvar Perfil Público
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
