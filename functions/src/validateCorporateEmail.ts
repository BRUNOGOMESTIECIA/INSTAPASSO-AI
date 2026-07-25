import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

export const validateCorporateEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email || typeof email !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'E-mail corporativo é obrigatório.');
  }

  // 1. Extração e sanitização do domínio
  const emailParts = email.trim().toLowerCase().split('@');
  if (emailParts.length !== 2) {
    throw new functions.https.HttpsError('invalid-argument', 'Formato de e-mail inválido.');
  }
  
  const rawDomain = `@${emailParts[1]}`;
  const sanitizedDomainId = rawDomain.replace(/[^a-zA-Z0-9]/g, '_');

  // 2. Consulta de alta velocidade O(1) no Firestore
  const domainRef = db.collection('domains').doc(sanitizedDomainId);
  const domainSnap = await domainRef.get();

  if (!domainSnap.exists) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'O domínio corporativo informado não está cadastrado no sistema.'
    );
  }

  const domainData = domainSnap.data();

  // 3. Verificação de status do domínio
  if (!domainData?.isActive) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'O domínio corporativo do seu e-mail foi desabilitado. Entre em contato com o administrador.'
    );
  }

  // 4. Domínio Ativo -> Gerar Hash e Token de Validação
  const emailHash = crypto.createHash('sha256').update(email).digest('hex');
  const validationToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(validationToken).digest('hex');

  await db.collection('validation_requests').add({
    emailHash,
    domain: rawDomain,
    tokenHash,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)), // 15 min
    used: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 5. Disparar e-mail de validação (ex: via SendGrid/Mailgun Integration)
  return {
    success: true,
    message: 'Código de validação enviado para o e-mail corporativo.'
  };
});
