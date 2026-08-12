export interface AiClassificationResult {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  confidence: number;
  aiBadgeText: string;
  icon: string;
}

/**
 * Motor de Triagem e Classificação Automática de Categoria por IA (Item 126)
 * Lê o texto do ticket ou mensagem de chat e determina a categoria e prioridade ideais.
 */
export function classifyTicketOrChatWithAi(text: string): AiClassificationResult {
  const cleanText = (text || '').toLowerCase().trim();

  if (!cleanText) {
    return {
      category: 'Geral / Suporte TI',
      priority: 'medium',
      tags: ['Geral'],
      confidence: 0.5,
      aiBadgeText: '🤖 IA: Categoria Padrão',
      icon: '⚙️',
    };
  }

  // 1. Categoria: Redes & VPN
  if (cleanText.includes('vpn') || cleanText.includes('rede') || cleanText.includes('wifi') || cleanText.includes('sem internet') || cleanText.includes('conexao') || cleanText.includes('roteador')) {
    const isUrgent = cleanText.includes('queda') || cleanText.includes('parado') || cleanText.includes('fora do ar');
    return {
      category: 'Redes, Firewall & VPN',
      priority: isUrgent ? 'urgent' : 'high',
      tags: ['Redes', 'VPN', 'Conectividade'],
      confidence: 0.96,
      aiBadgeText: '🤖 IA: Redes & VPN Identificado',
      icon: '🌐',
    };
  }

  // 2. Categoria: Acesso, Senhas & SSO
  if (cleanText.includes('senha') || cleanText.includes('login') || cleanText.includes('acesso') || cleanText.includes('sso') || cleanText.includes('instapasso') || cleanText.includes('bloqueado')) {
    return {
      category: 'Acesso, Senhas & SSO (IAM)',
      priority: 'high',
      tags: ['Segurança', 'Autenticação', 'SSO'],
      confidence: 0.95,
      aiBadgeText: '🤖 IA: Gestão de Acesso Detectada',
      icon: '🔐',
    };
  }

  // 3. Categoria: Impressoras & Suprimentos
  if (cleanText.includes('impressora') || cleanText.includes('imprimir') || cleanText.includes('toner') || cleanText.includes('papel') || cleanText.includes('printaway') || cleanText.includes('scanner')) {
    return {
      category: 'Impressoras & Suprimentos',
      priority: 'medium',
      tags: ['Periféricos', 'Impressão', 'Toner'],
      confidence: 0.94,
      aiBadgeText: '🤖 IA: Impressoras & Suprimentos',
      icon: '🖨️',
    };
  }

  // 4. Categoria: Hardware & Equipamentos
  if (cleanText.includes('notebook') || cleanText.includes('computador') || cleanText.includes('monitor') || cleanText.includes('teclado') || cleanText.includes('mouse') || cleanText.includes('tela') || cleanText.includes('bateria')) {
    const isUrgent = cleanText.includes('nao liga') || cleanText.includes('quebrou') || cleanText.includes('fumaça');
    return {
      category: 'Hardware & Equipamentos',
      priority: isUrgent ? 'urgent' : 'medium',
      tags: ['Hardware', 'Ativo TI', 'Manutenção'],
      confidence: 0.93,
      aiBadgeText: '🤖 IA: Ativo de Hardware Detectado',
      icon: '💻',
    };
  }

  // 5. Categoria: Sistemas & ERP
  if (cleanText.includes('erp') || cleanText.includes('sistema') || cleanText.includes('banco de dados') || cleanText.includes('software') || cleanText.includes('erro') || cleanText.includes('bug') || cleanText.includes('nota fiscal')) {
    return {
      category: 'Sistemas & ERP Corporativo',
      priority: 'high',
      tags: ['Sistemas', 'ERP', 'Software'],
      confidence: 0.91,
      aiBadgeText: '🤖 IA: Sistemas Corporativos',
      icon: '📊',
    };
  }

  // Padrão Geral
  return {
    category: 'Geral / Suporte TI',
    priority: 'medium',
    tags: ['Suporte Geral'],
    confidence: 0.8,
    aiBadgeText: '🤖 IA: Triagem Geral',
    icon: '⚙️',
  };
}
