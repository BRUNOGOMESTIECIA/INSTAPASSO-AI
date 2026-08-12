import { useState } from 'react';

export type TableDensity = 'compact' | 'normal' | 'expanded';

export interface DensityConfig {
  id: TableDensity;
  label: string;
  py: string;
  text: string;
  icon: string;
}

export const DENSITY_CONFIGS: Record<TableDensity, DensityConfig> = {
  compact: {
    id: 'compact',
    label: 'Pequena',
    py: 'py-1.5 px-3',
    text: 'text-xs',
    icon: '⚡',
  },
  normal: {
    id: 'normal',
    label: 'Média',
    py: 'py-3 px-4',
    text: 'text-sm',
    icon: '📊',
  },
  expanded: {
    id: 'expanded',
    label: 'Grande',
    py: 'py-4.5 px-5',
    text: 'text-base',
    icon: '📖',
  },
};

export function useTableDensity() {
  const [density, setDensityState] = useState<TableDensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tickets_table_density');
      if (saved && (saved in DENSITY_CONFIGS)) return saved as TableDensity;
    }
    return 'normal';
  });

  const setDensity = (newDensity: TableDensity) => {
    setDensityState(newDensity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tickets_table_density', newDensity);
    }
  };

  return {
    density,
    setDensity,
    config: DENSITY_CONFIGS[density],
  };
}
