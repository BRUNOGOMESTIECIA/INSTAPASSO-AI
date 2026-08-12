import React, { useState } from 'react';
import { Languages, Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from '../../lib/audit-logger';

export type TargetLanguage = 'pt' | 'en' | 'es';

interface ChatAutoTranslationToggleWidgetProps {
  isEnabled: boolean;
  targetLang: TargetLanguage;
  onToggle: (enabled: boolean) => void;
  onChangeLang: (lang: TargetLanguage) => void;
}

const LANG_OPTIONS: { id: TargetLanguage; label: string; flag: string }[] = [
  { id: 'pt', label: 'Português (PT)', flag: '🇧🇷' },
  { id: 'en', label: 'English (EN)', flag: '🇺🇸' },
  { id: 'es', label: 'Español (ES)', flag: '🇪🇸' },
];

/**
 * Tradutor Simulado por IA em Tempo Real
 */
export function translateMessageWithAi(text: string, targetLang: TargetLanguage): string {
  if (!text || text.startsWith('[') || text.startsWith('🤖')) return text;

  if (targetLang === 'en') {
    if (text.toLowerCase().includes('olá') || text.toLowerCase().includes('bom dia')) return 'Hello! How can I assist you today?';
    if (text.toLowerCase().includes('senha') || text.toLowerCase().includes('acesso')) return 'I need help resetting my password and system access.';
    if (text.toLowerCase().includes('impressora')) return 'The office printer is offline and not printing documents.';
    if (text.toLowerCase().includes('erro') || text.toLowerCase().includes('lentidão')) return 'We are experiencing system slowness and database timeout error.';
    return `[AI Translated EN]: ${text}`;
  }

  if (targetLang === 'es') {
    if (text.toLowerCase().includes('olá') || text.toLowerCase().includes('bom dia')) return '¡Hola! ¿Cómo puedo ayudarte hoy?';
    if (text.toLowerCase().includes('senha') || text.toLowerCase().includes('acesso')) return 'Necesito ayuda para restabelecer mi contraseña y acceso al sistema.';
    if (text.toLowerCase().includes('impressora')) return 'La impresora de la oficina está fuera de línea y no imprime.';
    if (text.toLowerCase().includes('erro') || text.toLowerCase().includes('lentidão')) return 'Estamos experimentando lentitud en el sistema y error de tiempo de espera.';
    return `[AI Translated ES]: ${text}`;
  }

  // Se o idioma alvo for PT e o texto parecer inglês/espanhol
  if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) return 'Olá! Em que posso ajudar você hoje?';
  if (text.toLowerCase().includes('password') || text.toLowerCase().includes('access')) return 'Preciso de ajuda para redefinir minha senha de acesso ao sistema.';
  if (text.toLowerCase().includes('printer')) return 'A impressora do escritório está offline e não imprime.';
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('slowness')) return 'Estamos enfrentando lentidão no sistema e erro de timeout.';

  return `[Traduzido IA PT]: ${text}`;
}

export function ChatAutoTranslationToggleWidget({
  isEnabled,
  targetLang,
  onToggle,
  onChangeLang,
}: ChatAutoTranslationToggleWidgetProps) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const activeLangOption = LANG_OPTIONS.find((l) => l.id === targetLang) || LANG_OPTIONS[0];

  const handleToggle = () => {
    const nextState = !isEnabled;
    onToggle(nextState);

    logAuditEvent(
      'CHAT_TRANSLATION_TOGGLED',
      `Auto-tradução multilíngue em tempo real ${nextState ? 'ACTIVADA' : 'DESACTIVADA'} (Idioma Alvo: ${targetLang.toUpperCase()}).`
    );

    if (nextState) {
      toast.success(`🌐 Auto-tradução multilíngue ATIVADA para ${activeLangOption.label}!`);
    } else {
      toast.info('🌐 Auto-tradução DESATIVADA.');
    }
  };

  return (
    <div className="relative flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 shadow-sm text-xs">
      {/* Botão de Toggle Liga/Desliga */}
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
          isEnabled
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
        title="Ativar/Desativar Auto-tradução Multilíngue por IA (Item 072)"
      >
        <Globe className={`w-3.5 h-3.5 ${isEnabled ? 'animate-pulse text-amber-300' : 'text-slate-400'}`} />
        <span>🌐 Auto-Tradução: {isEnabled ? 'LIGADO' : 'DESLIGADO'}</span>
      </button>

      {/* Seletor de Idioma */}
      {isEnabled && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            className="px-2 py-1 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-lg text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{activeLangOption.flag}</span>
            <span className="uppercase">{activeLangOption.id}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOpenMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                Traduzir Mensagens para:
              </div>
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChangeLang(opt.id);
                    setIsOpenMenu(false);
                    toast.success(`Idioma de tradução alterado para ${opt.label}`);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    targetLang === opt.id
                      ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                  {targetLang === opt.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
