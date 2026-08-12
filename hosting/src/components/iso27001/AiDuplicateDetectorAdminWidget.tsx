import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, Sliders, Play, RefreshCw, Zap, ShieldCheck, Link } from 'lucide-react';
import { getDuplicateDetectorConfig, saveDuplicateDetectorConfig, checkForDuplicateRequests, getDuplicateMetrics, type DuplicateMatchResult } from '../../lib/ai-duplicate-detector';
import { AiDuplicateTicketAlertModal } from '../tickets/AiDuplicateTicketAlertModal';
import { toast } from 'sonner';

/**
 * 🤖 Widget do Item 074: Gestão e Teste ao Vivo da Detecção de Duplicidade por IA
 */
export function AiDuplicateDetectorAdminWidget() {
  const [config, setConfig] = useState(getDuplicateDetectorConfig());
  const [metrics, setMetrics] = useState(getDuplicateMetrics());

  // Test Simulator State
  const [testTitle, setTestTitle] = useState('Não consigo acessar o ERP corporativo (Erro Timeout)');
  const [testDescription, setTestDescription] = useState('SISTEMA FORA DO AR: Mensagem de timeout na porta 443 ao tentar logar.');
  const [testEmail, setTestEmail] = useState('carlos.mendes@clienteb2b.com.br');
  const [matchResult, setMatchResult] = useState<DuplicateMatchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveConfig = (newWindow: number, newSimilarity: number) => {
    const updated = {
      ...config,
      timeWindowMinutes: newWindow,
      similarityThresholdPercent: newSimilarity,
    };
    setConfig(updated);
    saveDuplicateDetectorConfig(updated);
    toast.success('Parâmetros da IA de duplicidade salvos!');
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);

    try {
      const res = await checkForDuplicateRequests(testTitle, testDescription, testEmail);
      setMatchResult(res);
      setIsTesting(false);

      if (res.isDuplicate) {
        setIsModalOpen(true);
        toast.warning(`IA Detectou ${res.confidencePercent}% de semelhança com o ticket ${res.existingTicketId}!`);
      } else {
        toast.info('Nenhuma solicitação duplicada detectada na janela recente.');
      }
    } catch (err) {
      toast.error('Erro ao testar duplicidade.');
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Detecção de Duplicidade de Solicitações por IA
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Item 074
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identificação de chamados idênticos em menos de 10 minutos com cálculo de semelhança semântica (% Match).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-amber-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          IA Duplicidade: ATIVA
        </span>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duplicados Bloqueados</p>
            <p className="text-sm font-black text-white">{metrics.totalDuplicatesBlocked} Chamados</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Precisão Média IA</p>
            <p className="text-sm font-black text-amber-300">{metrics.averageSimilarity}% de Match</p>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Horas de N1 Poupadas</p>
            <p className="text-sm font-black text-emerald-400">{metrics.timeSavedHours}h Economizadas</p>
          </div>
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Controles de Sensibilidade */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Parâmetros de Sensibilidade da IA
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Janela de Tempo Limite:</span>
              <span className="text-amber-400 font-mono">{config.timeWindowMinutes} minutos</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={config.timeWindowMinutes}
              onChange={(e) => handleSaveConfig(Number(e.target.value), config.similarityThresholdPercent)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Corte de Semelhança Mínima:</span>
              <span className="text-amber-400 font-mono">{config.similarityThresholdPercent}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={config.similarityThresholdPercent}
              onChange={(e) => handleSaveConfig(config.timeWindowMinutes, Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Simulador ao Vivo de Ticket Duplicado */}
      <form onSubmit={handleRunSimulation} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Simulador de Duplicidade ao Vivo (&lt; 10 min)
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Título do Novo Ticket a Testar</label>
            <input
              type="text"
              required
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Descrição do Problema</label>
            <textarea
              rows={2}
              required
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 font-mono">
            ℹ️ O simulador irá comparar este chamado com o ticket #20261048 aberto há 4 minutos.
          </p>

          <button
            type="submit"
            disabled={isTesting}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Simular Abertura de Ticket Duplicado em &lt; 10min
          </button>
        </div>
      </form>

      {/* Modal de Alerta Visual */}
      <AiDuplicateTicketAlertModal
        isOpen={isModalOpen}
        matchResult={matchResult}
        onClose={() => setIsModalOpen(false)}
        onMerge={(existingId) => {
          setIsModalOpen(false);
          toast.success(`Ticket mesclado com sucesso ao chamado ${existingId}!`);
        }}
        onCancelDuplicate={() => {
          setIsModalOpen(false);
          toast.info('Abertura de ticket duplicado cancelada.');
        }}
        onProceedAnyway={() => {
          setIsModalOpen(false);
          toast.warning('Ticket mantido e aberto no sistema.');
        }}
      />
    </div>
  );
}
