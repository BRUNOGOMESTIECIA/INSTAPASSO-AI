import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert, PauseCircle } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { isSlaPausedNow } from '../../lib/business-hours-sla';

interface SlaCountdownBarProps {
  dueIsoString: string;
  createdIsoString?: string;
  status: string;
  compact?: boolean;
  showProgressBar?: boolean;
}

/**
 * Componente SlaCountdownBar
 * Exibe um temporizador regressivo ao vivo (atualizado a cada 1 segundo) com:
 * 1. Mudança de cor dinâmica:
 *    - Verde (SLA em dia > 50%)
 *    - Amarelo (SLA atenção < 50% ou < 1h)
 *    - Vermelho Piscar (SLA Crítico < 15 min ou Estourado)
 * 2. Barra de progresso percentual visual
 * 3. Formatação em horas/minutos/segundos
 */
export default function SlaCountdownBar({
  dueIsoString,
  createdIsoString,
  status,
  compact = false,
  showProgressBar = true,
}: SlaCountdownBarProps) {
  const [now, setNow] = useState<Date>(new Date());

  // Atualização em Tempo Real (Tick a cada 1 segundo)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isResolved = status === 'resolved' || status === 'closed';
  const dueDate = new Date(dueIsoString);
  const createdDate = createdIsoString ? new Date(createdIsoString) : new Date(dueDate.getTime() - 4 * 3600 * 1000);
  const pauseInfo = isSlaPausedNow(now);

  // Se já resolvido
  if (isResolved) {
    if (compact) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>SLA Cumprido</span>
        </div>
      );
    }
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SLA Cumprido
          </span>
          <span>100%</span>
        </div>
        <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-full" />
        </div>
      </div>
    );
  }

  // Se SLA estiver Pausado (Final de Semana, Feriado ou Fora do Expediente - Item 121)
  if (pauseInfo.isPaused) {
    if (compact) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700" title={pauseInfo.label}>
          <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>SLA Pausado</span>
        </div>
      );
    }
    return (
      <div className="w-full space-y-1 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
          <span className="flex items-center gap-1.5">
            <PauseCircle className="w-4 h-4 text-amber-500" /> {pauseInfo.label}
          </span>
          <span className="text-[10px] uppercase font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded">Congelado</span>
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-400">
          A contagem será retomada automaticamente no próximo dia útil às 08h00.
        </p>
      </div>
    );
  }

  const diffSeconds = differenceInSeconds(dueDate, now);
  const totalDurationSeconds = Math.max(1, differenceInSeconds(dueDate, createdDate));
  const elapsedSeconds = Math.max(0, totalDurationSeconds - diffSeconds);
  const percentageUsed = Math.min(100, Math.max(0, Math.round((elapsedSeconds / totalDurationSeconds) * 100)));

  const isBreached = diffSeconds <= 0;
  const absSeconds = Math.abs(diffSeconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const formattedTime = hours > 0
    ? `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
    : `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  // Define Nível de Urgência (Item 122 - Pre-Breach Warning a 90%)
  let tier: 'normal' | 'warning' | 'pre_breach' | 'critical' | 'breached' = 'normal';
  if (isBreached) {
    tier = 'breached';
  } else if (diffSeconds < 900 || percentageUsed >= 90) { // < 15 minutos ou >= 90% do SLA
    tier = 'pre_breach';
  } else if (diffSeconds < 1800) { // < 30 minutos
    tier = 'critical';
  } else if (diffSeconds < 3600 || percentageUsed >= 50) { // < 1 hora ou > 50% tempo gasto
    tier = 'warning';
  }

  // Estilos visuais por tier
  const tierStyles = {
    normal: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: <Clock className="w-3.5 h-3.5 text-emerald-500" />,
      bar: 'bg-emerald-500',
      badgeText: `Em dia: ${formattedTime}`,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
      bar: 'bg-amber-500',
      badgeText: `Atenção: ${formattedTime}`,
    },
    critical: {
      bg: 'bg-orange-100 dark:bg-orange-950/60',
      border: 'border-orange-300 dark:border-orange-700',
      text: 'text-orange-700 dark:text-orange-300 font-bold',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
      bar: 'bg-orange-500',
      badgeText: `SLA 75%: ${formattedTime}`,
    },
    pre_breach: {
      bg: 'bg-rose-100 dark:bg-rose-950/80 animate-pulse',
      border: 'border-rose-400 dark:border-rose-600 shadow-md shadow-rose-500/20',
      text: 'text-rose-700 dark:text-rose-300 font-extrabold',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />,
      bar: 'bg-rose-600',
      badgeText: `⚠️ PRE-BREACH (90%): ${formattedTime}`,
    },
    breached: {
      bg: 'bg-red-600 dark:bg-red-700 text-white animate-pulse',
      border: 'border-red-700 shadow-md shadow-red-600/30',
      text: 'text-white font-extrabold',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-white animate-bounce" />,
      bar: 'bg-red-400',
      badgeText: `ESTOURADO: -${formattedTime}`,
    },
  };

  const style = tierStyles[tier];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${style.bg} ${style.border} ${style.text} transition-all`}>
        {style.icon}
        <span>{style.badgeText}</span>
      </div>
    );
  }

  return (
    <div className={`w-full p-2.5 rounded-xl border ${style.bg} ${style.border} space-y-1.5 transition-all`}>
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1.5 ${style.text}`}>
          {style.icon}
          <span className="font-bold tracking-tight">{style.badgeText}</span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${tier === 'breached' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          {tier === 'breached' ? '100% Excedido' : `${percentageUsed}% Decorrido`}
        </span>
      </div>

      {showProgressBar && (
        <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${style.bar} transition-all duration-500 rounded-full`}
            style={{ width: `${tier === 'breached' ? 100 : percentageUsed}%` }}
          />
        </div>
      )}

      {/* Banner de Escalonamento Automático N2 ao atingir 90% (Item 056) */}
      {(tier === 'pre_breach' || tier === 'breached') && !isResolved && (
        <div className="pt-1.5 border-t border-rose-300 dark:border-rose-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold text-[11px]">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
            <span>🚨 ESCALONADO AUTOMÁTICO N2: Alerta enviado ao time N2 por atingir 90% do SLA.</span>
          </div>
        </div>
      )}
    </div>
  );
}
