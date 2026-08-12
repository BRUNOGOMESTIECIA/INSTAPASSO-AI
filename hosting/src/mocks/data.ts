// ─── Permissions ────────────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  'tickets.view','tickets.create','tickets.update','tickets.assign','tickets.close',
  'chat.view','chat.attend','chat.manage',
  'kb.view','kb.write','kb.publish',
  'catalog.view','catalog.manage',
  'reports.view',
  'automation.view','automation.manage',
  'webhooks.view','webhooks.manage',
  'admin.users','admin.roles','admin.sla','admin.settings',
];

export const TICKET_CATEGORIES = [
  'Hardware / Computadores', 'Hardware / Impressoras', 'Hardware / Configuração',
  'Software / Instalação', 'Software / Atualizações', 'Acesso / Permissões',
  'Redes / VPN', 'Redes / Wi-Fi', 'Infraestrutura / Servidores',
  'Aplicações / RH', 'E-mail / Mobile', 'Segurança', 'Sistemas / ERP', 'Outros',
];

// ─── Macros (Respostas Pré-Prontas) ───────────────────────────────────────
export const MOCK_MACROS = [
  { command: '/saudacao', text: 'Olá! Em que posso ajudar hoje?' },
  { command: '/pedir_print', text: 'Poderia nos enviar um print da tela com o erro, por favor?' },
  { command: '/encerrar_inatividade', text: 'Como não tivemos retorno, estarei encerrando o atendimento. Qualquer dúvida, nos chame novamente.' },
  { command: '/aguarde', text: 'Certo, estou verificando o seu caso. Aguarde um instante, por favor.' },
  { command: '/solucionado', text: 'Fico feliz em informar que o problema foi solucionado! Posso ajudar em algo mais?' }
];

// ─── Companies / Clients ─────────────────────────────────────────────────────────
export interface MockCompany {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  contractType: 'premium' | 'standard' | 'basic';
  slaServices: {
    serviceName: string;
    policies: { priority: string; response: number; resolution: number }[];
  }[];
  businessHours: { 
    timezone: string; 
    schedule: { day: string; active: boolean; start: string; end: string }[];
  };
  ssoDomains: string[];
  logoUrl?: string;
}

export const MOCK_COMPANIES: MockCompany[] = [
  { 
    id: 'comp1', slug: 'clienteabc', name: 'Cliente ABC Ltda', isActive: true, contractType: 'premium',
    slaServices: [
      {
        serviceName: 'Suporte Técnico',
        policies: [
          { priority: 'Baixa', response: 24, resolution: 72 },
          { priority: 'Média', response: 8, resolution: 24 },
          { priority: 'Alta', response: 2, resolution: 8 },
          { priority: 'Urgente', response: 1, resolution: 4 },
        ]
      },
      {
        serviceName: 'Infraestrutura',
        policies: [
          { priority: 'Baixa', response: 48, resolution: 144 },
          { priority: 'Média', response: 12, resolution: 48 },
          { priority: 'Alta', response: 4, resolution: 12 },
          { priority: 'Urgente', response: 1, resolution: 4 },
        ]
      }
    ],
    businessHours: { 
      timezone: 'America/Sao_Paulo', 
      schedule: [
        { day: 'Segunda-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Terça-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Quarta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Quinta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Sexta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Sábado', active: false, start: '09:00', end: '13:00' },
        { day: 'Domingo', active: false, start: '00:00', end: '00:00' },
      ]
    },
    ssoDomains: ['clienteabc.com.br']
  },
  { 
    id: 'comp2', slug: 'xyzcorp', name: 'XYZ Corp', isActive: true, contractType: 'standard',
    slaServices: [
      {
        serviceName: 'Suporte Técnico',
        policies: [
          { priority: 'Baixa', response: 48, resolution: 144 },
          { priority: 'Média', response: 12, resolution: 48 },
          { priority: 'Alta', response: 4, resolution: 16 },
          { priority: 'Urgente', response: 2, resolution: 8 },
        ]
      }
    ],
    businessHours: { 
      timezone: 'America/New_York', 
      schedule: [
        { day: 'Segunda-feira', active: true, start: '09:00', end: '17:00' },
        { day: 'Terça-feira', active: true, start: '09:00', end: '17:00' },
        { day: 'Quarta-feira', active: true, start: '09:00', end: '17:00' },
        { day: 'Quinta-feira', active: true, start: '09:00', end: '17:00' },
        { day: 'Sexta-feira', active: true, start: '09:00', end: '17:00' },
        { day: 'Sábado', active: false, start: '09:00', end: '12:00' },
        { day: 'Domingo', active: false, start: '00:00', end: '00:00' },
      ]
    },
    ssoDomains: ['xyzcorp.com', 'xyz.us']
  }
];

// ─── Users ────────────────────────────────────────────────────────────────────
// MOCK_TENANT_CONFIG simulates the global configuration fetched before rendering the app
export const MOCK_TENANT_CONFIG = {
  sso: {
    google: true,     // whether Google login is globally enabled
    microsoft: false, // whether Microsoft login is globally enabled
  }
};

export interface MockClient {
  id: string; type: 'client';
  email: string; password: string;
  name: string; company: string; companySlug: string;
  avatarUrl: string | null;
  ssoProvider: 'google' | 'microsoft' | 'local';
  isActive: boolean;
}

export interface MockStaff {
  id: string; type: 'staff';
  email: string; password: string;
  name: string; role: string; permissions: string[];
  avatarUrl: string | null;
  isActive: boolean;
}

export type MockUser = MockClient | MockStaff;

