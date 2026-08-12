/**
 * Utilitário de Redaction / Mascaramento Automático de Dados Sensíveis (DLP)
 * Cumprimento do Princípio da Minimização da LGPD (Art. 6º, III)
 */

// Regex para CPF (com ou sem pontuação: 123.456.789-00 ou 12345678900)
const CPF_REGEX = /\b(\d{3})[\s.-]?(\d{3})[\s.-]?(\d{3})[\s.-]?(\d{2})\b/g;

// Regex para Cartão de Crédito (13 a 16 dígitos com espaço, traço ou contínuo)
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

// Regex para padrões de senhas expostas em texto puro (ex: "senha: 123456", "pass: admin123")
const PASSWORD_EXPOSURE_REGEX = /\b(senha|password|pass|pwd)\s*[:=]\s*(\S+)/gi;

/**
 * Mascara CPFs no formato ***.***.***-**
 */
export function maskCPF(text: string): string {
  return text.replace(CPF_REGEX, '***.***.***-**');
}

/**
 * Mascara cartões de crédito no formato ****-****-****-1234
 */
export function maskCreditCard(text: string): string {
  return text.replace(CREDIT_CARD_REGEX, (match) => {
    const cleanDigits = match.replace(/\D/g, '');
    if (cleanDigits.length >= 13 && cleanDigits.length <= 19) {
      const last4 = cleanDigits.slice(-4);
      return `****-****-****-${last4}`;
    }
    return match;
  });
}

/**
 * Mascara senhas expostas em comentários/chats
 */
export function maskExposedPasswords(text: string): string {
  return text.replace(PASSWORD_EXPOSURE_REGEX, '$1: [SENHA MASCARADA - LGPD]');
}

/**
 * Executa a sanitização/mascaramento completo de dados sensíveis antes de salvar no banco/chat
 */
export function redactSensitiveData(input: string): string {
  if (!input) return '';
  let sanitized = input;
  sanitized = maskCPF(sanitized);
  sanitized = maskCreditCard(sanitized);
  sanitized = maskExposedPasswords(sanitized);
  return sanitized;
}
