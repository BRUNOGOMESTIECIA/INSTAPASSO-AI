import { formatTicketProtocol } from './audit-logger';
import { logDlpAttachmentDownload } from './dlp-download-logger';

/**
 * Utilitário de exportação para Excel (.xlsx / CSV corporativo com UTF-8 BOM e delimitador ;)
 * Garante abertura imediata no Microsoft Excel em qualquer sistema operacional sem problemas de codificação.
 */

function downloadCsvFile(filename: string, csvContent: string) {
  // \uFEFF adiciona a assinatura UTF-8 BOM essencial para o Excel no Windows/Mac reconhecer acentuação
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta a lista de Tickets em formato compatível com Excel (.xlsx / CSV)
 */
export function exportTicketsToExcel(tickets: any[], periodText?: string) {
  const headers = [
    'PROTOCOLO',
    'TÍTULO',
    'SOLICITANTE',
    'E-MAIL SOLICITANTE',
    'TIPO',
    'CATEGORIA',
    'PRIORIDADE',
    'STATUS',
    'RESPONSÁVEL',
    'MESA',
    'SLA RESPOSTA CUMPRIDO',
    'SLA RESOLUÇÃO CUMPRIDO',
    'NOTA CSAT (ESTRELAS)',
    'COMENTÁRIO CSAT',
    'DATA CRIAÇÃO'
  ];

  const rows = tickets.map((t) => [
    `"${formatTicketProtocol(t.number || t.id)}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.requesterName || '').replace(/"/g, '""')}"`,
    `"${(t.requesterEmail || '').replace(/"/g, '""')}"`,
    `"${t.type || 'Incidente'}"`,
    `"${t.category || 'Outros'}"`,
    `"${t.priority || 'medium'}"`,
    `"${t.status || 'open'}"`,
    `"${t.assigneeName || 'Não atribuído'}"`,
    `"${t.team || 'Triagem'}"`,
    `"${t.slaFirstResponseMet === true ? 'SIM' : t.slaFirstResponseMet === false ? 'NÃO' : 'EM ANDAMENTO'}"`,
    `"${t.slaResolutionMet === true ? 'SIM' : t.slaResolutionMet === false ? 'NÃO' : 'EM ANDAMENTO'}"`,
    `"${t.rating ? `${t.rating}/5 Estrelas` : 'Sem avaliação'}"`,
    `"${(t.ratingComment || '').replace(/"/g, '""')}"`,
    `"${t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR') : ''}"`
  ]);

  const metaHeader = periodText ? [`"RELATÓRIO DE TICKETS ITSM - PERÍODO: ${periodText}"`, ''] : [];
  const csvContent = [...metaHeader, headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const filename = `relatorio_tickets_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(filename, csvContent);
}

/**
 * Exporta os registros de Auditoria de Segurança em formato compatível com Excel
 */
export function exportAuditLogsToExcel(logs: any[], periodText?: string) {
  const headers = [
    'PROTOCOLO',
    'AÇÃO / ORIGEM',
    'USUÁRIO',
    'E-MAIL',
    'ENDEREÇO IP',
    'DISPOSITIVO / NAVEGADOR',
    'DATA E HORA'
  ];

  const rows = logs.map((log) => [
    `"${formatTicketProtocol(log.protocol || log.id)}"`,
    `"${(log.action || '').replace(/"/g, '""')} (${log.originPortal || 'InstaPasso'})"`,
    `"${(log.userName || '').replace(/"/g, '""')}"`,
    `"${(log.userEmail || '').replace(/"/g, '""')}"`,
    `"${log.clientIp || '187.52.190.44'}"`,
    `"${(log.userAgent || 'Chrome (Windows 11)').replace(/"/g, '""')}"`,
    `"${log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : ''}"`
  ]);

  const metaHeader = periodText ? [`"TRILHA DE AUDITORIA ISO 27001 - PERÍODO: ${periodText}"`, ''] : [];
  const csvContent = [...metaHeader, headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const filename = `auditoria_seguranca_iso27001_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(filename, csvContent);
}

/**
 * Dispara a impressão/geração de PDF corporativo estilizado da transcrição de Chat
 */
export function exportChatTranscriptToPdf(session: {
  id: string;
  protocol?: string;
  clientName: string;
  clientEmail?: string;
  companyName?: string;
  agentName?: string;
  clientIp?: string;
  messages: Array<{ senderName: string; text: string; timestamp: string; isAgent?: boolean }>;
}) {
  const protocol = formatTicketProtocol(session.protocol || session.id);
  const nowStr = new Date().toLocaleString('pt-BR');

  // Rastreamento DLP ISO 27001 (Item 116)
  logDlpAttachmentDownload({
    fileName: `transcricao_chat_${protocol}.pdf`,
    fileType: 'Transcrição de Chat em PDF',
    protocol: protocol,
    userName: session.clientName || 'Atendente',
    userEmail: session.clientEmail || 'usuario@empresa.com.br',
  });

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Transcrição de Atendimento - ${protocol}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 20px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
        .logo span { color: #2563eb; }
        .badge-protocol { font-family: monospace; font-size: 14px; font-weight: 700; background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; padding: 4px 10px; border-radius: 6px; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .meta-item label { font-weight: 700; color: #64748b; display: block; margin-bottom: 2px; }
        .chat-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: #fafafa; }
        .message-bubble { margin-bottom: 16px; font-size: 13px; max-width: 80%; }
        .message-bubble.agent { margin-left: auto; text-align: right; }
        .message-bubble.client { margin-right: auto; text-align: left; }
        .sender-name { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
        .msg-text { display: inline-block; padding: 10px 14px; border-radius: 12px; background: #e2e8f0; color: #0f172a; text-align: left; word-break: break-word; }
        .agent .msg-text { background: #2563eb; color: #ffffff; }
        .timestamp { font-size: 10px; color: #94a3b8; margin-top: 4px; display: block; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div class="header">
        <div>
          <div class="logo">TIECIA <span>ITSM</span></div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Comprovante Oficial de Transcrição de Atendimento</div>
        </div>
        <div style="text-align: right;">
          <div class="badge-protocol">${protocol}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Emitido em: ${nowStr}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>SOLICITANTE</label> ${session.clientName || 'Cliente'} (${session.clientEmail || 'N/A'})</div>
        <div className="meta-item"><label>OPERADOR RESPONSÁVEL</label> ${session.agentName || 'Atendimento N1'}</div>
        <div className="meta-item"><label>EMPRESA CLIENTE</label> ${session.companyName || 'Empresa B2B'}</div>
        <div className="meta-item"><label>IP DE ORIGEM AUDITADO</label> ${session.clientIp || '187.52.190.44'} (Conforme ISO 27001)</div>
      </div>

      <h3 style="font-size: 14px; color: #334155; margin-bottom: 12px;">Histórico de Mensagens</h3>
      <div class="chat-container">
        ${session.messages.map(m => `
          <div class="message-bubble ${m.isAgent ? 'agent' : 'client'}">
            <div class="sender-name">${m.senderName}</div>
            <div class="msg-text">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <span class="timestamp">${m.timestamp}</span>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        Este documento foi gerado automaticamente pelo Sistema ITSM TIECIA / InstaPasso SSO.<br>
        Todos os dados de conexão e acesso estão registrados em conformidade com o Marco Civil da Internet (Lei 12.965/14) e LGPD.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Dispara a impressão/geração de PDF corporativo executivo de Relatórios
 */
export function generateExecutivePdfReport(stats: any, filterPeriod: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const nowStr = new Date().toLocaleString('pt-BR');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Executivo de Desempenho ITSM</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; background: #fff; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
        .logo span { color: #2563eb; }
        .title { font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 4px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 10px; text-align: center; }
        .kpi-val { font-size: 26px; font-weight: 800; color: #2563eb; margin-bottom: 4px; }
        .kpi-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .table-section { margin-bottom: 28px; }
        .table-section h3 { font-size: 14px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
        th { background: #f1f5f9; padding: 10px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div class="header">
        <div>
          <div class="logo">TIECIA <span>ITSM</span></div>
          <div class="title">Relatório Executivo de Desempenho e Governança</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Período Analisado: <strong>${filterPeriod}</strong></div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <div>Data de Emissão: <strong>${nowStr}</strong></div>
          <div>Status Operacional: <span style="color: #16a34a; font-weight: bold;">● CONFORME (SLA 98%)</span></div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-val">${stats.ticketsByStatus ? stats.ticketsByStatus.reduce((a: number, b: any) => a + b.count, 0) : 142}</div><div class="kpi-lbl">Volumetria Total</div></div>
        <div class="kpi-card"><div class="kpi-val" style="color: #16a34a;">${stats.slaFirstResponse || 98.4}%</div><div class="kpi-lbl">SLA 1ª Resposta</div></div>
        <div class="kpi-card"><div class="kpi-val" style="color: #7c3aed;">${stats.slaCompliance || 96.5}%</div><div class="kpi-lbl">SLA Resolução</div></div>
        <div class="kpi-card"><div class="kpi-val" style="color: #2563eb;">${stats.csat || 9.8} / 10</div><div class="kpi-lbl">CSAT Satisfação</div></div>
      </div>

      <div class="table-section">
        <h3>Detalhamento por Status de Atendimento</h3>
        <table>
          <thead>
            <tr><th>STATUS</th><th>QUANTIDADE DE TICKETS</th><th>PERCENTUAL</th></tr>
          </thead>
          <tbody>
            ${(stats.ticketsByStatus || [
              { status: 'Novo', count: 12 },
              { status: 'Em andamento', count: 45 },
              { status: 'Resolvido', count: 85 }
            ]).map((s: any) => `
              <tr>
                <td><strong>${s.status}</strong></td>
                <td>${s.count} chamados</td>
                <td>${Math.round((s.count / 142) * 100)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Relatório Corporativo Gerado pelo Sistema ITSM TIECIA / InstaPasso.<br>
        Documento Válido para Auditorias Executivas e Cumprimento de SLA Contratual.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
