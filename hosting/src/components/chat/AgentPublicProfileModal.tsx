import React from 'react';
import { ShieldCheck, Star, Award, CheckCircle2, Clock, X, MessageSquare, Briefcase } from 'lucide-react';
import { type AgentPublicProfile } from '../../lib/agent-public-profile';

interface AgentPublicProfileModalProps {
  profile: AgentPublicProfile;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🖼️ Modal do Item 033: Cartão de Perfil Público do Atendente no Chat do Cliente
 */
export function AgentPublicProfileModal({ profile, isOpen, onClose }: AgentPublicProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
        {/* Glow de Fundo Estilizado */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header com Botão Fechar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Perfil do Atendente Responsável</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Foto de Perfil & Status */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 shadow-xl"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-sm" title="Disponível no Chat" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-extrabold text-base text-white">{profile.name}</h3>
              {profile.verifiedAgent && (
                <span title="Atendente Verificado">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                </span>
              )}
            </div>
            <p className="text-xs text-blue-300 font-medium mt-0.5">{profile.jobTitle}</p>
          </div>
        </div>

        {/* Estatísticas de Desempenho (CSAT & Resolvidos) */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center justify-center p-2 text-center border-r border-slate-800/80">
            <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{profile.csatRating.toFixed(1)} / 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Satisfação CSAT</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-sm">
              <Award className="w-4 h-4" />
              <span>{profile.totalResolved.toLocaleString()}+</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Chamados Resolvidos</span>
          </div>
        </div>

        {/* Biografia Resumida */}
        {profile.bioShort && (
          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sobre o Atendente</span>
            <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 italic text-[11px]">
              "{profile.bioShort}"
            </p>
          </div>
        )}

        {/* Especialidades Técnicas (Pílulas) */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Especialidades Técnicas</span>
          <div className="flex flex-wrap gap-1.5">
            {profile.specialties.map((spec, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Continuar Atendimento
          </button>
        </div>
      </div>
    </div>
  );
}
