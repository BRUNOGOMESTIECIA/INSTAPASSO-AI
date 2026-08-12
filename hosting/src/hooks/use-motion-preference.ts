import { useState, useEffect } from 'react';

export type MotionMode = 'smooth' | 'fast' | 'reduced';

const STORAGE_KEY = 'portal_motion_preference';

/**
 * 🎨 Hook do Item 094: Gestão de Animações e Micro-interações
 */
export function useMotionPreference() {
  const [motionMode, setMotionModeState] = useState<MotionMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as MotionMode | null;
      if (saved && ['smooth', 'fast', 'reduced'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // Fallback
    }

    // Detecção automática de acessibilidade do SO
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'reduced';
    }

    return 'smooth';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, motionMode);
    } catch (e) {
      console.warn('[Motion] Não foi possível salvar preferência:', e);
    }

    // Aplica classe global no html/root
    const root = document.documentElement;
    root.classList.remove('motion-smooth', 'motion-fast', 'motion-reduced');
    root.classList.add(`motion-${motionMode}`);
  }, [motionMode]);

  const setMotionMode = (mode: MotionMode) => {
    setMotionModeState(mode);
  };

  /**
   * Retorna a classe CSS de animação ajustada ao modo selecionado
   */
  const getPageTransitionClass = (): string => {
    if (motionMode === 'reduced') return '';
    if (motionMode === 'fast') return 'animate-in fade-in duration-100';
    return 'animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out';
  };

  const getMicroInteractionClass = (type: 'hover' | 'press' | 'pulse' | 'zoom'): string => {
    if (motionMode === 'reduced') return '';

    switch (type) {
      case 'hover':
        return motionMode === 'fast' 
          ? 'hover:brightness-105 transition-all duration-100'
          : 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out';
      case 'press':
        return 'active:scale-95 transition-transform duration-100';
      case 'pulse':
        return motionMode === 'fast' ? 'animate-pulse' : 'animate-pulse duration-1000';
      case 'zoom':
        return motionMode === 'fast' 
          ? 'animate-in zoom-in-95 duration-100'
          : 'animate-in zoom-in-95 fade-in duration-200 ease-out';
      default:
        return '';
    }
  };

  return {
    motionMode,
    setMotionMode,
    getPageTransitionClass,
    getMicroInteractionClass,
  };
}
