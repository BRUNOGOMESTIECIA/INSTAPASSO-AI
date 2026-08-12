import { logCrudAudit } from './audit-logger';

/**
 * 🖼️ Item 033: Perfil Público de Atendente no Chat
 * 
 * Exibição de foto, cargo, especialidades técnicas, nota CSAT e biografia
 * para o cliente final durante o atendimento ao vivo no chat.
 */

export interface AgentPublicProfile {
  agentId: string;
  name: string;
  email: string;
  avatarUrl: string;
  jobTitle: string;
  specialties: string[];
  yearsExperience: number;
  bioShort: string;
  csatRating: number; // Ex: 4.9
  totalResolved: number; // Ex: 1420
  status: 'ONLINE' | 'IN_CALL' | 'OFFLINE';
  verifiedAgent: boolean;
  lastActive: string;
}

const STORAGE_KEY = 'portal_agent_public_profiles_list';

/**
 * Retorna todos os perfis públicos dos atendentes
 */
export function getAgentProfiles(): AgentPublicProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return getInitialMockAgentProfiles();
}

/**
 * Mocks iniciais com fotos, cargos e especialidades técnicas dos atendentes
 */
function getInitialMockAgentProfiles(): AgentPublicProfile[] {
  const timestamp = new Date().toISOString();
  return [
    {
      agentId: 'op_bruno_gomes',
      name: 'Bruno Gomes',
      email: 'bg@tiecia.com.br',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Super Administrador / Líder de Suporte N3',
      specialties: ['Infraestrutura Cloud', 'Segurança da Informação', 'Firewall & VPN', 'Cibersegurança'],
      yearsExperience: 8,
      bioShort: 'Líder técnico focado na alta disponibilidade de ambientes corporativos e resolução de chamados de alta complexidade.',
      csatRating: 4.9,
      totalResolved: 1420,
      status: 'ONLINE',
      verifiedAgent: true,
      lastActive: timestamp,
    },
    {
      agentId: 'op_ana_silva',
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com.br',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Analista de Suporte N2 - Sistemas & Cloud',
      specialties: ['Windows Server', 'Office 365', 'Active Directory', 'Sistemas ERP'],
      yearsExperience: 5,
      bioShort: 'Especialista em configuração de contas, e-mails corporativos, permissões e suporte a servidores.',
      csatRating: 4.8,
      totalResolved: 890,
      status: 'ONLINE',
      verifiedAgent: true,
      lastActive: timestamp,
    },
    {
      agentId: 'op_andre_carvalho',
      name: 'André Carvalho',
      email: 'andre.carvalho@empresa.com.br',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Analista de Suporte N1 - Triagem & Service Desk',
      specialties: ['Impressoras & Periféricos', 'Troca de Senhas', 'Rede Local (Wi-Fi/LAN)', 'Desktops & Notebooks'],
      yearsExperience: 3,
      bioShort: 'Atendimento rápido e focado em resolver os problemas do dia a dia do usuário no primeiro contato (FCR).',
      csatRating: 4.9,
      totalResolved: 620,
      status: 'ONLINE',
      verifiedAgent: true,
      lastActive: timestamp,
    },
  ];
}

/**
 * Obtém o perfil público de um atendente por ID
 */
export function getAgentPublicProfile(agentId: string): AgentPublicProfile {
  const profiles = getAgentProfiles();
  const found = profiles.find((p) => p.agentId === agentId);
  return found || profiles[0];
}

/**
 * Salva ou atualiza o perfil público de um atendente
 */
export async function saveAgentPublicProfile(profile: AgentPublicProfile): Promise<AgentPublicProfile> {
  const profiles = getAgentProfiles();
  const index = profiles.findIndex((p) => p.agentId === profile.agentId);

  profile.lastActive = new Date().toISOString();

  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.unshift(profile);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('[AgentProfile] Erro ao salvar perfil:', e);
  }

  await logCrudAudit('UPDATE', 'agent_public_profiles', profile.agentId, JSON.stringify({
    action: 'UPDATE_AGENT_PUBLIC_PROFILE',
    name: profile.name,
    jobTitle: profile.jobTitle,
    specialties: profile.specialties,
  }));

  return profile;
}
