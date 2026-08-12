import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logAuditEvent } from '../lib/audit-logger';

export interface ShortcutHandlers {
  onReply?: () => void;
  onCloseTicket?: () => void;
  onAssign?: () => void;
  onAddNote?: () => void;
}

/**
 * Hook de Atalhos de Teclado Operacionais Seguros (Item 093)
 * Utiliza tecla modificadora (Alt + Tecla) e bloqueio estrito quando o usuário digita em inputs.
 */
export function useOperationalShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const [isShortcutsEnabled, setIsShortcutsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('itsm_shortcuts_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleShortcuts = (state?: boolean) => {
    const nextState = state !== undefined ? state : !isShortcutsEnabled;
    setIsShortcutsEnabled(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('itsm_shortcuts_enabled', String(nextState));
    }
    toast.info(`⌨️ Atalhos operacionais (Alt+R, Alt+F, Alt+A) ${nextState ? 'ATIVADOS' : 'DESATIVADOS'}.`);
  };

  useEffect(() => {
    if (!enabled || !isShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 🛡️ Filtro de Segurança Estrito: Ignora atalhos se o cursor estiver digitando em um input ou textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      // Atalho Alt + R: Focar na caixa de resposta
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        if (handlers.onReply) {
          handlers.onReply();
          toast.success('⌨️ [Alt + R] Foco na caixa de resposta!');
          logAuditEvent('OPERATIONAL_SHORTCUT_TRIGGERED', 'Atalho Alt+R (Responder) acionado.');
        }
      }

      // Atalho Alt + F: Encerrar / Fechar ticket
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (handlers.onCloseTicket) {
          handlers.onCloseTicket();
          toast.success('⌨️ [Alt + F] Ação de fechamento de ticket!');
          logAuditEvent('OPERATIONAL_SHORTCUT_TRIGGERED', 'Atalho Alt+F (Fechar Ticket) acionado.');
        }
      }

      // Atalho Alt + A: Reatribuir ticket
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (handlers.onAssign) {
          handlers.onAssign();
          toast.success('⌨️ [Alt + A] Reatribuição de responsável!');
          logAuditEvent('OPERATIONAL_SHORTCUT_TRIGGERED', 'Atalho Alt+A (Reatribuir) acionado.');
        }
      }

      // Atalho Alt + N: Adicionar nota interna confidencial
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        if (handlers.onAddNote) {
          handlers.onAddNote();
          toast.success('⌨️ [Alt + N] Foco na nota interna!');
          logAuditEvent('OPERATIONAL_SHORTCUT_TRIGGERED', 'Atalho Alt+N (Nota Interna) acionado.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isShortcutsEnabled, handlers]);

  return {
    isShortcutsEnabled,
    toggleShortcuts,
  };
}
