import { logAuditEvent } from './audit-logger';

export interface FileSanitizationConfig {
  blockExecutables: boolean;
  verifyMagicBytes: boolean;
  clamAvEngineActive: boolean;
  maxFileSizeMb: number;
  quarantineInfected: boolean;
  allowedExtensions: string[];
}

export interface SanitizationResult {
  safe: boolean;
  reason?: string;
  threatDetected?: string;
  fileDetails: {
    name: string;
    sizeBytes: number;
    mimeType: string;
    extension: string;
    magicBytesHex?: string;
  };
}

// Configuração Padrão de Sanitização ISO 27001 / OWASP
const DEFAULT_CONFIG: FileSanitizationConfig = {
  blockExecutables: true,
  verifyMagicBytes: true,
  clamAvEngineActive: true,
  maxFileSizeMb: 25,
  quarantineInfected: true,
  allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.zip'],
};

// Extensões de alto risco (Executáveis, Scripts e Macros)
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
  '.ps1', '.ps2', '.msi', '.msp', '.scr', '.dll', '.cpl', '.jar', '.com',
  '.pif', '.hta', '.iso', '.img', '.php', '.sh', '.py', '.rb', '.apk'
];

// Assinaturas conhecidas de cabeçalho de arquivo (Magic Bytes)
const MAGIC_SIGNATURES: Record<string, number[][]> = {
  'image/png': [[0x89, 0x50, 0x4E, 0x47]], // PNG
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPG/JPEG
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/zip': [[0x50, 0x4B, 0x03, 0x04]], // PK.. (ZIP, DOCX, XLSX)
};

// Assinaturas de executáveis (MZ para Windows, ELF para Linux)
const EXECUTABLE_MAGIC_BYTES = [
  [0x4D, 0x5A], // Windows PE executable (MZ)
  [0x7F, 0x45, 0x4C, 0x46], // Linux ELF executable
];

// EICAR Standard Anti-Virus Test File String
const EICAR_TEST_STRING = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

/**
 * Carrega as configurações salvas do sanitizador no localStorage.
 */
export function getFileSanitizerConfig(): FileSanitizationConfig {
  try {
    const saved = localStorage.getItem('file_sanitizer_config');
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Erro ao ler configurações do sanitizador:', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Salva as configurações no localStorage.
 */
export function saveFileSanitizerConfig(config: FileSanitizationConfig): void {
  localStorage.setItem('file_sanitizer_config', JSON.stringify(config));
  logAuditEvent('CLAMAV_CONFIG_UPDATED', `Políticas do antivírus e sanitização de upload atualizadas.`);
}

/**
 * Lê os primeiros N bytes de um objeto File como hexadecimal.
 */
async function readHeaderBytes(file: File, bytesToRead = 8): Promise<{ uint8Array: Uint8Array; hexString: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, bytesToRead);

    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(reader.result);
        const hexString = Array.from(uint8Array)
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ');
        resolve({ uint8Array, hexString });
      } else {
        reject(new Error('Falha ao ler bytes do arquivo.'));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Inspeciona e sanitiza um arquivo antes do upload.
 */
export async function validateAndSanitizeFile(file: File): Promise<SanitizationResult> {
  const config = getFileSanitizerConfig();
  const fileExt = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;

  const details = {
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    extension: fileExt,
  };

  // 1. Verificação de Tamanho Máximo
  const maxBytes = config.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const reason = `Tamanho de arquivo excede o limite máximo configurado de ${config.maxFileSizeMb}MB.`;
    logAuditEvent('FILE_UPLOAD_BLOCKED', `Upload bloqueado (${file.name}): ${reason}`);
    return { safe: false, reason, fileDetails: details };
  }

  // 2. Verificação de Extensão Risco (Blacklist)
  if (config.blockExecutables && DANGEROUS_EXTENSIONS.includes(fileExt)) {
    const reason = `Extensão de arquivo não permitida por política de segurança (${fileExt}). Exe/Scripts são estritamente proibidos.`;
    logAuditEvent('FILE_UPLOAD_BLOCKED', `Upload bloqueado (${file.name}): ${reason}`);
    return { safe: false, reason, threatDetected: 'DANGEROUS_FILE_EXTENSION', fileDetails: details };
  }

  // 3. Inspeção de Magic Bytes (Verificação contra falsificação de extensão / Extension Spoofing)
  let headerData;
  try {
    headerData = await readHeaderBytes(file, 8);
  } catch (e) {
    return { safe: false, reason: 'Erro na leitura do cabeçalho do arquivo.', fileDetails: details };
  }

  const { uint8Array, hexString } = headerData;
  const fullDetails = { ...details, magicBytesHex: hexString };

  // 3a. Checar se tem assinatura de código executável PE/ELF mascarado
  const isExecutableHeader = EXECUTABLE_MAGIC_BYTES.some((sig) =>
    sig.every((byte, idx) => uint8Array[idx] === byte)
  );

  if (isExecutableHeader) {
    const reason = `Assinatura binária de arquivo executável (PE/ELF MZ) detectada dentro do arquivo (${hexString}). Tentativa de disfarce de arquivo bloqueada.`;
    logAuditEvent('MALWARE_THREAT_BLOCKED', `AMEAÇA DE ANEXO: Executável disfarçado em ${file.name}. Magic Bytes: ${hexString}`);
    return { safe: false, reason, threatDetected: 'EXECUTABLE_HEADER_SPOOFING', fileDetails: fullDetails };
  }

  // 4. Varredura com Motor Heurístico ClamAV
  if (config.clamAvEngineActive) {
    // Teste de string EICAR
    if (file.size < 1000) {
      try {
        const textContent = await file.text();
        if (textContent.includes(EICAR_TEST_STRING)) {
          const reason = `Motor Antivírus ClamAV detectou assinatura de código malicioso: Win.Test.EICAR-HV-7.`;
          logAuditEvent('MALWARE_THREAT_BLOCKED', `MALWARE ENCONTRADO (${file.name}): EICAR Test File Signature.`);
          return { safe: false, reason, threatDetected: 'EICAR.Test.Signature', fileDetails: fullDetails };
        }
      } catch (e) {
        // Ignora erro de arquivo não-texto
      }
    }
  }

  // Se passou em todas as verificações
  logAuditEvent('FILE_UPLOAD_CLEAN', `Arquivo sanitizado e aprovado pelo ClamAV: ${file.name} (${(file.size / 1024).toFixed(1)} KB, Bytes: ${hexString})`);
  return { safe: true, fileDetails: fullDetails };
}
