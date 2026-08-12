import React, { useState } from 'react';
import { Eye, Sparkles, Terminal, Copy, Check, ShieldCheck, Image as ImageIcon, AlertTriangle, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

export interface OcrErrorDetectionResult {
  imageUrl?: string;
  imageName: string;
  extractedErrorText: string;
  errorCode: string;
  severity: 'alta' | 'média' | 'crítica';
  aiDiagnosis: string;
  recommendedSteps: string[];
}

interface AiImageErrorOcrWidgetProps {
  ticketId?: string;
  protocolNumber?: string;
  initialResult?: OcrErrorDetectionResult;
  onApplyDiagnosis?: (text: string) => void;
  readOnly?: boolean;
}

const DEFAULT_OCR_RESULT: OcrErrorDetectionResult = {
  imageName: 'print_erro_sistema_erp.png',
  extractedErrorText: 'FATAL ERROR 0x80040154: Connection reset by peer at PostgreSQL 10.0.0.15:5432. Exception in thread "main" java.sql.SQLException: Socket closed.',
  errorCode: 'DB_CONNECTION_TIMEOUT (0x80040154)',
  severity: 'crítica',
  aiDiagnosis: 'Visão Computacional detectou falha grave de conexão na porta 5432 do banco de dados PostgreSQL. O serviço no servidor 10.0.0.15 não está respondendo às solicitações de socket.',
  recommendedSteps: [
    'Executar teste de conectividade: ping 10.0.0.15',
    'Verificar status do serviço no servidor: systemctl status postgresql',
    'Validar se a regra de firewall da porta 5432 foi alterada.',
  ],
};

export function AiImageErrorOcrWidget({
  ticketId,
  protocolNumber = '1073',
  initialResult = DEFAULT_OCR_RESULT,
  onApplyDiagnosis,
  readOnly = false,
}: AiImageErrorOcrWidgetProps) {
  const [result, setResult] = useState<OcrErrorDetectionResult>(initialResult);
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const formattedProtocol = formatTicketProtocol(protocolNumber);

  const handleCopy = () => {
    const formatted = `📸 [Diagnóstico por IA do Print "${result.imageName}"]:\n` +
      `• Código do Erro: ${result.errorCode}\n` +
      `• Texto Extraído no Print (OCR): "${result.extractedErrorText}"\n` +
      `• Diagnóstico da IA: ${result.aiDiagnosis}\n` +
      `• Ações Recomendadas:\n  - ${result.recommendedSteps.join('\n  - ')}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (onApplyDiagnosis) onApplyDiagnosis(formatted);

    logAuditEvent(
      'AI_IMAGE_OCR_ANALYZED',
      `Diagnóstico OCR de imagem "${result.imageName}" (${result.errorCode}) copiado para o chamado ${formattedProtocol}.`
    );

    toast.success('Diagnóstico do print copiado com sucesso!');
  };

  const handleReScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success('Visão Computacional concluiu a re-análise do print!');
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 text-slate-100 space-y-3.5 shadow-2xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              Leitura de Prints & OCR de Código por IA
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 073
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Análise de Visão Computacional para identificar códigos de erro em capturas de tela.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReScan}
          disabled={isScanning}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          {isScanning ? 'Analisando...' : 'Re-Analisar Image'}
        </button>
      </div>

      {/* Card da Imagem Analisada com Badge OCR */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>{result.imageName}</span>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Severidade: {result.severity.toUpperCase()}
          </span>
        </div>

        {/* Texto Extraído (OCR Box) */}
        <div className="bg-black p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-emerald-400 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">
            🔍 Texto Extraído do Print (OCR Detector):
          </span>
          <p className="leading-relaxed bg-emerald-950/20 p-1.5 rounded border border-emerald-900/40">
            {result.extractedErrorText}
          </p>
        </div>

        {/* Diagnóstico da IA */}
        <div className="space-y-1 pt-1">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Diagnóstico da IA:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{result.aiDiagnosis}</p>
        </div>

        {/* Passos Recomendados */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-blue-400" /> Ações Técnicas Recomendadas:
          </span>
          <ul className="space-y-1 pl-1">
            {result.recommendedSteps.map((step, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      {!readOnly && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Diagnóstico Copiado!' : 'Copiar Diagnóstico do Print'}
          </button>
        </div>
      )}
    </div>
  );
}
