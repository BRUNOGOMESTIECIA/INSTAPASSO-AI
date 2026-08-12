/**
 * Utilitário leve para sanitização básica de HTML contra XSS (Cross-Site Scripting).
 * Remove tags <script>, iframes suspeitos, e atributos iniciados com "on" (ex: onload, onerror).
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  
  let clean = dirty;
  
  // 1. Remove tags <script> completas com seu conteúdo
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 2. Remove atributos perigosos "on..." (ex: onerror, onload, onclick)
  // Expressão regular básica para remover onAlgumaCoisa="..."
  clean = clean.replace(/\bon[a-z]+\s*=\s*(['"])(?:(?!\1)[^\\]|\\.)*\1/gi, '');
  
  // 3. Remove hrefs com "javascript:"
  clean = clean.replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href="#"');
  
  return clean;
}