export const MOCK_CLIENTS: MockClient[] = [
  { id: 'c1', type: 'client', email: 'joao.silva@clienteabc.com.br', password: '123456', name: 'João Silva', company: 'Cliente ABC Ltda', companySlug: 'clienteabc', avatarUrl: null, ssoProvider: 'google', isActive: true },
  { id: 'c2', type: 'client', email: 'maria.santos@clienteabc.com.br', password: '123456', name: 'Maria Santos', company: 'Cliente ABC Ltda', companySlug: 'clienteabc', avatarUrl: null, ssoProvider: 'microsoft', isActive: true },
  { id: 'c3', type: 'client', email: 'pedro.alves@xyzcorp.com', password: '123456', name: 'Pedro Alves', company: 'XYZ Corp', companySlug: 'xyzcorp', avatarUrl: null, ssoProvider: 'local', isActive: false },
  { id: 'c4', type: 'client', email: 'andre.carvalho@empresa.com', password: '123456', name: 'André Carvalho', company: 'Empresa Demo', companySlug: 'empresademo', avatarUrl: null, ssoProvider: 'local', isActive: true },
  { id: 'c5', type: 'client', email: 'juliana.ferreira@empresa.com', password: '123456', name: 'Juliana Ferreira', company: 'Empresa Demo', companySlug: 'empresademo', avatarUrl: null, ssoProvider: 'local', isActive: true },
  { id: 'c6', type: 'client', email: 'mariana.ribeiro@empresa.com', password: '123456', name: 'Mariana Ribeiro', company: 'Empresa Demo', companySlug: 'empresademo', avatarUrl: null, ssoProvider: 'local', isActive: true },
  { id: 'c7', type: 'client', email: 'paulo.silva@empresa.com', password: '123456', name: 'Paulo Silva', company: 'Empresa Demo', companySlug: 'empresademo', avatarUrl: null, ssoProvider: 'local', isActive: true },
  { id: 'c8', type: 'client', email: 'rafael.costa@empresa.com', password: '123456', name: 'Rafael Costa', company: 'Empresa Demo', companySlug: 'empresademo', avatarUrl: null, ssoProvider: 'local', isActive: true },
];

export const MOCK_STAFF: MockStaff[] = [
  { id: 's1', type: 'staff', email: 'admin@demo.com', password: 'admin1234', name: 'Admin Sistema', role: 'Administrator', permissions: ALL_PERMISSIONS, avatarUrl: null, isActive: true },
  { id: 's2', type: 'staff', email: 'tecnico@demo.com', password: '123456', name: 'Carlos Técnico', role: 'Technician', permissions: ['tickets.view','tickets.create','tickets.update','tickets.assign','tickets.close','chat.view','chat.attend','kb.view','reports.view'], avatarUrl: null, isActive: true },
  { id: 's3', type: 'staff', email: 'agente@demo.com', password: '123456', name: 'Ana Agente', role: 'Support Agent', permissions: ['tickets.view','tickets.create','tickets.update','chat.view','chat.attend','kb.view'], avatarUrl: null, isActive: true },
  { id: 's4', type: 'staff', email: 'bruno@demo.com', password: '123456', name: 'Bruno Santos', role: 'Support Agent', permissions: ['tickets.view','tickets.create','tickets.update','chat.view','chat.attend','kb.view'], avatarUrl: null, isActive: true },
];

export const ALL_MOCK_USERS: MockUser[] = [...MOCK_CLIENTS, ...MOCK_STAFF];

// ─── Tickets ─────────────────────────────────────────────────────────────────
export type TicketStatus = 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MockTicket {
  id: string; number: number;
  title: string; description: string;
  status: TicketStatus; priority: TicketPriority;
  type: string; category: string;
  requesterId: string; requesterName: string; requesterEmail: string;
  assigneeName: string | null; team: string | null;
  slaFirstResponseDue: string; slaResolutionDue: string;
  slaFirstResponseMet: boolean | null; slaResolutionMet: boolean | null;
  source: 'portal' | 'email' | 'chat' | 'api' | 'technician';
  createdAt: string; updatedAt: string; closedAt: string | null;
  tags: string[];
  comments: MockComment[];
  parentTicketId?: string;
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
}

export interface MockComment {
  id: string; authorName: string; authorType: 'user' | 'staff';
  body: string; isInternal: boolean; createdAt: string;
}

