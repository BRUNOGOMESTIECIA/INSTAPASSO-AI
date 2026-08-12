import React, { useState } from 'react';
import { generatePeriodicSecurityAuditPdf } from '../../lib/periodic-security-report-generator';
import { FileCheck, ShieldCheck, Download, Calendar, Printer, X } from 'lucide-react';

interface PeriodicAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PeriodicAuditReportModal({ isOpen, onClose }: PeriodicAuditReportModalProps) {
  const [periodMonth, setPeriodMonth] = useState('Julho/2026');

  if (!isOpen) return null;

  const handleGenerate = () => {
    generatePeriodicSecurityAuditPdf({
      periodMonth,
      generatedBy: 'Administrador de TI / DPO',
      generatedByEmail: 'admin@tiecia.com.br',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900 dark:text-slate-100">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                LAUDO EXECUTIVO (Item 112)
              </span>
              <h2 className="text-base font-extrabold mt-1">
                Emitir Laudo Mensal de Auditoria ISO 27001
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção do Período */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Selecione o Período de Auditoria:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
            {['Julho/2026', 'Junho/2026', 'Maio/2026', '1º Semestre 2026'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodMonth(p)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  periodMonth === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Geração */}
        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Gerar Laudo Executivo em PDF
        </button>
      </div>
    </div>
  );
}
