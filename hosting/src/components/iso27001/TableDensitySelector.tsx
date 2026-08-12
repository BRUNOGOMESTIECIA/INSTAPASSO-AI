import React from 'react';
import { useTableDensity, DENSITY_CONFIGS, type TableDensity } from '../../hooks/use-table-density';
import { SlidersHorizontal, List, AlignJustify, Maximize2 } from 'lucide-react';

interface TableDensitySelectorProps {
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
}

export function TableDensitySelector({ density, onDensityChange }: TableDensitySelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
      <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 px-2 tracking-wider hidden sm:inline">
        Densidade:
      </span>
      {(Object.keys(DENSITY_CONFIGS) as TableDensity[]).map((key) => {
        const cfg = DENSITY_CONFIGS[key];
        const isSelected = density === key;
        return (
          <button
            key={key}
            onClick={() => onDensityChange(key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
            }`}
            title={`Modo ${cfg.label}`}
          >
            <span>{cfg.icon}</span>
            <span className="hidden md:inline">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