export const MOCK_TICKETS: MockTicket[] = [
  {
    id: 't1', number: 1042,
    title: 'VPN não conecta desde a atualização do Windows',
    description: 'Após a atualização automática do Windows 11 realizada ontem à noite, a VPN corporativa parou de funcionar. Erro: "Falha na autenticação". Tentei reinstalar o cliente VPN mas o problema persiste.',
    status: 'in_progress', priority: 'high', type: 'Incidente', category: 'Redes / VPN',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: 'Carlos Técnico', team: 'Suporte N2',
    slaFirstResponseDue: '2026-05-28T09:00:00Z', slaResolutionDue: '2026-05-28T17:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-28T08:15:00Z', updatedAt: '2026-05-28T09:30:00Z', closedAt: null,
    tags: ['vpn', 'windows'],
    comments: [
      { id: 'cm1', authorName: 'Carlos Técnico', authorType: 'staff', body: 'Analisando o problema. Solicito que você execute o comando `ipconfig /flushdns` e tente novamente.', isInternal: false, createdAt: '2026-05-28T09:30:00Z' },
      { id: 'cm2', authorName: 'Carlos Técnico', authorType: 'staff', body: 'Provável causa: atualização KB5034441 afeta o cliente Cisco AnyConnect. Aguardando patch.', isInternal: true, createdAt: '2026-05-28T09:45:00Z' },
    ],
  },
  {
    id: 't2', number: 1041,
    title: 'Acesso ao ERP para novo colaborador',
    description: 'Preciso de acesso ao módulo financeiro do ERP para o novo analista contratado. Nome: Rafael Mendes, Matrícula: 2847.',
    status: 'pending', priority: 'medium', type: 'Solicitação', category: 'Acesso / Permissões',
    requesterId: 'c2', requesterName: 'Maria Santos', requesterEmail: 'maria.santos@clienteabc.com.br',
    assigneeName: 'Ana Agente', team: 'Suporte N1',
    slaFirstResponseDue: '2026-05-28T14:00:00Z', slaResolutionDue: '2026-05-29T14:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-28T07:45:00Z', updatedAt: '2026-05-28T10:00:00Z', closedAt: null,
    tags: ['erp', 'acesso'],
    comments: [
      { id: 'cm3', authorName: 'Ana Agente', authorType: 'staff', body: 'Encaminhado para aprovação do gestor de TI. Aguardando liberação.', isInternal: false, createdAt: '2026-05-28T10:00:00Z' },
    ],
  },
  {
    id: 't3', number: 1040,
    title: 'Impressora do setor financeiro offline',
    description: 'A impressora HP LaserJet M404dn do setor financeiro aparece como offline desde esta manhã. Já reiniciei o equipamento mas o problema persiste.',
    status: 'open', priority: 'medium', type: 'Incidente', category: 'Hardware / Impressoras',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: null, team: null,
    slaFirstResponseDue: '2026-05-28T13:00:00Z', slaResolutionDue: '2026-05-29T08:00:00Z',
    slaFirstResponseMet: false, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-28T08:50:00Z', updatedAt: '2026-05-28T08:50:00Z', closedAt: null,
    tags: ['impressora', 'hardware'],
    comments: [],
  },
  {
    id: 't4', number: 1039,
    title: 'Servidor de arquivos inacessível — URGENTE',
    description: 'O servidor de arquivos compartilhados do departamento comercial ficou inacessível. Toda a equipe está sem acesso. Impacto crítico nos processos de vendas.',
    status: 'open', priority: 'critical', type: 'Incidente', category: 'Infraestrutura / Servidores',
    requesterId: 'c3', requesterName: 'Pedro Alves', requesterEmail: 'pedro.alves@xyzcorp.com',
    assigneeName: 'Carlos Técnico', team: 'Infraestrutura',
    slaFirstResponseDue: '2026-05-28T08:30:00Z', slaResolutionDue: '2026-05-28T12:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-28T07:00:00Z', updatedAt: '2026-05-28T09:00:00Z', closedAt: null,
    tags: ['servidor', 'crítico'],
    comments: [
      { id: 'cm4', authorName: 'Carlos Técnico', authorType: 'staff', body: 'Identificado problema no serviço SMB. Reiniciando o serviço no servidor primário.', isInternal: false, createdAt: '2026-05-28T08:30:00Z' },
    ],
  },
  {
    id: 't5', number: 1038,
    title: 'Atualização do Adobe Reader em todos os notebooks',
    description: 'Solicitação de atualização em massa do Adobe Reader para a versão mais recente em todos os notebooks do departamento jurídico (32 máquinas).',
    status: 'resolved', priority: 'low', type: 'Solicitação', category: 'Software / Atualizações',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: 'Ana Agente', team: 'Suporte N1',
    slaFirstResponseDue: '2026-05-27T14:00:00Z', slaResolutionDue: '2026-05-28T14:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: true,
    source: 'portal', createdAt: '2026-05-27T10:00:00Z', updatedAt: '2026-05-27T16:30:00Z', closedAt: '2026-05-27T16:30:00Z',
    tags: ['adobe', 'atualização'],
    comments: [
      { id: 'cm5', authorName: 'Ana Agente', authorType: 'staff', body: 'Atualização concluída em todas as 32 máquinas via SCCM. Versão instalada: 24.1.', isInternal: false, createdAt: '2026-05-27T16:30:00Z' },
    ],
    rating: 5,
    ratingComment: 'Atendimento excelente e resolução super rápida!',
    ratedAt: '2026-07-28T14:20:00Z'
  },
  {
    id: 't6', number: 1037,
    title: 'E-mail corporativo não sincroniza no celular',
    description: 'O e-mail corporativo no Outlook parou de sincronizar no celular iPhone 15 Pro. Já removi e adicionei a conta novamente.',
    status: 'closed', priority: 'medium', type: 'Incidente', category: 'E-mail / Mobile',
    requesterId: 'c3', requesterName: 'Pedro Alves', requesterEmail: 'pedro.alves@xyzcorp.com',
    assigneeName: 'Ana Agente', team: 'Suporte N1',
    slaFirstResponseDue: '2026-05-27T09:00:00Z', slaResolutionDue: '2026-05-27T17:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: true,
    source: 'portal', createdAt: '2026-05-27T07:30:00Z', updatedAt: '2026-05-27T14:00:00Z', closedAt: '2026-05-27T14:00:00Z',
    tags: ['email', 'mobile'],
    comments: [
      { id: 'cm6', authorName: 'Ana Agente', authorType: 'staff', body: 'Resolvido. Era necessário reconfigurar o perfil Exchange com as novas configurações do servidor.', isInternal: false, createdAt: '2026-05-27T14:00:00Z' },
    ],
    rating: 5,
    ratingComment: 'Analista muito atencioso, resolveu a sincronização de primeira.',
    ratedAt: '2026-07-27T16:10:00Z'
  },
  {
    id: 't7', number: 1036,
    title: 'Lentidão no sistema de ponto eletrônico',
    description: 'O sistema de ponto eletrônico está muito lento desde a semana passada. O registro demora mais de 2 minutos para processar.',
    status: 'in_progress', priority: 'high', type: 'Incidente', category: 'Aplicações / RH',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: 'Carlos Técnico', team: 'Suporte N2',
    slaFirstResponseDue: '2026-05-26T14:00:00Z', slaResolutionDue: '2026-05-27T14:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: false,
    source: 'chat', createdAt: '2026-05-26T11:00:00Z', updatedAt: '2026-05-28T08:00:00Z', closedAt: null,
    tags: ['ponto', 'lentidão'],
    comments: [],
  },
  {
    id: 't8', number: 1035,
    title: 'Configuração de segundo monitor para diretoria',
    description: 'Solicito configuração de segundo monitor para 5 estações da diretoria. Monitores já adquiridos e no almoxarifado.',
    status: 'new', priority: 'low', type: 'Solicitação', category: 'Hardware / Configuração',
    requesterId: 'c2', requesterName: 'Maria Santos', requesterEmail: 'maria.santos@clienteabc.com.br',
    assigneeName: null, team: null,
    slaFirstResponseDue: '2026-05-29T09:00:00Z', slaResolutionDue: '2026-05-30T17:00:00Z',
    slaFirstResponseMet: null, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-28T11:00:00Z', updatedAt: '2026-05-28T11:00:00Z', closedAt: null,
    tags: ['monitor', 'hardware'],
    comments: [],
  },

  // ── Pendente aguardando resposta do cliente (c1) ────────────────────────────
  {
    id: 'tp1', number: 1046,
    title: 'Notebook não reconhece a rede Wi-Fi corporativa',
    description: 'Meu notebook parou de encontrar a rede Wi-Fi corporativa após retornar de viagem. Outros dispositivos conectam normalmente.',
    status: 'pending', priority: 'medium', type: 'Incidente', category: 'Redes / Wi-Fi',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: 'Ana Agente', team: 'Suporte N1',
    slaFirstResponseDue: '2026-05-29T10:00:00Z', slaResolutionDue: '2026-05-30T10:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'portal', createdAt: '2026-05-29T08:00:00Z', updatedAt: '2026-05-29T09:15:00Z', closedAt: null,
    tags: ['wifi', 'notebook'],
    comments: [
      { id: 'cmp1', authorName: 'Ana Agente', authorType: 'staff', body: 'Olá João! Para dar continuidade à análise, preciso que você me informe:\n\n1. Qual versão do Windows está instalada? (Configurações → Sistema → Sobre)\n2. O adaptador Wi-Fi aparece no Gerenciador de Dispositivos sem erros?\n3. Consegue ver outras redes Wi-Fi disponíveis, ou o adaptador não detecta nenhuma rede?\n\nAguardo seu retorno!', isInternal: false, createdAt: '2026-05-29T09:15:00Z' },
    ],
  },

  // ── Filho de t4 (Servidor de arquivos) ──────────────────────────────────────
  {
    id: 't9', number: 1043,
    title: 'Diagnóstico de conectividade SMB — servidor primário',
    description: 'Sub-chamado aberto para análise detalhada do serviço SMB no servidor primário. Inclui verificação dos logs de eventos, estado dos compartilhamentos e autenticação Kerberos.',
    status: 'in_progress', priority: 'high', type: 'Incidente', category: 'Infraestrutura / Servidores',
    requesterId: 'c2', requesterName: 'Maria Santos', requesterEmail: 'maria.santos@clienteabc.com.br',
    assigneeName: 'Carlos Técnico', team: 'Infraestrutura',
    slaFirstResponseDue: '2026-05-28T08:00:00Z', slaResolutionDue: '2026-05-28T14:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'technician', createdAt: '2026-05-28T07:30:00Z', updatedAt: '2026-05-28T09:00:00Z', closedAt: null,
    tags: ['smb', 'servidor'],
    parentTicketId: 't4',
    comments: [
      { id: 'cm7', authorName: 'Carlos Técnico', authorType: 'staff', body: 'Identificado erro no serviço LanmanServer. Reiniciando e monitorando.', isInternal: false, createdAt: '2026-05-28T09:00:00Z' },
    ],
  },

  // ── Filho de t4 (segundo filho) ──────────────────────────────────────────────
  {
    id: 't10', number: 1044,
    title: 'Verificação de integridade do volume de dados',
    description: 'Análise do filesystem no volume onde estão os compartilhamentos de rede. Execução de CHKDSK e avaliação de setores defeituosos.',
    status: 'open', priority: 'medium', type: 'Incidente', category: 'Infraestrutura / Servidores',
    requesterId: 'c2', requesterName: 'Maria Santos', requesterEmail: 'maria.santos@clienteabc.com.br',
    assigneeName: 'Carlos Técnico', team: 'Infraestrutura',
    slaFirstResponseDue: '2026-05-28T10:00:00Z', slaResolutionDue: '2026-05-28T18:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'technician', createdAt: '2026-05-28T08:00:00Z', updatedAt: '2026-05-28T08:00:00Z', closedAt: null,
    tags: ['disco', 'filesystem'],
    parentTicketId: 't4',
    comments: [],
  },

  // ── Neto de t4 (filho de t9) ─────────────────────────────────────────────────
  {
    id: 't11', number: 1045,
    title: 'Validação de acesso pós-correção — equipe comercial',
    description: 'Após reinício do serviço SMB, confirmar que todos os usuários do comercial conseguem acessar as unidades mapeadas. Teste com ao menos 10 usuários representativos.',
    status: 'new', priority: 'medium', type: 'Incidente', category: 'Infraestrutura / Servidores',
    requesterId: 'c2', requesterName: 'Maria Santos', requesterEmail: 'maria.santos@clienteabc.com.br',
    assigneeName: null, team: null,
    slaFirstResponseDue: '2026-05-28T12:00:00Z', slaResolutionDue: '2026-05-28T20:00:00Z',
    slaFirstResponseMet: null, slaResolutionMet: null,
    source: 'technician', createdAt: '2026-05-28T09:00:00Z', updatedAt: '2026-05-28T09:00:00Z', closedAt: null,
    tags: ['validação', 'acesso'],
    parentTicketId: 't9',
    comments: [],
  },

  // ── Filho de t1 (VPN) ────────────────────────────────────────────────────────
  {
    id: 't12', number: 1046,
    title: 'Reinstalação do Cisco AnyConnect — filial São Paulo',
    description: 'Reinstalação e reconfiguração do cliente VPN Cisco AnyConnect nos 3 notebooks da filial SP afetados pela atualização KB5034441 do Windows 11.',
    status: 'open', priority: 'medium', type: 'Incidente', category: 'Redes / VPN',
    requesterId: 'c1', requesterName: 'João Silva', requesterEmail: 'joao.silva@clienteabc.com.br',
    assigneeName: 'Carlos Técnico', team: 'Suporte N2',
    slaFirstResponseDue: '2026-05-28T12:00:00Z', slaResolutionDue: '2026-05-28T20:00:00Z',
    slaFirstResponseMet: true, slaResolutionMet: null,
    source: 'technician', createdAt: '2026-05-28T10:00:00Z', updatedAt: '2026-05-28T10:30:00Z', closedAt: null,
    tags: ['vpn', 'anyconnect', 'filial'],
    parentTicketId: 't1',
    comments: [
      { id: 'cm8', authorName: 'Carlos Técnico', authorType: 'staff', body: 'Iniciando reinstalação no primeiro notebook. Procedimento: desinstalar KB5034441 → reinstalar AnyConnect 4.10.', isInternal: false, createdAt: '2026-05-28T10:30:00Z' },
    ],
  },
];

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface MockChatMessage {
  id: string; body: string;
  senderName: string; senderType: 'user' | 'agent' | 'ai' | 'system' | 'internal';
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
  replies?: MockChatMessage[];
  replyTo?: {
    id: string;
    senderName: string;
    body: string;
  };
}

