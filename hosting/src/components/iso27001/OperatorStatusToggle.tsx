import React, { useState, useRef, useEffect } from 'react';
import { useOperatorStatus, STATUS_CONFIGS, type OperatorPresenceStatus } from '../../hooks/use-operator-status';
import { ChevronDown, Coffee, Utensils, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useEscapeModal } from '../../hooks/use-escape-modal';

export function OperatorStatusToggle() {
  const { status, setStatus, config } = useOperatorStatus();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEscapeModal(isOpen, () => setIsOpen(false));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão Pill do Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 ${config.badgeBg} transition-all duration-200 hover:scale-105 shadow-sm cursor-pointer`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {status === 'online' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotColor}`}></span>
        </span>

        <span className={`text-xs font-bold ${config.badgeText}`}>
          {config.label}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 ${config.badgeText} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Suspenso de Seleção de Status */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[999] p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Status de Presença no Atendimento (Item 120)
            </p>
          </div>

          <div className="py-1 space-y-1">
            {(Object.keys(STATUS_CONFIGS) as OperatorPresenceStatus[]).map((key) => {
              const item = STATUS_CONFIGS[key];
              const isSelected = status === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setStatus(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight flex items-center justify-between">
                      {item.label.replace(/^[^\s]+\s/, '')}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
