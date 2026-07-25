import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

export const toggleDomainStatus = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado e é admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas administradores podem alterar o status do domínio.'
    );
  }

  const { domainId, isActive, rawDomain } = data;

  if (typeof domainId !== 'string' || typeof isActive !== 'boolean' || typeof rawDomain !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Parâmetros inválidos.');
  }

  const batch = db.batch();

  // 1. Atualizar o status do domínio
  const domainRef = db.collection('domains').doc(domainId);
  batch.update(domainRef, { isActive });

  // 2. Registrar na trilha de auditoria
  const auditLogRef = db.collection('audit_logs').doc();
  const action = isActive ? 'ENABLE_DOMAIN' : 'DISABLE_DOMAIN';
  
  batch.set(auditLogRef, {
    adminUid: context.auth.uid,
    action: action,
    targetDomain: rawDomain,
    ipAddress: context.rawRequest.ip || 'unknown',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  return {
    success: true,
    message: `Domínio ${rawDomain} ${isActive ? 'habilitado' : 'desabilitado'} com sucesso.`
  };
});
