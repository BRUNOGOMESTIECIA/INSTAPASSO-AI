import React from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';
import { exportChartToPng } from '../../lib/export-chart-image';

interface ChartExportButtonProps {
  elementId: string;
  chartTitle: string;
  className?: string;
}

export function ChartExportButton({ elementId, chartTitle, className = '' }: ChartExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => exportChartToPng(elementId, chartTitle)}
      className={`px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs ${className}`}
      title={`Baixar o gráfico "${chartTitle}" em Imagem HD (PNG)`}
    >
      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
      <span>Baixar Imagem HD</span>
    </button>
  );
}
