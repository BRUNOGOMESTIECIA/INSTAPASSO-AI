import { logSecurityAudit, formatTicketProtocol } from './audit-logger';
import { toast } from 'sonner';

export interface DlpDownloadEventParams {
  fileName: string;
  fileType?: string;
  fileSize?: string;
  protocol?: string;
  userName?: string;
  userEmail?: string;
  portal?: 'Portal Operacional' | 'Portal do Cliente';
}

/**
 * Audit Logger de Prevenção contra Vazamento de Dados (DLP - Data Loss Prevention - Item 116)
 * Registra formalmente qualquer download de anexo ou transcrição de chat no audit log ISO 27001.
 */
export function logDlpAttachmentDownload(params: DlpDownloadEventParams) {
  const {
    fileName,
    fileType = 'Documento / Anexo',
    fileSize = 'Indeterminado',
    protocol = 'GERAL',
    userName = 'Operador TI',
    userEmail = 'operador@empresa.com.br',
    portal = 'Portal Operacional'
  } = params;

  const formattedProtocol = formatTicketProtocol(protocol);

  // Registro de Trilha Auditável ISO 27001 / LGPD
  logSecurityAudit({
    protocol: formattedProtocol,
    action: `🛡️ ALERTA DLP: Download de Anexo / Transcrição (${fileName})`,
    originPortal: portal,
    userName: userName,
    userEmail: userEmail,
    details: `O usuário ${userName} (${userEmail}) realizou o download do arquivo "${fileName}" (${fileType}, ${fileSize}) referente ao chamado/atendimento ${formattedProtocol}.`
  });

  // Notificação Visual sutil DLP
  toast.info(`🛡️ Trilha DLP: Download registrado em audit log`, {
    description: `Arquivo: ${fileName} | Protocolo: ${formattedProtocol}`,
    duration: 3500,
  });

  return {
    success: true,
    timestamp: new Date().toISOString()
  };
}
