// =============================================================================
// Sintetizador de Efeitos Sonoros de Atendimento via Web Audio API + Som Personalizado
// =============================================================================

export type AlertTone = 'chime' | 'bell' | 'pop' | 'pulse' | 'custom';

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 a 100
  tone: AlertTone;
  customAudioUrl?: string; // Data URL Base64 do arquivo de áudio próprio (.mp3, .wav, .ogg)
  customFileName?: string;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 80,
  tone: 'chime'
};

export function getSoundSettings(): SoundSettings {
  try {
    const saved = localStorage.getItem('portal_sound_settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export function saveSoundSettings(settings: Partial<SoundSettings>): SoundSettings {
  const current = getSoundSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem('portal_sound_settings', JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playAlertSound(customTone?: AlertTone, customVolume?: number) {
  const settings = getSoundSettings();
  if (!customTone && !settings.enabled) return;

  const tone = customTone || settings.tone;
  const volumePercent = customVolume !== undefined ? customVolume : settings.volume;
  const masterVolume = Math.max(0, Math.min(1, volumePercent / 100));

  // Toca arquivo próprio personalizado se selecionado
  if (tone === 'custom' && settings.customAudioUrl) {
    try {
      const audio = new Audio(settings.customAudioUrl);
      audio.volume = masterVolume;
      audio.play().catch((e) => console.warn('Erro ao tocar áudio personalizado:', e));
      return;
    } catch (e) {
      console.warn('Erro ao carregar áudio personalizado, usando tom padrão:', e);
    }
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(masterVolume * 0.4, now); // cap at 0.4 for synth comfort
  masterGain.connect(ctx.destination);

  switch (tone === 'custom' ? 'chime' : tone) {
    case 'chime': {
      // Tom suave ITSM: Duas notas ascendentes (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.6, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12); // B5
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.8, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
      break;
    }

    case 'bell': {
      // Campainha de balcão (A5 rico em harmônicos)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.8);
      break;
    }

    case 'pop': {
      // Pop rápido e limpo para mensagens
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }

    case 'pulse': {
      // Alerta duplo urgente
      [0, 0.15].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(783.99, now + delay); // G5
        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
      break;
    }
  }
}

/**
 * Toca efeito sonoro diferenciado de acordo com o nível / prioridade
 */
export function playLevelSound(level: 'N1' | 'N2' | 'N3' | 'critical' | 'chat') {
  switch (level) {
    case 'N1':
    case 'chat':
      playAlertSound('chime');
      break;
    case 'N2':
    case 'N3':
      playAlertSound('bell');
      break;
    case 'critical':
      playAlertSound('pulse');
      break;
    default:
      playAlertSound('chime');
  }
}
