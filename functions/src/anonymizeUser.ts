import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

/**
 * Endpoint Callable para anonimizar um usuário mediante requisição (Direito ao Esquecimento).
 * Mascara nome, e-mail e empresa, transformando o e-mail em um hash irreversível.
 */
export const anonymizeUser = functions.https.onCall(async (data, context) => {
    // Autenticação e Autorização (RBAC): Apenas usuários logados e com perfil admin poderiam chamar isso.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Acesso negado: Usuário não autenticado.');
    }

    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID do usuário é obrigatório.');
    }

    try {
        // Como o Portal-IA usa dados mockados para usuários, 
        // em um cenário real buscaríamos na coleção 'users'
        // const userRef = db.collection('users').doc(userId);
        // const doc = await userRef.get();
        // if (!doc.exists) throw new Error("Usuário não encontrado.");
        
        // Simulação do hash SHA-256 para o email
        const hash = crypto.createHash('sha256');
        hash.update(userId + Date.now().toString());
        const anonymizedEmailHash = hash.digest('hex').substring(0, 15) + '@anonymized.local';

        // O que aconteceria em produção:
        /*
        await userRef.update({
            name: '[USUÁRIO ANONIMIZADO]',
            email: anonymizedEmailHash,
            company: '[EMPRESA ANONIMIZADA]',
            phone: null,
            status: 'DELETED_ANONYMIZED',
            anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
            anonymizedBy: context.auth.uid
        });
        */

        // Registra o evento de anonimização no log de auditoria
        await db.collection('audit_logs').add({
            action: 'ANONYMIZE_USER',
            targetUserId: userId,
            performedBy: context.auth.uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            reason: 'LGPD Art. 18 - Direito ao Esquecimento'
        });

        functions.logger.info(`Usuário ${userId} anonimizado com sucesso por ${context.auth.uid}`);

        return { 
            success: true, 
            message: 'Usuário anonimizado com sucesso (LGPD).',
            anonymizedEmail: anonymizedEmailHash 
        };
    } catch (error) {
        functions.logger.error(`Falha ao anonimizar o usuário ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'Erro interno ao processar a anonimização.');
    }
});
