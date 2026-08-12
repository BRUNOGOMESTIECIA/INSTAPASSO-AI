import { logAuditEvent } from './audit-logger';

export interface WafRule {
  id: string;
  name: string;
  category: 'SQLi' | 'XSS' | 'PathTraversal' | 'BotProtection' | 'GeoIP' | 'RateLimit';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  enabled: boolean;
  blockedCount: number;
}

export interface WafConfig {
  wafEnabled: boolean;
  owaspCrsActive: boolean;
  geoIpBlockingActive: boolean;
  l7DdosProtectionActive: boolean;
  challengeSuspectIps: boolean;
  maxRequestsPerMinute: number;
  blockedCountries: string[];
  allowedCountries: string[];
}

export interface WafInspectionResult {
  allowed: boolean;
  threatType?: string;
  matchedRuleId?: string;
  reason?: string;
  clientIp: string;
  country: string;
  threatScore: number;
  requestDetails: {
    method: string;
    path: string;
    userAgent: string;
    payloadSnippet?: string;
  };
}

export interface WafEventLog {
  id: string;
  timestamp: string;
  clientIp: string;
  country: string;
  action: 'BLOCKED' | 'CHALLENGED' | 'PASSED';
  ruleName: string;
  category: string;
  path: string;
  threatScore: number;
}

const DEFAULT_WAF_CONFIG: WafConfig = {
  wafEnabled: true,
  owaspCrsActive: true,
  geoIpBlockingActive: true,
  l7DdosProtectionActive: true,
  challengeSuspectIps: true,
  maxRequestsPerMinute: 100,
  blockedCountries: ['RU', 'CN', 'KP', 'IR'],
  allowedCountries: ['BR', 'US', 'PT', 'ES', 'DE'],
};

const DEFAULT_WAF_RULES: WafRule[] = [
  { id: 'WAF-942100', name: 'OWASP SQLi Detection Engine', category: 'SQLi', severity: 'CRITICAL', enabled: true, blockedCount: 142 },
  { id: 'WAF-941100', name: 'OWASP XSS Injection Filter', category: 'XSS', severity: 'CRITICAL', enabled: true, blockedCount: 98 },
  { id: 'WAF-930100', name: 'Path Traversal & Directory Traversal', category: 'PathTraversal', severity: 'HIGH', enabled: true, blockedCount: 37 },
  { id: 'WAF-913100', name: 'Malicious Scanner & Bot Filter (sqlmap/nikto)', category: 'BotProtection', severity: 'HIGH', enabled: true, blockedCount: 312 },
  { id: 'WAF-GEO-01', name: 'GeoIP Country Lockdown Policy', category: 'GeoIP', severity: 'MEDIUM', enabled: true, blockedCount: 54 },
  { id: 'WAF-DDOS-01', name: 'Layer 7 HTTP Flood Rate Limiter', category: 'RateLimit', severity: 'CRITICAL', enabled: true, blockedCount: 819 },
];

/**
 * Retorna as configurações ativas do WAF Corporativo.
 */
