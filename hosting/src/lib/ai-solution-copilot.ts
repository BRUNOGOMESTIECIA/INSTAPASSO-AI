import { MOCK_KB_ARTICLES } from '../mocks/data';

export interface AiSuggestionResult {
  title: string;
  suggestedText: string;
  sourceKbId?: string;
  confidence: number;
}

/**
 * Motor de Sugestão Inteligente de Solução ao Atendente via IA (@ia - Item 125)
 * Analisa a dúvida do cliente e sugere a melhor resposta técnica baseada na KB.
 */
export function getAiSolutionSuggestion(prompt: string): AiSuggestionResult {
  const cleanPrompt = prompt.toLowerCase().trim();

  // Regras de inferência por palavras-chave
  if (cleanPrompt.includes('senha') || cleanPrompt.includes('acesso') || cleanPrompt.includes('login')) {
    return {
      title: 'Procedimento de Redefinição de Senha e Acesso SSO',
      suggestedText: 'Olá! Para redefinir sua senha e restabelecer o acesso com segurança via InstaPasso SSO, siga estes passos:\n1. Acesse a tela de login e clique em "Esqueci minha senha"\n2. Insira seu e-mail corporativo cadastrado\n3. Siga o link de validação enviado para o seu e-mail e cadastre uma nova senha forte.\n\nQualquer dúvida adicional, estou à disposição!',
      sourceKbId: 'kb-1',
      confidence: 0.95,
    };
  }

  if (cleanPrompt.includes('vpn') || cleanPrompt.includes('rede') || cleanPrompt.includes('conexao')) {
    return {
      title: 'Diagnóstico de Conexão VPN e Roteamento',
      suggestedText: 'Olá! Para solucionar a falha de conexão na VPN corporativa, por favor execute as seguintes ações:\n1. Verifique se o aplicativo FortiClient / Cisco AnyConnect está atualizado\n2. Desconecte e reconecte sua rede Wi-Fi/cabo\n3. Tente a autenticação novamente utilizando suas credenciais de rede AD.\n\nCaso o problema persista, faremos o teste de porta remota.',
      sourceKbId: 'kb-2',
      confidence: 0.92,
    };
  }

  if (cleanPrompt.includes('impressora') || cleanPrompt.includes('imprimir') || cleanPrompt.includes('toner')) {
    return {
      title: 'Guia de Suporte a Impressão e Suprimentos',
      suggestedText: 'Olá! Identificamos sua solicitação sobre impressoras. Por favor, verifique:\n1. Se o cabo de rede ou USB está firmemente conectado\n2. Se o indicador de papel/toner no painel está verde\n3. Tente reiniciar a fila de impressão no Print Away.\n\nSe o toner estiver abaixo de 10%, a troca preventiva será solicitada automaticamente.',
      sourceKbId: 'kb-3',
      confidence: 0.89,
    };
  }

  // Sugestão genérica inteligente baseada na IA Copiloto
  return {
    title: 'Resposta Padrão Copiloto de Atendimento',
    suggestedText: `Olá! Analisei sua solicitação sobre "${prompt.replace(/@ia/gi, '').trim() || 'este incidente'}". Já consultei os procedimentos em nossa base de conhecimento e estou pronto para te auxiliar. Poderia confirmar o modelo do equipamento ou código de erro exibido na tela?`,
    confidence: 0.85,
  };
}
