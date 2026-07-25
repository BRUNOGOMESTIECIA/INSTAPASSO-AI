/**
 * @fileoverview Robô de Auditoria (Cloud Function)
 * Monitora em tempo real a coleção 'domains' no Firestore.
 * Qualquer criação, alteração ou exclusão dispara esta função para registrar
 * um log inalterável na coleção 'audit_logs', garantindo conformidade com a LGPD e ISO 27001.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

/**
 * Trigger do Firestore acionado no evento `onWrite` (Qualquer modificação no documento).
 * @param {functions.Change<functions.firestore.DocumentSnapshot>} change - O estado anterior e posterior do documento.
 * @param {functions.EventContext} context - Metadados do evento (incluindo o ID do documento).
 */
export const auditDomainChanges = functions.firestore
    .document('domains/{domainId}')
    .onWrite(async (change, context) => {
        const { domainId } = context.params;
        const beforeData = change.before.exists ? change.before.data() : null;
        const afterData = change.after.exists ? change.after.data() : null;

        let action = 'UPDATE';
        
        // Lógica de dedução da ação baseada na existência dos dados antes e depois do evento
        if (!beforeData && afterData) {
            action = 'CREATE'; // Documento não existia e foi criado
        } else if (beforeData && !afterData) {
            action = 'DELETE'; // Exclusão física no Firestore (não recomendada, mas monitorada para segurança)
        } else if (beforeData && afterData) {
            // Verifica exclusão lógica (Soft Delete: status alterado para 'DELETED')
            if (beforeData.status !== 'DELETED' && afterData.status === 'DELETED') {
                action = 'LOGICAL_DELETE';
            }
        }

        // Recupera o auth.uid se a chamada vier de um client logado e houver context.auth
        // Obs: Em triggers onWrite de banco, o context.auth NÃO existe na SDK atual a menos que seja um trigger Callable.
        // Como o AdminPanel atualiza o Firestore diretamente via client, não temos o nome do admin no trigger Firestore facilmente,
        // mas registramos a ação e o timestamp garantido pelo servidor.
        
        const logEntry = {
            domainId,
            action,
            targetDomain: afterData?.domainName || beforeData?.domainName || 'Desconhecido',
            targetCompany: afterData?.companyName || beforeData?.companyName || 'Desconhecido',
            previousState: beforeData || null,
            newState: afterData || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        try {
            await db.collection('audit_logs').add(logEntry);
            functions.logger.info(`Audit log created for domain: ${domainId} | Action: ${action}`);
        } catch (error) {
            functions.logger.error("Failed to write audit log:", error);
        }
    });
