export interface TriageOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  category?: string;
  suggestedSolution?: string;
  suggestedPriority?: 'baixa' | 'media' | 'alta' | 'critica';
  nextStepId?: string;
  escalateToHuman?: boolean;
}

export interface TriageNode {
  id: string;
  prompt: string;
  options: TriageOption[];
}

export const CHATBOT_TRIAGE_TREE: Record<string, TriageNode> = {
  root: {
    id: 'root',
    prompt: 'Olá! Sou o Assistente Virtual do ITSM. Como posso te ajudar hoje?',
    options: [
      {
        id: 'opt_access',
        label: '🔐 Senhas, Acesso & SSO InstaPasso',
        description: 'Esqueci a senha, conta bloqueada ou erro no 2FA',
        nextStepId: 'step_access',
      },
      {
        id: 'opt_hardware',
        label: '💻 Computador & Equipamentos',
        description: 'Lentidão, travamentos ou falhas de hardware',
        nextStepId: 'step_hardware',
      },
      {
        id: 'opt_network',
        label: '🌐 Internet, VPN & Conexões',
        description: 'Sem internet, VPN caindo ou pastas de rede',
        nextStepId: 'step_network',
      },
      {
        id: 'opt_printer',
        label: '🖨️ Impressoras & Suprimentos',
        description: 'Fila travada ou troca de toner/papel',
        nextStepId: 'step_printer',
      },
      {
        id: 'opt_human',
        label: '👤 Falar Direto com Atendente N1',
        description: 'Solicitar suporte humano imediatamente',
        category: 'Atendimento Geral',
        suggestedPriority: 'media',
        escalateToHuman: true,
      },
    ],
  },
  step_access: {
    id: 'step_access',
    prompt: 'Qual dificuldade você está enfrentando com seu acesso?',
    options: [
      {
        id: 'acc_reset',
        label: 'Esqueci minha senha do Windows / SSO',
        suggestedSolution: 'Para redefinir sua senha sozinho em 1 minuto, acesse a ferramenta InstaPasso SSO na aba Ferramentas ou utilize o botão "Esqueci a Senha" na tela de login.',
        category: 'Sistemas > Acessos & Senhas',
        suggestedPriority: 'alta',
        nextStepId: 'step_solution',
      },
      {
        id: 'acc_2fa',
        label: 'Erro no código do Aplicativo 2FA / Authenticator',
        suggestedSolution: 'Verifique se o horário do seu celular está configurado como "Automático". Caso continue o erro, nosso N1 irá resetar seu token 2FA.',
        category: 'Segurança > 2FA/MFA',
        suggestedPriority: 'alta',
        escalateToHuman: true,
      },
      {
        id: 'acc_new',
        label: 'Solicitar novo acesso a um sistema ou pasta',
        suggestedSolution: 'Novos acessos exigem aprovação do seu gestor direto. Iremos encaminhar sua solicitação para a fila de Onboarding/Permissões.',
        category: 'Sistemas > Acessos & Senhas',
        suggestedPriority: 'media',
        escalateToHuman: true,
      },
    ],
  },
  step_hardware: {
    id: 'step_hardware',
    prompt: 'O que está acontecendo com o seu equipamento?',
    options: [
      {
        id: 'hw_slow',
        label: 'Computador muito lento ou travando',
        suggestedSolution: 'Dica rápida: Salve seus arquivos e reinicie a máquina. Caso o problema persista, iremos agendar uma análise técnica presencial ou remota.',
        category: 'Hardware > Desktops/Notebooks',
        suggestedPriority: 'media',
        escalateToHuman: true,
      },
      {
        id: 'hw_power',
        label: 'Computador não liga ou tela fica preta',
        suggestedSolution: 'Verifique se os cabos de energia e do monitor estão firmes na tomada. Iremos abrir um chamado com prioridade Alta para você.',
        category: 'Hardware > Desktops/Notebooks',
        suggestedPriority: 'alta',
        escalateToHuman: true,
      },
    ],
  },
  step_network: {
    id: 'step_network',
    prompt: 'Qual o problema de conexão que você identificou?',
    options: [
      {
        id: 'net_wifi',
        label: 'Sem conexão de Internet (Wi-Fi ou Cabo)',
        suggestedSolution: 'Verifique se o cabo de rede está conectado ou desative/ative o Wi-Fi. Um analista de redes irá verificar o switch da sua área.',
        category: 'Redes > Conectividade Wi-Fi/Cabo',
        suggestedPriority: 'alta',
        escalateToHuman: true,
      },
      {
        id: 'net_vpn',
        label: 'VPN caindo ou sem acesso às pastas da empresa',
        suggestedSolution: 'Certifique-se de que a VPN FortiClient/GlobalProtect está conectada com status "Verde". Desconecte e conecte novamente.',
        category: 'Redes > VPN & Acesso Remoto',
        suggestedPriority: 'media',
        escalateToHuman: true,
      },
    ],
  },
  step_printer: {
    id: 'step_printer',
    prompt: 'Qual a solicitação para o setor de impressão?',
    options: [
      {
        id: 'prt_stuck',
        label: 'Impressora com fila travada ou offline',
        category: 'Periféricos > Impressoras',
        suggestedPriority: 'media',
        escalateToHuman: true,
      },
      {
        id: 'prt_toner',
        label: 'Solicitação de troca de Toner ou Papel',
        suggestedSolution: 'Nossa equipe de monitoramento automático PrintAway já registra os níveis de toner. Estamos enviando um repositor ao seu departamento.',
        category: 'Periféricos > Impressoras',
        suggestedPriority: 'baixa',
        escalateToHuman: true,
      },
    ],
  },
};
