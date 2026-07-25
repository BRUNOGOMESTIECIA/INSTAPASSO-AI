import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Em um ambiente real, usaríamos a biblioteca 'axios' ou 'node-fetch'.
// Aqui usaremos o fetch nativo do Node.js (Disponível a partir do Node 18)
// ou simulação de chamada HTTPS.

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Trigger que escuta a criação de qualquer novo documento na coleção 'audit_logs'.
 * Envia o log para um endpoint externo (Monitoramento SIEM).
 */
export const forwardToSIEM = functions.firestore
    .document('audit_logs/{logId}')
    .onCreate(async (snap, context) => {
        const logData = snap.data();
        const { logId } = context.params;

        // Configurações do SIEM (Ex: Splunk, Datadog)
        const SIEM_URL = process.env.SIEM_WEBHOOK_URL || 'https://mock-siem.empresa.local/v1/logs';
        const SIEM_API_KEY = process.env.SIEM_API_KEY || 'mock-api-key-12345';

        const payload = {
            timestamp: new Date().toISOString(),
            log_id: logId,
            source: 'instapasso_firebase',
            level: 'INFO',
            message: `Auditoria registrada: ${logData.action}`,
            details: logData
        };

        try {
            // Chamada HTTPS de despacho para o SIEM
            const response = await fetch(SIEM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SIEM_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Em um cenário real, logs não enviados poderiam cair em uma "Dead Letter Queue" (DLQ)
                functions.logger.error(`SIEM retornou erro HTTP ${response.status}`);
            } else {
                functions.logger.info(`Log de auditoria ${logId} despachado com sucesso para o SIEM.`);
            }
        } catch (error) {
            // Em caso de falha de rede ou timeout
            functions.logger.error(`Falha ao despachar log ${logId} para o SIEM:`, error);
        }
    });
