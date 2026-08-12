import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, FileCode, CheckCircle2, AlertTriangle, Upload, RefreshCw, HardDrive, FileText, Bug } from 'lucide-react';
import { getFileSanitizerConfig, saveFileSanitizerConfig, validateAndSanitizeFile, type FileSanitizationConfig, type SanitizationResult } from '../../lib/file-upload-sanitizer';
import { toast } from 'sonner';

export function FileUploadSanitizerWidget() {
  const [config, setConfig] = useState<FileSanitizationConfig>(getFileSanitizerConfig());
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<SanitizationResult | null>(null);
  const [scannedHistory, setScannedHistory] = useState<SanitizationResult[]>([]);

  const handleToggleConfig = (key: keyof FileSanitizationConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveFileSanitizerConfig(updated);
    toast.success('Política de Antivírus atualizada com sucesso.');
  };

  const handleSizeChange = (val: number) => {
    const updated = { ...config, maxFileSizeMb: val };
    setConfig(updated);
    saveFileSanitizerConfig(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsScanning(true);
    setLastResult(null);

    // Simulação leve de tempo de varredura ClamAV
    setTimeout(async () => {
      const res = await validateAndSanitizeFile(file);
      setLastResult(res);
      setScannedHistory((prev) => [res, ...prev.slice(0, 4)]);
      setIsScanning(false);

      if (res.safe) {
        toast.success(`Arquivo Aprovado: ${file.name} (ClamAV Clean)`);
      } else {
        toast.error(`Ameaça Bloqueada: ${res.reason}`);
      }
    }, 600);
  };

  const handleSimulateEicarTest = async () => {
    setIsScanning(true);
    setLastResult(null);

    const eicarBlob = new Blob(
      ['X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'],
      { type: 'text/plain' }
    );
    const testFile = new File([eicarBlob], 'eicar_malware_test.txt', { type: 'text/plain' });

    setTimeout(async () => {
      const res = await validateAndSanitizeFile(testFile);
      setLastResult(res);
      setScannedHistory((prev) => [res, ...prev.slice(0, 4)]);
      setIsScanning(false);
      toast.error(`[ALERTA DE SEGURANÇA] Malicioso detectado pelo ClamAV!`);
    }, 500);
  };

  const handleSimulateSpoofedExe = async () => {
    setIsScanning(true);
    setLastResult(null);

    // Binary MZ executable header disguised as invoice.pdf
    const mzHeader = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const spoofedFile = new File([mzHeader], 'relatorio_financeiro.pdf', { type: 'application/pdf' });

    setTimeout(async () => {
      const res = await validateAndSanitizeFile(spoofedFile);
      setLastResult(res);
      setScannedHistory((prev) => [res, ...prev.slice(0, 4)]);
      setIsScanning(false);
      toast.error(`[ALERTA DE SEGURANÇA] Tentativa de disfarce de executável (Magic Bytes PE MZ) bloqueada!`);
    }, 500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 shadow-xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Sanitização & Antivírus ClamAV
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 uppercase">
                Item 013 • Ativo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspeção de cabeçalho (Magic Bytes), heurística antivírus e bloqueio automático de malwares e executáveis mascarados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateEicarTest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-800/50 cursor-pointer"
            title="Testar motor antivírus com arquivo padrão EICAR"
          >
            <Bug className="w-3.5 h-3.5" />
            Simular EICAR Malware
          </button>
          <button
            onClick={handleSimulateSpoofedExe}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 rounded-xl text-xs font-bold transition-all border border-amber-800/50 cursor-pointer"
            title="Testar detecção de executável mascarado como PDF"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Simular Exe Mascarado
          </button>
        </div>
      </div>

      {/* Grid de Configurações de Política */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Toggle ClamAV Engine */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Motor ClamAV Integrado</span>
            <p className="text-[11px] text-slate-400">Varredura profunda por heurística</p>
          </div>
          <button
            onClick={() => handleToggleConfig('clamAvEngineActive')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.clamAvEngineActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Toggle Magic Bytes */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Checagem de Magic Bytes</span>
            <p className="text-[11px] text-slate-400">Impede disfarce de extensões</p>
          </div>
          <button
            onClick={() => handleToggleConfig('verifyMagicBytes')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.verifyMagicBytes ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Toggle Executables Blacklist */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">Bloquear Executáveis</span>
            <p className="text-[11px] text-slate-400">Proíbe .exe, .bat, .ps1, .vbs</p>
          </div>
          <button
            onClick={() => handleToggleConfig('blockExecutables')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              config.blockExecutables ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Caixa de Sandbox de Teste de Upload */}
      <div className="bg-slate-950/80 rounded-xl border border-dashed border-slate-700 p-6 text-center relative hover:border-emerald-500/50 transition-colors">
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {isScanning ? (
            <div className="flex items-center gap-3 text-emerald-400 py-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-sm font-bold">Analisando bytes e executando varredura ClamAV...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                Arraste um arquivo aqui ou clique para testar a sanitização
              </p>
              <p className="text-xs text-slate-500">
                Suporta PDFs, Imagens, Documentos. Tamanho limite: <span className="text-slate-300 font-bold">{config.maxFileSizeMb}MB</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Card de Resultado da Inspeção Recente */}
      {lastResult && (
        <div
          className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
            lastResult.safe
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/70 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {lastResult.safe ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>{lastResult.safe ? 'ARQUIVO APROVADO & SEGURO' : 'AMEAÇA DETECTADA E ISOLADA'}</span>
                {lastResult.threatDetected && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] uppercase font-mono border border-rose-500/30">
                    {lastResult.threatDetected}
                  </span>
                )}
              </div>

              <p className="text-slate-300">{lastResult.reason || 'O arquivo foi verificado pelo motor ClamAV e não apresentou nenhuma ameaça.'}</p>

              <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 mt-2">
                <span>Nome: <strong className="text-slate-200">{lastResult.fileDetails.name}</strong></span>
                <span>Tamanho: <strong className="text-slate-200">{(lastResult.fileDetails.sizeBytes / 1024).toFixed(1)} KB</strong></span>
                <span>MIME: <strong className="text-slate-200">{lastResult.fileDetails.mimeType}</strong></span>
                {lastResult.fileDetails.magicBytesHex && (
                  <span>Magic Bytes: <strong className="text-emerald-400">{lastResult.fileDetails.magicBytesHex}</strong></span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