export interface MockChatSession {
  id: string; clientName: string; clientEmail: string;
  status: 'waiting' | 'active' | 'finished' | 'closed';
  agentName: string | null; queue: string;
  waitingMinutes: number | null;
  messages: MockChatMessage[];
  createdAt: string;
  ticketId?: string;
  pendingTransferTo?: string;
  pendingTransferFrom?: string;
  rating?: number;
  ratingComment?: string;
}

export const MOCK_CHAT_SESSIONS: MockChatSession[] = [
  {
    id: 'ch_andre', clientName: 'André Carvalho', clientEmail: 'andre.carvalho@empresa.com',
    status: 'active', agentName: 'Bruno Santos', queue: 'Chat ao vivo', waitingMinutes: null,
    ticketId: '54821',
    messages: [
      { id: 'm_andre_1', body: 'Bom dia! Não estou conseguindo acessar o sistema ERP desde ontem. Aparece a mensagem de erro abaixo.', senderName: 'André Carvalho', senderType: 'user', createdAt: '2026-05-24T09:14:00Z' },
      { id: 'm_andre_2', body: 'Olá André! Bom dia! Pode tentar redefinir sua senha e tentar novamente? Se persistir, me avise que vou verificar aqui.', senderName: 'Bruno Santos', senderType: 'agent', createdAt: '2026-05-24T09:15:00Z' },
      { id: 'm_andre_3', body: 'Redefini aqui e funcionou! Obrigado!', senderName: 'André Carvalho', senderType: 'user', createdAt: '2026-05-24T09:16:00Z' },
      { id: 'm_andre_4', body: 'Perfeito! Qualquer coisa, estou à disposição. 😊', senderName: 'Bruno Santos', senderType: 'agent', createdAt: '2026-05-24T09:17:00Z' },
    ],
    createdAt: '2026-05-24T09:14:00Z',
  },
  {
    id: 'ch_juliana', clientName: 'Juliana Ferreira', clientEmail: 'juliana.ferreira@empresa.com',
    status: 'waiting', agentName: null, queue: 'Chat ao vivo', waitingMinutes: 10,
    ticketId: '54822',
    messages: [
      { id: 'm_juliana_1', body: 'Erro ao enviar arquivo', senderName: 'Juliana Ferreira', senderType: 'user', createdAt: '2026-05-24T10:11:00Z' },
    ],
    createdAt: '2026-05-24T10:11:00Z',
  },
  {
    id: 'ch_mariana', clientName: 'Mariana Ribeiro', clientEmail: 'mariana.ribeiro@empresa.com',
    status: 'waiting', agentName: null, queue: 'Chat ao vivo', waitingMinutes: 5,
    ticketId: '54823',
    messages: [
      { id: 'm_mariana_1', body: 'Impressora não está funcionando', senderName: 'Mariana Ribeiro', senderType: 'user', createdAt: '2026-05-24T05:32:00Z' },
    ],
    createdAt: '2026-05-24T05:32:00Z',
  },
  {
    id: 'ch_paulo', clientName: 'Paulo Silva', clientEmail: 'paulo.silva@empresa.com',
    status: 'waiting', agentName: null, queue: 'Chat ao vivo', waitingMinutes: 11,
    ticketId: '54824',
    messages: [
      { id: 'm_paulo_1', body: 'Dúvida sobre VPN', senderName: 'Paulo Silva', senderType: 'user', createdAt: '2026-05-24T11:45:00Z' },
    ],
    createdAt: '2026-05-24T11:45:00Z',
  },
  {
    id: 'ch_rafael', clientName: 'Rafael Costa', clientEmail: 'rafael.costa@empresa.com',
    status: 'waiting', agentName: null, queue: 'Chat ao vivo', waitingMinutes: 12,
    ticketId: '54825',
    messages: [
      { id: 'm_rafael_1', body: 'Instalar software', senderName: 'Rafael Costa', senderType: 'user', createdAt: '2026-05-24T12:08:00Z' },
    ],
    createdAt: '2026-05-24T12:08:00Z',
  },
];

