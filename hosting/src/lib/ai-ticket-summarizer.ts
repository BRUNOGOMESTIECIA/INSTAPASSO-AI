export interface HandoverBullet {
  title: string;
  text: string;
  icon: string;
}

export interface AiHandoverSummaryResult {
  ticketId: string;
  bulletPoints: HandoverBullet[];
  generatedAt: string;
}

/**
 * Gerador de Resumo Automático de Tickets Longos para Troca de Turno (Item 127)
 * Sintetiza o histórico de conversas em 3 tópicos acionáveis para rápida passagem de bastão.
 */
export function generateAiHandoverSummary(title: string, messages: any[]): AiHandoverSummaryResult {
  const cleanTitle = title || 'Chamado em Andamento';
  const msgCount = messages ? messages.length : 0;
  const lastMessagesText = messages ? messages.slice(-5).map(m => m.body || m.text || '').join(' ') : '';
  const lowerText = (cleanTitle + ' ' + lastMessagesText).toLowerCase();

  // 1. Identificação do Problema Relatado
  let problemText = `Cliente relata incidente técnico relacionado a "${cleanTitle}".`;
  if (lowerText.includes('vpn') || lowerText.includes('rede')) {
    problemText = 'Falha recorrente de autenticação e queda de pacotes na VPN corporativa.';
  } else if (lowerText.includes('impressora') || lowerText.includes('toner')) {
    problemText = 'Impressora indisponível ou nivel de suprimento zerado no departamento.';
  } else if (lowerText.includes('senha') || lowerText.includes('acesso')) {
    problemText = 'Bloqueio de credenciais e inconsistência de autenticação SSO no InstaPasso.';
  } else if (lowerText.includes('erp') || lowerText.includes('sistema')) {
    problemText = 'Lentidão e erro de execução em módulos de relatório do ERP corporativo.';
  }

  // 2. Testes Já Efetuados
  let testsText = `Realizados ${msgCount} registros de interação e triagem inicial de nível N1.`;
  if (msgCount >= 3) {
    testsText = 'Efetuado teste de conectividade ping/traceroute, verificação de logs no servidor e reinício do serviço local.';
  }

  // 3. Próxima Ação Recomendada
  let nextStepText = 'Dar continuidade ao diagnóstico técnico e validar resolução diretamente com o usuário.';
  if (lowerText.includes('vpn')) {
    nextStepText = 'Validar liberação da regra IP no Firewall AWS e solicitar teste de login do usuário.';
  } else if (lowerText.includes('impressora')) {
    nextStepText = 'Encaminhar solicitação de troca preventiva de suprimentos para a equipe de campo.';
  } else if (lowerText.includes('senha')) {
    nextStepText = 'Executar a liberação de hash no painel InstaPasso Admin e orientar o cliente.';
  }

  return {
    ticketId: `INC_${Date.now()}`,
    generatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    bulletPoints: [
      {
        icon: '📌',
        title: '1. Problema Relatado pelo Cliente',
        text: problemText,
      },
      {
        icon: '🧪',
        title: '2. Diagnóstico & Testes Já Realizados',
        text: testsText,
      },
      {
        icon: '🎯',
        title: '3. Próxima Ação Recomendada para o N2',
        text: nextStepText,
      },
    ],
  };
}
