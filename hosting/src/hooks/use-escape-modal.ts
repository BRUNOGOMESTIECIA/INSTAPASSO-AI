import { useEffect, useRef } from 'react';

const modalStack: { id: string; close: () => void }[] = [];

export function useEscapeModal(isOpen: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = Math.random().toString(36).substring(2, 9);
    
    const modalItem = { 
      id, 
      close: () => closeRef.current() 
    };
    modalStack.push(modalItem);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const topModal = modalStack[modalStack.length - 1];
        if (topModal && topModal.id === id) {
          e.preventDefault();
          e.stopPropagation();
          topModal.close();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const index = modalStack.findIndex((m) => m.id === id);
      if (index !== -1) {
        modalStack.splice(index, 1);
      }
    };
  }, [isOpen]);
}