// ─── Knowledge Base ───────────────────────────────────────────────────────────
export interface MockKbArticle {
  id: string; title: string; slug: string;
  category: string; excerpt: string; content: string;
  status: 'published' | 'draft' | 'pending_review';
  views: number; helpfulVotes: number;
  author: string; publishedAt: string | null; updatedAt: string;
}

export const MOCK_KB_ARTICLES: MockKbArticle[] = [
  { id: 'kb1', title: 'Como configurar a VPN corporativa no Windows 11', slug: 'vpn-windows-11', category: 'Redes', excerpt: 'Passo a passo para instalar e configurar o cliente VPN em computadores com Windows 11.', content: '## Pré-requisitos\n\nAntes de iniciar, certifique-se de ter as credenciais de acesso.\n\n## Instalação\n\n1. Acesse o Portal de TI\n2. Baixe o instalador do cliente VPN\n3. Execute como Administrador', status: 'published', views: 342, helpfulVotes: 89, author: 'Carlos Técnico', publishedAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-20T10:00:00Z' },
  { id: 'kb2', title: 'Redefinição de senha do Active Directory', slug: 'redefinir-senha-ad', category: 'Segurança', excerpt: 'Como solicitar ou redefinir sua senha do domínio corporativo de forma segura.', content: '## Esqueceu a senha?\n\nAcesse o portal de autoatendimento em senha.empresa.com.br\n\n## Pelo técnico\n\nAbra um chamado na categoria Acesso / Segurança.', status: 'published', views: 521, helpfulVotes: 143, author: 'Admin Sistema', publishedAt: '2026-05-15T14:00:00Z', updatedAt: '2026-05-15T14:00:00Z' },
  { id: 'kb3', title: 'Solicitação de licenças de software', slug: 'solicitar-licencas', category: 'Software', excerpt: 'Processo para solicitar novas licenças de software ou expansão de licenças existentes.', content: '## Como solicitar\n\n1. Acesse o Catálogo de Serviços\n2. Selecione "Software e Licenças"\n3. Preencha o formulário com as informações do software desejado', status: 'published', views: 189, helpfulVotes: 67, author: 'Admin Sistema', publishedAt: '2026-05-18T09:00:00Z', updatedAt: '2026-05-18T09:00:00Z' },
  { id: 'kb4', title: 'Configuração do e-mail corporativo no Outlook Mobile', slug: 'email-outlook-mobile', category: 'E-mail', excerpt: 'Configure seu e-mail corporativo no Outlook para Android e iOS.', content: '## Android\n\n1. Instale o Outlook da Play Store\n2. Adicione conta Exchange\n3. Informe: servidor mail.empresa.com.br, porta 443\n\n## iOS\n\n1. Instale o Outlook da App Store\n2. Siga as mesmas configurações', status: 'published', views: 267, helpfulVotes: 98, author: 'Ana Agente', publishedAt: '2026-05-22T11:00:00Z', updatedAt: '2026-05-22T11:00:00Z' },
  { id: 'kb5', title: 'Como instalar impressora de rede', slug: 'instalar-impressora-rede', category: 'Hardware', excerpt: 'Guia para adicionar uma impressora de rede ao seu computador Windows ou Mac.', content: '## Windows\n\n1. Abra Configurações > Bluetooth e dispositivos > Impressoras\n2. Clique em "Adicionar impressora"\n3. Selecione "A impressora que desejo não está na lista"\n4. Informe o IP da impressora', status: 'published', views: 156, helpfulVotes: 54, author: 'Carlos Técnico', publishedAt: '2026-05-10T08:00:00Z', updatedAt: '2026-05-10T08:00:00Z' },
  { id: 'kb6', title: 'Política de backup de dados corporativos', slug: 'politica-backup', category: 'Segurança', excerpt: 'Como funciona o backup automático e o que você precisa saber para proteger seus dados.', content: '## Backup automático\n\nTodos os arquivos salvos no servidor de arquivos são copiados automaticamente...', status: 'draft', views: 0, helpfulVotes: 0, author: 'Admin Sistema', publishedAt: null, updatedAt: '2026-05-28T09:00:00Z' },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export interface MockNotification {
  id: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'chat_message' | 'sla_breach' | 'mention' | 'system';
  title: string; body: string;
  read: boolean; createdAt: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'n1', type: 'sla_breach', title: 'SLA em risco', body: 'Chamado #1039 — Servidor de arquivos próximo do prazo de resolução.', read: false, createdAt: '2026-05-28T10:00:00Z' },
  { id: 'n2', type: 'ticket_assigned', title: 'Chamado atribuído', body: 'Chamado #1040 — Impressora do setor financeiro foi atribuído a você.', read: false, createdAt: '2026-05-28T09:45:00Z' },
  { id: 'n3', type: 'chat_message', title: 'Nova conversa na fila', body: 'Pedro Alves aguardando na fila Suporte Geral há 4 min.', read: true, createdAt: '2026-05-28T09:30:00Z' },
  { id: 'n4', type: 'ticket_updated', title: 'Chamado atualizado', body: 'Chamado #1042 — João Silva adicionou um comentário.', read: true, createdAt: '2026-05-28T09:00:00Z' },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  openTickets: 18,
  criticalTickets: 2,
  chatsInQueue: 2,
  slaCompliance: 87,
  slaFirstResponse: 94,
  avgResolutionHours: 4.2,
  avgFirstResponseMinutes: 15,
  csat: 9.4,
  csatReviews: 142,
  ticketsByStatus: [
    { label: 'Novo', count: 5, color: '#6366f1' },
    { label: 'Aberto', count: 7, color: '#3b82f6' },
    { label: 'Em andamento', count: 6, color: '#f59e0b' },
    { label: 'Pendente', count: 4, color: '#8b5cf6' },
    { label: 'Resolvido', count: 12, color: '#22c55e' },
    { label: 'Fechado', count: 28, color: '#6b7280' },
  ],
  ticketsByPriority: [
    { label: 'Crítico', count: 2, color: '#ef4444' },
    { label: 'Alto', count: 5, color: '#f97316' },
    { label: 'Médio', count: 9, color: '#f59e0b' },
    { label: 'Baixo', count: 2, color: '#6b7280' },
  ],
  recentActivity: [
    { text: 'João Silva abriu chamado #1042', time: '08:15' },
    { text: 'Carlos Técnico assumiu chamado #1039', time: '08:30' },
    { text: 'Pedro Alves entrou na fila de chat', time: '09:10' },
    { text: 'SLA do chamado #1039 próximo do vencimento', time: '10:00' },
  ],
  trendData: [
    { date: '01/Mai', novos: 12, resolvidos: 10 },
    { date: '05/Mai', novos: 15, resolvidos: 13 },
    { date: '10/Mai', novos: 18, resolvidos: 16 },
    { date: '15/Mai', novos: 22, resolvidos: 20 },
    { date: '20/Mai', novos: 14, resolvidos: 18 },
    { date: '25/Mai', novos: 28, resolvidos: 22 },
    { date: '28/Mai', novos: 10, resolvidos: 15 },
  ],
  ticketsBySource: [
    { name: 'Portal', value: 45, color: '#3b82f6' },
    { name: 'E-mail', value: 25, color: '#f59e0b' },
    { name: 'Chat', value: 30, color: '#10b981' },
  ],
  topOffenders: [
    { name: 'Redefinição de Senha', count: 18 },
    { name: 'Lentidão no Sistema', count: 14 },
    { name: 'Dúvidas Financeiro', count: 12 },
    { name: 'Configuração de VPN', count: 9 },
  ]
};

// ─── Internal Chat ────────────────────────────────────────────────────────────
export const MOCK_CHANNELS = [
  { id: 'ic1', name: 'Geral', type: 'general', unread: 2, lastMessage: 'Carlos: Pessoal, servidor voltou.' },
  { id: 'ic2', name: 'Suporte N1', type: 'team', unread: 0, lastMessage: 'Ana: Chamados em dia.' },
  { id: 'ic3', name: 'Infraestrutura', type: 'team', unread: 5, lastMessage: 'Carlos: Verificando logs do backup.' },
  { id: 'ic4', name: 'Avisos TI', type: 'general', unread: 1, lastMessage: 'Admin: Manutenção amanhã às 22h.' },
  { id: 'ic5', name: 'Suporte N2', type: 'team', unread: 3, lastMessage: 'Rafael: Chamado escalado com sucesso.' },
  { id: 'ic6', name: 'Suporte N3', type: 'team', unread: 0, lastMessage: 'Mariana: Análise de root cause concluída.' },
  { id: 'ic7', name: 'SOC', type: 'team', unread: 7, lastMessage: 'SOC: Alerta crítico — tentativa de acesso não autorizado.' },
  { id: 'ic8', name: 'Logística', type: 'team', unread: 2, lastMessage: 'Paulo: Equipamento despachado para filial SP.' },
];

export const MOCK_INTERNAL_MESSAGES: Record<string, MockChatMessage[]> = {
  ic1: [
    { 
      id: 'im1', body: '@Shibe Cyranka @Raphael Lasmar Conseguem liberar o uso do anydesk para um pc no gram ?', 
      senderName: 'Oliveira F', senderType: 'agent', createdAt: '2026-05-28T14:46:00Z',
      reactions: [{ emoji: '👍', count: 2, userReacted: false }],
      replies: [
        { id: 'im1_r1', body: 'Estou verificando com a equipe de segurança.', senderName: 'Shibe Cyranka', senderType: 'agent', createdAt: '2026-05-28T14:50:00Z' },
        { id: 'im1_r2', body: 'Aprovado temporariamente.', senderName: 'Raphael Lasmar', senderType: 'agent', createdAt: '2026-05-28T14:54:00Z' }
      ]
    },
    { id: 'im2', body: 'Servidor de arquivos voltou. Já comunicado ao cliente.', senderName: 'Carlos Técnico', senderType: 'agent', createdAt: '2026-05-28T15:05:00Z', isEdited: true },
    { id: 'im3', body: 'Mensagem apagada', senderName: 'Ana Agente', senderType: 'agent', createdAt: '2026-05-28T15:06:00Z', isDeleted: true },
  ],
  ic3: [
    { id: 'im4', body: 'Verificando logs do servidor de backup.', senderName: 'Carlos Técnico', senderType: 'agent', createdAt: '2026-05-28T08:45:00Z' },
    { id: 'im5', body: 'Job falhou por falta de espaço em disco. Liberando agora.', senderName: 'Carlos Técnico', senderType: 'agent', createdAt: '2026-05-28T09:00:00Z' },
  ],
  ic5: [
    { id: 'n2_1', body: 'Pessoal, recebi um chamado escalado do N1. Cliente com erro persistente no acesso ao ERP após redefinição de senha.', senderName: 'Rafael Costa', senderType: 'agent', createdAt: '2026-05-28T10:00:00Z' },
    { id: 'n2_2', body: 'Já peguei o chamado. Vou verificar as permissões no AD e no banco.', senderName: 'Mariana Ribeiro', senderType: 'agent', createdAt: '2026-05-28T10:05:00Z', reactions: [{ emoji: '👍', count: 2, userReacted: false }] },
    { id: 'n2_3', body: 'Confirmado: problema de permissão no grupo de acesso do ERP. Corrigindo agora.', senderName: 'Rafael Costa', senderType: 'agent', createdAt: '2026-05-28T10:20:00Z' },
    { id: 'n2_4', body: 'Chamado escalado com sucesso. Cliente testou e confirmou acesso. ✅', senderName: 'Rafael Costa', senderType: 'agent', createdAt: '2026-05-28T10:45:00Z' },
  ],
  ic6: [
    { id: 'n3_1', body: 'Recebemos escalonamento do N2. Problema crítico de performance no banco de dados de produção.', senderName: 'Ana Agente', senderType: 'agent', createdAt: '2026-05-27T14:00:00Z' },
    { id: 'n3_2', body: 'Iniciando análise de root cause. Query com full table scan identificada.', senderName: 'Carlos Técnico', senderType: 'agent', createdAt: '2026-05-27T14:30:00Z' },
    { id: 'n3_3', body: 'Índice criado. Performance normalizada. Aguardando validação do cliente.', senderName: 'Carlos Técnico', senderType: 'agent', createdAt: '2026-05-27T16:00:00Z', reactions: [{ emoji: '✅', count: 3, userReacted: false }] },
    { id: 'n3_4', body: 'Análise de root cause concluída e documentada. Plano de melhoria encaminhado para o gestor.', senderName: 'Mariana Ribeiro', senderType: 'agent', createdAt: '2026-05-28T09:00:00Z' },
  ],
  ic7: [
    { id: 'soc_1', body: '🔴 ALERTA CRÍTICO: Detectadas 47 tentativas de login com força bruta no servidor de e-mail entre 03h00 e 04h00.', senderName: 'SOC Monitor', senderType: 'agent', createdAt: '2026-05-28T04:05:00Z', reactions: [{ emoji: '😮', count: 4, userReacted: false }] },
    { id: 'soc_2', body: 'IP bloqueado no firewall. Regra aplicada: DENY from 185.220.101.x/24. Investigando origem.', senderName: 'Rafael Costa', senderType: 'agent', createdAt: '2026-05-28T04:15:00Z' },
    { id: 'soc_3', body: 'Origem identificada: nó de saída do Tor. Relatório de incidente aberto. Ref: INC-2026-0528.', senderName: 'Ana Agente', senderType: 'agent', createdAt: '2026-05-28T04:40:00Z' },
    { id: 'soc_4', body: 'Recomendação: habilitar MFA obrigatório para todos os acessos externos. Aguardando aprovação da gestão.', senderName: 'SOC Monitor', senderType: 'agent', createdAt: '2026-05-28T08:00:00Z', reactions: [{ emoji: '👍', count: 5, userReacted: true }] },
    { id: 'soc_5', body: '⚠️ Alerta crítico — nova tentativa de acesso não autorizado detectada via VPN. Monitoramento ativo.', senderName: 'SOC Monitor', senderType: 'agent', createdAt: '2026-05-28T11:30:00Z' },
  ],
  ic8: [
    { id: 'log_1', body: 'Pessoal, chegou solicitação de envio de notebook para a filial de Campinas. Alguém pode preparar o equipamento?', senderName: 'Paulo Silva', senderType: 'agent', createdAt: '2026-05-28T08:00:00Z' },
    { id: 'log_2', body: 'Equipamento separado e inventariado. Aguardando geração da NF de transferência.', senderName: 'Ana Agente', senderType: 'agent', createdAt: '2026-05-28T08:30:00Z', reactions: [{ emoji: '👍', count: 1, userReacted: false }] },
    { id: 'log_3', body: 'NF gerada. Número: 002345. Transportadora: Jadlog. Código de rastreio: JL9982310BR.', senderName: 'Paulo Silva', senderType: 'agent', createdAt: '2026-05-28T09:15:00Z' },
    { id: 'log_4', body: 'Equipamento despachado para filial SP. Previsão de entrega: 29/05. 🚚', senderName: 'Paulo Silva', senderType: 'agent', createdAt: '2026-05-28T10:00:00Z', reactions: [{ emoji: '✅', count: 2, userReacted: false }] },
    { id: 'log_5', body: 'Atualização: equipamento entregue e assinado na filial. Patrimônio atualizado no sistema.', senderName: 'Ana Agente', senderType: 'agent', createdAt: '2026-05-29T14:30:00Z' },
  ],
};

// ─── Service Catalog ─────────────────────────────────────────────────────────
export interface MockCatalogItem {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  description: string;
  icon: string;
  slaAmount: number;
  slaType: 'hours' | 'days';
}

export const MOCK_CATALOG_ITEMS: MockCatalogItem[] = [
  { id: 'sc1', category: 'Acesso e Segurança', subcategory: 'Sistemas', name: 'Liberação de acesso ao sistema', description: 'Solicite acesso a sistemas e aplicações corporativas.', icon: '🔐', slaAmount: 2, slaType: 'days' },
  { id: 'sc2', category: 'Acesso e Segurança', subcategory: 'Contas', name: 'Redefinição de senha', description: 'Redefina sua senha do domínio corporativo.', icon: '🔑', slaAmount: 1, slaType: 'hours' },
  { id: 'sc3', category: 'Hardware', subcategory: 'Equipamentos', name: 'Requisição de equipamento', description: 'Solicite computador, monitor, teclado e outros periféricos.', icon: '💻', slaAmount: 5, slaType: 'days' },
  { id: 'sc4', category: 'Hardware', subcategory: 'Equipamentos', name: 'Configuração de estação de trabalho', description: 'Configuração ou reconfiguração do seu computador.', icon: '🖥️', slaAmount: 2, slaType: 'days' },
  { id: 'sc5', category: 'Software', subcategory: 'Aplicativos', name: 'Instalação de software', description: 'Solicite a instalação de um software homologado.', icon: '📦', slaAmount: 1, slaType: 'days' },
  { id: 'sc6', category: 'Software', subcategory: 'Licenças', name: 'Licença de software', description: 'Solicitação de nova licença ou expansão de licenças.', icon: '📋', slaAmount: 3, slaType: 'days' },
  { id: 'sc7', category: 'Conectividade', subcategory: 'Redes', name: 'Configuração de VPN', description: 'Configure ou reconecte seu acesso VPN corporativo.', icon: '🌐', slaAmount: 4, slaType: 'hours' },
  { id: 'sc8', category: 'Conectividade', subcategory: 'E-mail', name: 'Configuração de e-mail', description: 'Configuração do e-mail em novo dispositivo.', icon: '📧', slaAmount: 2, slaType: 'hours' },
];
