import React, { useState } from 'react';
import { X, Building2, Download, Printer, ShieldCheck, Clock, Award, CheckCircle2, FileText } from 'lucide-react';
import { useEscapeModal } from '../../hooks/use-escape-modal';
import { toast } from 'sonner';

export interface B2bCompanyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_B2B_COMPANIES = [
  { id: 'c1', name: 'TechCorp Logística S.A.', cnpj: '12.345.678/0001-90', contract: 'Enterprise Gold', ticketsTotal: 142, slaMetPercent: 98.6, csatScore: 4.9, avgResolutionMinutes: 85 },
  { id: 'c2', name: 'Fintech Brasil Pagamentos', cnpj: '98.765.432/0001-10', contract: 'Platinum SLA 24/7', ticketsTotal: 215, slaMetPercent: 99.1, csatScore: 4.95, avgResolutionMinutes: 42 },
  { id: 'c3', name: 'OmniRetail Comércio Digital', cnpj: '45.123.890/0001-55', contract: 'Standard B2B', ticketsTotal: 88, slaMetPercent: 96.2, csatScore: 4.75, avgResolutionMinutes: 120 },
  { id: 'c4', name: 'Inova Saúde & Diagnósticos', cnpj: '33.999.111/0001-88', contract: 'Enterprise Gold', ticketsTotal: 176, slaMetPercent: 98.2, csatScore: 4.88, avgResolutionMinutes: 68 },
];

export function B2bCompanyPerformanceModal({ isOpen, onClose }: B2bCompanyPerformanceModalProps) {
  useEscapeModal(isOpen, onClose);
  const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_B2B_COMPANIES[0].id);

  if (!isOpen) return null;

  const company = MOCK_B2B_COMPANIES.find(c => c.id === selectedCompanyId) || MOCK_B2B_COMPANIES[0];

  const handlePrintReport = () => {
    window.print();
    toast.success(`Laudo B2B de ${company.name} gerado para impressão/PDF!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Extrato Executivo de Desempenho B2B (QBR - Item 130)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laudo corporativo de cumprimento de SLA, CSAT e volumetria para reuniões de contrato
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Principal Scrollável */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Seletor de Empresa B2B */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Selecione a Empresa Cliente:
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {MOCK_B2B_COMPANIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {c.name} ({c.contract})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar PDF do Laudo
              </button>
            </div>
          </div>

          {/* Cartão de Resumo da Empresa */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded-full border border-blue-400/30">
                  {company.contract}
                </span>
                <h3 className="text-xl font-black mt-2">{company.name}</h3>
                <p className="text-xs text-blue-200/80 font-mono mt-0.5">CNPJ: {company.cnpj}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-blue-300">Satisfação CSAT</p>
                  <p className="text-2xl font-black text-amber-300">⭐ {company.csatScore} / 5.0</p>
                </div>
              </div>
            </div>

            {/* Grid de KPIs B2B */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold">Cumprimento de SLA</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{company.slaMetPercent}%</p>
                <p className="text-[10px] text-slate-300">Meta Contratual: 95%</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold">Total de Incidentes</p>
                <p className="text-2xl font-black text-white mt-1">{company.ticketsTotal}</p>
                <p className="text-[10px] text-slate-300">Últimos 90 dias</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold">Tempo Médio Resolução</p>
                <p className="text-2xl font-black text-amber-300 mt-1">{company.avgResolutionMinutes} min</p>
                <p className="text-[10px] text-slate-300">Resolução no 1º Contato: 78%</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold">Conformidade ISO 27001</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">100%</p>
                <p className="text-[10px] text-slate-300">Auditoria Trimestral OK</p>
              </div>
            </div>
          </div>

          {/* Seções de Detalhamento do Laudo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Garantias Contratuais Cumpridas
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>SLA de Primeira Resposta em até 15 minutos cumprido em 99.2% dos chamados.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Criptografia ponta-a-ponta e logs de auditoria DLP ativos durante todo o trimestre.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Disponibilidade de Central 24/7 sem interrupções não planejadas.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Categorias Mais Solicitadas
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">🌐 Redes & VPN Corporativa</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">42% (60 chamados)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">🔐 Acesso, Senhas & SSO</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">31% (44 chamados)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">💻 Hardware & Notebooks</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">18% (25 chamados)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">🖨️ Outros / Suprimentos</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">9% (13 chamados)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Documento homologado para reuniões de SLA e governança B2B.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