export function getWafConfig(): WafConfig {
  try {
    const saved = localStorage.getItem('waf_corporate_config');
    if (saved) return { ...DEFAULT_WAF_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Erro ao ler configurações do WAF:', e);
  }
  return DEFAULT_WAF_CONFIG;
}

/**
 * Salva as configurações do WAF.
 */
export function saveWafConfig(config: WafConfig): void {
  localStorage.setItem('waf_corporate_config', JSON.stringify(config));
  logAuditEvent('WAF_CONFIG_UPDATED', `Regras e políticas do WAF Corporativo Layer 7 atualizadas.`);
}

/**
 * Retorna o histórico de eventos de bloqueio do WAF.
 */
export function getWafEventLogs(): WafEventLog[] {
  try {
    const saved = localStorage.getItem('waf_event_logs');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Erro ao carregar logs do WAF:', e);
  }
  return [
    {
      id: 'EVT-9901',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString(),
      clientIp: '185.220.101.4',
      country: 'RU 🇷🇺',
      action: 'BLOCKED',
      ruleName: 'OWASP SQLi Detection Engine',
      category: 'SQLi',
      path: '/api/v1/auth/login',
      threatScore: 95,
    },
    {
      id: 'EVT-9902',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString(),
      clientIp: '45.146.164.11',
      country: 'CN 🇨🇳',
      action: 'BLOCKED',
      ruleName: 'Malicious Scanner & Bot Filter',
      category: 'BotProtection',
      path: '/admin/config.php',
      threatScore: 88,
    },
    {
      id: 'EVT-9903',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString(),
      clientIp: '198.51.100.42',
      country: 'US 🇺🇸',
      action: 'CHALLENGED',
      ruleName: 'Layer 7 HTTP Flood Rate Limiter',
      category: 'RateLimit',
      path: '/tickets/query',
      threatScore: 65,
    },
  ];
}

/**
 * Adiciona um evento de WAF ao log e persiste no localStorage.
 */
export function logWafEvent(event: Omit<WafEventLog, 'id' | 'timestamp'>): WafEventLog {
  const newLog: WafEventLog = {
    ...event,
    id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleTimeString(),
  };

  const current = getWafEventLogs();
  const updated = [newLog, ...current.slice(0, 19)];
  localStorage.setItem('waf_event_logs', JSON.stringify(updated));

  logAuditEvent('WAF_THREAT_BLOCKED', `WAF L7 ${newLog.action} [${newLog.category}]: IP ${newLog.clientIp} (${newLog.country}) em ${newLog.path}`);
  return newLog;
}

/**
 * Simula a inspeção de uma requisição HTTP pelo WAF Corporativo Layer 7.
 */
export function inspectHttpRequest(payload: {
  url: string;
  method?: string;
  clientIp?: string;
  country?: string;
  bodySnippet?: string;
  userAgent?: string;
}): WafInspectionResult {
  const config = getWafConfig();
  const clientIp = payload.clientIp || '189.120.45.12';
  const country = payload.country || 'BR 🇧🇷';
  const body = payload.bodySnippet || '';
  const userAgent = payload.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  const path = payload.url;

  const reqDetails = {
    method: payload.method || 'POST',
    path,
    userAgent,
    payloadSnippet: body,
  };

  if (!config.wafEnabled) {
    return { allowed: true, clientIp, country, threatScore: 0, requestDetails: reqDetails };
  }

  // 1. Verificação de GeoIP
  if (config.geoIpBlockingActive) {
    const isBlockedGeo = config.blockedCountries.some((code) => country.includes(code));
    if (isBlockedGeo) {
      logWafEvent({
        clientIp,
        country,
        action: 'BLOCKED',
        ruleName: 'GeoIP Country Lockdown Policy',
        category: 'GeoIP',
        path,
        threatScore: 80,
      });
      return {
        allowed: false,
        threatType: 'GeoIP Lockdown',
        matchedRuleId: 'WAF-GEO-01',
        reason: `Acesso bloqueado por política de restrição geográfica (${country}).`,
        clientIp,
        country,
        threatScore: 80,
        requestDetails: reqDetails,
      };
    }
  }

  // 2. Verificação de SQL Injection (SQLi)
  const sqliPatterns = [/SELECT\s+.*\s+FROM/i, /UNION\s+SELECT/i, /OR\s+['"]?1['"]?\s*=\s*['"]?1/i, /DROP\s+TABLE/i, /INSERT\s+INTO/i];
  if (config.owaspCrsActive && sqliPatterns.some((pattern) => pattern.test(body) || pattern.test(path))) {
    logWafEvent({
      clientIp,
      country,
      action: 'BLOCKED',
      ruleName: 'OWASP SQLi Detection Engine',
      category: 'SQLi',
      path,
      threatScore: 98,
    });
    return {
      allowed: false,
      threatType: 'SQL Injection (SQLi)',
      matchedRuleId: 'WAF-942100',
      reason: 'Padrao malicioso de Injeção SQL (OWASP Rule 942100) detectado no payload.',
      clientIp,
      country,
      threatScore: 98,
      requestDetails: reqDetails,
    };
  }

  // 3. Verificação de XSS
  const xssPatterns = [/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, /javascript:/i, /onerror\s*=/i, /onload\s*=/i];
  if (config.owaspCrsActive && xssPatterns.some((pattern) => pattern.test(body) || pattern.test(path))) {
    logWafEvent({
      clientIp,
      country,
      action: 'BLOCKED',
      ruleName: 'OWASP XSS Injection Filter',
      category: 'XSS',
      path,
      threatScore: 92,
    });
    return {
      allowed: false,
      threatType: 'Cross-Site Scripting (XSS)',
      matchedRuleId: 'WAF-941100',
      reason: 'Código de script malicioso/XSS interceptado pelo filtro WAF L7.',
      clientIp,
      country,
      threatScore: 92,
      requestDetails: reqDetails,
    };
  }

  // 4. Verificação de Bot / Scanners Maliciosos
  const botUserAgents = [/sqlmap/i, /nikto/i, /nmap/i, /python-requests/i, /curl\/7/i, /gobuster/i];
  if (botUserAgents.some((pattern) => pattern.test(userAgent))) {
    logWafEvent({
      clientIp,
      country,
      action: 'BLOCKED',
      ruleName: 'Malicious Scanner & Bot Filter',
      category: 'BotProtection',
      path,
      threatScore: 90,
    });
    return {
      allowed: false,
      threatType: 'Automated Bot Scanner',
      matchedRuleId: 'WAF-913100',
      reason: `Ferramenta automatizada de ataque detectada (${userAgent}).`,
      clientIp,
      country,
      threatScore: 90,
      requestDetails: reqDetails,
    };
  }

  return { allowed: true, clientIp, country, threatScore: 5, requestDetails: reqDetails };
}
