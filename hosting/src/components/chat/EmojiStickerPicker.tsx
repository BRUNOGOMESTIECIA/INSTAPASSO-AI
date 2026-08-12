import React, { useState, useRef, useEffect } from 'react';
import { Smile, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface EmojiStickerPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (stickerText: string) => void;
  disabled?: boolean;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Atendimento & Expressões',
    emojis: ['👍', '👋', '✅', '❤️', '😊', '🚀', '⭐', '💡', '⚠️', '🎯', '🔒', '🤝', '🙌', '🙏', '💻', '📞']
  },
  {
    name: 'Status & Reações',
    emojis: ['🎉', '🔥', '👀', '💯', '📌', '⌛', '🔔', '❌', '➡️', '✨', '⚡', '🛠️', '🛡️', '📊', '💬', '❓']
  }
];

const STICKERS = [
  { id: 'stk_1', label: '👋 Olá! Como posso ajudar?', category: 'Saudação' },
  { id: 'stk_2', label: '🔎 Em análise pela nossa equipe', category: 'Status' },
  { id: 'stk_3', label: '⏳ Aguardando retorno do cliente', category: 'Status' },
  { id: 'stk_4', label: '✅ Solicitação resolvida com sucesso!', category: 'Status' },
  { id: 'stk_5', label: '🙏 Muito obrigado pelo contato!', category: 'Finalização' },
  { id: 'stk_6', label: '🛠️ Transferindo para o suporte avançado N2', category: 'Escalação' },
];

const GIF_STICKERS = [
  { 
    id: 'gif_1', 
    title: '👋 Olá / Bem-vindo', 
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHY5aDV3aHJjc2t1dDJ1eXJicGNocjEzcnU0cnpzMXNlOXAxaGJpZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dzaUX7CAG0Ihi/giphy.gif' 
  },
  { 
    id: 'gif_2', 
    title: '👍 Tudo Certo / Ok', 
    url: 'https://media.giphy.com/media/131tYQapOdbN3G/giphy.gif' 
  },
  { 
    id: 'gif_3', 
    title: '🚀 Sucesso / Resolvido', 
    url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' 
  },
  { 
    id: 'gif_4', 
    title: '💻 Analisando Suporte', 
    url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif' 
  },
  { 
    id: 'gif_5', 
    title: '🙏 Muito Obrigado!', 
    url: 'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif' 
  },
  { 
    id: 'gif_6', 
    title: '💡 Solução / Ideia', 
    url: 'https://media.giphy.com/media/l0Iyl55kTeh71nTXy/giphy.gif' 
  }
];

export function EmojiStickerPicker({ onSelectEmoji, onSelectSticker, disabled }: EmojiStickerPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'emoji' | 'sticker' | 'gif'>('emoji');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fecha o picker ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Emojis, Figurinhas e GIFs Animados"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">
          {/* Header com Abas */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTab('emoji')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  tab === 'emoji'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                😊 Emojis
              </button>
              <button
                type="button"
                onClick={() => setTab('sticker')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  tab === 'sticker'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Texto
              </button>
              <button
                type="button"
                onClick={() => setTab('gif')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  tab === 'gif'
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3 h-3" /> GIFs Animados
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-3 max-h-64 overflow-y-auto">
            {tab === 'emoji' && (
              <div className="space-y-3">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      {cat.name}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onSelectEmoji(emoji);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'sticker' && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Respostas Rápidas em Figurinha
                </p>
                {STICKERS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => {
                      onSelectSticker(stk.label);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between gap-2"
                  >
                    <span>{stk.label}</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shrink-0">
                      {stk.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'gif' && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Figurinhas Animadas (GIFs)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {GIF_STICKERS.map((gif) => (
                    <button
                      key={gif.id}
                      type="button"
                      onClick={() => {
                        onSelectSticker(`[GIF: ${gif.title}](${gif.url})`);
                        setIsOpen(false);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-pink-500 transition-all bg-slate-100 dark:bg-slate-900 h-24 flex items-center justify-center p-1"
                    >
                      <img 
                        src={gif.url} 
                        alt={gif.title} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 text-center">
                        <span className="text-[10px] font-bold text-white tracking-tight drop-shadow">
                          {gif.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
