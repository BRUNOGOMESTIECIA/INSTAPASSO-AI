import React, { useState } from 'react';
import { Sparkles, Zap, EyeOff, CheckCircle2, Play, MousePointer, ShieldAlert, Layers } from 'lucide-react';
import { useMotionPreference, type MotionMode } from '../../hooks/use-motion-preference';
import { toast } from 'sonner';

/**
 * 🎨 Widget do Item 094: Painel de Animações e Micro-interações
 */
export function MotionPreferenceWidget() {
  const { motionMode, setMotionMode, getMicroInteractionClass } = useMotionPreference();
  const [testPulse, setTestPulse] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleModeChange = (mode: MotionMode) => {
    setMotionMode(mode);
    const labels: Record<MotionMode, string> = {
      smooth: 'Modo Ultra-Fluído 60fps ativado!',
      fast: 'Modo Direto & Rápido ativado!',
      reduced: 'Modo Acessível (Redução de Movimento) ativado!',
    };
    toast.success(labels[mode]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Animações de Transição de Tela e Micro-interações
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Item 094
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transições de página de 60fps, feedbacks visuais táteis e suporte a acessibilidade LGPD.
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-purple-300">
          Modo Ativo: {motionMode.toUpperCase()}
        </span>
      </div>

      {/* Seletor de Intensidade de Movimento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Opção 1: Smooth 60fps */}
        <button
          onClick={() => handleModeChange('smooth')}
          className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all cursor-pointer ${
            motionMode === 'smooth'
              ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Sparkles className={`w-5 h-5 ${motionMode === 'smooth' ? 'text-purple-400' : 'text-slate-500'}`} />
            {motionMode === 'smooth' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100">🚀 Ultra-Fluído (60fps)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Animações completas de entrada, deslize e micro-interações de alta fidelidade.
            </p>
          </div>
        </button>

        {/* Opção 2: Fast */}
        <button
          onClick={() => handleModeChange('fast')}
          className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all cursor-pointer ${
            motionMode === 'fast'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Zap className={`w-5 h-5 ${motionMode === 'fast' ? 'text-blue-400' : 'text-slate-500'}`} />
            {motionMode === 'fast' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100">⚡ Direto & Rápido</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Transições ultra-rápidas e curtas para máxima velocidade de navegação.
            </p>
          </div>
        </button>

        {/* Opção 3: Reduced */}
        <button
          onClick={() => handleModeChange('reduced')}
          className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all cursor-pointer ${
            motionMode === 'reduced'
              ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <EyeOff className={`w-5 h-5 ${motionMode === 'reduced' ? 'text-amber-400' : 'text-slate-500'}`} />
            {motionMode === 'reduced' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100">♿ Reduzido (Acessível)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Sem movimento excessivo (`prefers-reduced-motion` LGPD / Acessibilidade).
            </p>
          </div>
        </button>
      </div>

      {/* Laboratório de Testes de Micro-Interações */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-purple-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Demonstração ao Vivo de Micro-interações
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Passe o mouse ou clique para testar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Teste 1: Hover Elevate */}
          <div className={`p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer select-none ${getMicroInteractionClass('hover')}`}>
            <p className="text-[10px] uppercase font-bold text-purple-400 mb-1">Hover Elevate</p>
            <p className="text-xs font-bold text-white">Elevação Tátil</p>
            <p className="text-[11px] text-slate-400 mt-1">Subida suave com sombra de destaque.</p>
          </div>

          {/* Teste 2: Click Press */}
          <button 
            className={`p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-left font-bold cursor-pointer border border-purple-400/30 ${getMicroInteractionClass('press')}`}
          >
            <p className="text-[10px] uppercase font-bold text-purple-200 mb-1">Click Press</p>
            <p className="text-xs font-bold">Feedback de Clique</p>
            <p className="text-[11px] text-purple-100/80 mt-1">Efeito tátil de pressão (scale-95).</p>
          </button>

          {/* Teste 3: Pulse SLA Warning */}
          <div 
            onClick={() => setTestPulse(!testPulse)}
            className={`p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl cursor-pointer select-none ${
              testPulse ? getMicroInteractionClass('pulse') : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase font-bold text-rose-400">SLA Pre-Breach Pulse</p>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-xs font-bold text-rose-200">Pulso de Emergência</p>
            <p className="text-[11px] text-rose-300/80 mt-1">
              {testPulse ? 'Pulsando ao vivo (90% SLA)...' : 'Clique para simular alarme SLA.'}
            </p>
          </div>

          {/* Teste 4: Modal Spring Zoom */}
          <button 
            onClick={() => setShowDemoModal(true)}
            className={`p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-left rounded-xl cursor-pointer ${getMicroInteractionClass('hover')} ${getMicroInteractionClass('press')}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase font-bold text-blue-400">Modal Spring Zoom</p>
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-white">Expansão de Modal</p>
            <p className="text-[11px] text-slate-400 mt-1">Testar abertura com animação de zoom.</p>
          </button>
        </div>
      </div>

      {/* Modal de Teste de Animação */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ${getMicroInteractionClass('zoom')}`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Modal Animação 60fps</h4>
                <p className="text-xs text-slate-400">Efeito spring zoom-in ativado com sucesso.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Todas as janelas modais do Portal ITSM e InstaPasso utilizam essa mesma curva de aceleração fluída.
            </p>

            <button
              onClick={() => setShowDemoModal(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Fechar Demonstração
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
