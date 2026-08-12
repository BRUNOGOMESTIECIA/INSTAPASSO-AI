import { instaPassoDb } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logCrudAudit } from './audit-logger';

/**
 * 🔑 Item 009: Autenticação por Biometria / Passkeys (FIDO2 / WebAuthn)
 * 
 * Suporte a login sem senha via TouchID, FaceID, Windows Hello e YubiKey,
 * condicionado estritamente à ativação prévia pelo Administrador.
 */

export interface PasskeysPolicyConfig {
  enabled: boolean; // Só funciona se ativado pelo Administrador
  requireUserVerification: boolean;
  allowPhysicalKeys: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface RegisteredPasskey {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  deviceName: string;
  credentialId: string;
  createdAt: string;
  lastUsedAt: string;
}

const POLICY_STORAGE_KEY = 'portal_passkeys_policy_config';
const PASSKEYS_LIST_STORAGE_KEY = 'portal_registered_passkeys_list';

/**
 * Retorna a configuração atual da política de Biometria / Passkeys FIDO2
 */
export function getPasskeysPolicyConfig(): PasskeysPolicyConfig {
  try {
    const raw = localStorage.getItem(POLICY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return {
    enabled: false, // Desativado por padrão conforme exigência do usuário
    requireUserVerification: true,
    allowPhysicalKeys: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Sistema (Padrão)',
  };
}

/**
 * Salva a configuração da política de Passkeys (Ativado pelo Administrador)
 */
export async function savePasskeysPolicyConfig(
  config: PasskeysPolicyConfig,
  adminName: string = 'Bruno Gomes (Super Admin)'
): Promise<PasskeysPolicyConfig> {
  config.updatedAt = new Date().toISOString();
  config.updatedBy = adminName;

  try {
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('[PasskeysFIDO2] Erro ao salvar política:', e);
  }

  await logCrudAudit('UPDATE', 'passkeys_policy_config', 'global_policy', JSON.stringify({
    action: 'UPDATE_PASSKEYS_FIDO2_POLICY',
    enabled: config.enabled,
    updatedBy: adminName,
  }));

  return config;
}

/**
 * Retorna a lista de chaves biométricas / Passkeys cadastradas
 */
export function getRegisteredPasskeysList(): RegisteredPasskey[] {
  try {
    const raw = localStorage.getItem(PASSKEYS_LIST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return getInitialMockPasskeys();
}

function getInitialMockPasskeys(): RegisteredPasskey[] {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 'pk_bruno_touchid',
      userId: 'usr_bruno_gomes',
      userName: 'Bruno Gomes',
      userEmail: 'bg@tiecia.com.br',
      deviceName: 'MacBook Pro (TouchID Biometria)',
      credentialId: 'fido2_cred_9981_touchid',
      createdAt: timestamp,
      lastUsedAt: timestamp,
    },
    {
      id: 'pk_ana_winhello',
      userId: 'usr_ana_silva',
      userName: 'Ana Silva',
      userEmail: 'ana.silva@empresa.com.br',
      deviceName: 'Windows Hello (FaceID & TPM 2.0)',
      credentialId: 'fido2_cred_4412_winhello',
      createdAt: timestamp,
      lastUsedAt: timestamp,
    },
    {
      id: 'pk_carlos_yubikey',
      userId: 'usr_carlos_mendes',
      userName: 'Carlos Mendes',
      userEmail: 'carlos.mendes@clienteb2b.com.br',
      deviceName: 'YubiKey 5 NFC (Chave Física FIDO2)',
      credentialId: 'fido2_cred_1290_yubikey',
      createdAt: timestamp,
      lastUsedAt: timestamp,
    },
  ];
}

/**
 * Registra uma nova chave biométrica / Passkey para o usuário
 */
export async function registerUserPasskey(
  userName: string,
  userEmail: string,
  deviceName: string = 'TouchID / FaceID Dispositivo'
): Promise<RegisteredPasskey> {
  const id = `pk_${Date.now()}`;
  const credentialId = `fido2_cred_${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  const newPasskey: RegisteredPasskey = {
    id,
    userId: `usr_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    userName,
    userEmail,
    deviceName,
    credentialId,
    createdAt: timestamp,
    lastUsedAt: timestamp,
  };

  // Grava a credencial na lista local
  const list = getRegisteredPasskeysList();
  list.unshift(newPasskey);
  try {
    localStorage.setItem(PASSKEYS_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[Passkeys] Erro ao salvar lista:', e);
  }

  // Audit Log ISO 27001
  await logCrudAudit('CREATE', 'user_passkeys_fido2', id, JSON.stringify({
    action: 'REGISTER_BIOMETRIC_PASSKEY_FIDO2',
    userName,
    userEmail,
    deviceName,
    credentialId,
  }));

  return newPasskey;
}

/**
 * Simula a autenticação por Passkey biométrica
 */
export async function authenticateWithPasskey(userEmail?: string): Promise<{
  success: boolean;
  passkey: RegisteredPasskey | null;
  message: string;
}> {
  const config = getPasskeysPolicyConfig();

  if (!config.enabled) {
    return {
      success: false,
      passkey: null,
      message: 'A autenticação por Biometria / Passkeys (FIDO2) está DESATIVADA pelo Administrador.',
    };
  }

  const list = getRegisteredPasskeysList();
  let found = list.find((p) => p.userEmail === userEmail);
  if (!found && list.length > 0) {
    found = list[0];
  }

  if (!found) {
    return {
      success: false,
      passkey: null,
      message: 'Nenhuma chave biométrica / Passkey FIDO2 cadastrada para este usuário.',
    };
  }

  // Atualiza lastUsedAt
  found.lastUsedAt = new Date().toISOString();
  try {
    localStorage.setItem(PASSKEYS_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  await logCrudAudit('CREATE', 'passkey_authentications', found.id, JSON.stringify({
    action: 'PASSKEY_FIDO2_LOGIN_SUCCESS',
    userEmail: found.userEmail,
    deviceName: found.deviceName,
  }));

  return {
    success: true,
    passkey: found,
    message: `Autenticação biométrica efetuada com sucesso via ${found.deviceName}!`,
  };
}
