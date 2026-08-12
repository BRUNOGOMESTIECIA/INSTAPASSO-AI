import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Printer, Laptop, Smartphone, Monitor, HardDrive, User, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EquipmentItem {
  id: string;
  type: string;
  brandModel: string;
  serialNumber: string;
  accessories: string;
}

interface EquipmentDeliveryTermModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentDeliveryTermModal({ isOpen, onClose }: EquipmentDeliveryTermModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeCpf, setEmployeeCpf] = useState('');
  const [department, setDepartment] = useState('');

  // Lista dinâmica de múltiplos equipamentos no mesmo termo (ex: Notebook + Smartphone + Monitor)
  const [equipments, setEquipments] = useState<EquipmentItem[]>([
    {
      id: 'eq-1',
      type: 'Notebook',
      brandModel: 'Dell Latitude 3420',
      serialNumber: 'SN-2026-88492',
      accessories: 'Fonte de Alimentação, Mochila, Mouse Sem Fio',
    },
  ]);

  const [isCheckedConsent, setIsCheckedConsent] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen) return null;

  const handleAddEquipment = () => {
    setEquipments((prev) => [
      ...prev,
      {
        id: `eq-${Date.now()}`,
        type: 'Smartphone Corporativo',
        brandModel: 'Samsung Galaxy S23 128GB',
        serialNumber: 'IMEI-358910482910481',
        accessories: 'Carregador 20W, Capa Protetora, Película de Vidro',
      },
    ]);
    toast.info('Novo equipamento adicionado ao termo!');
  };

  const handleRemoveEquipment = (id: string) => {
    if (equipments.length === 1) {
      toast.error('O termo precisa ter pelo menos 1 equipamento cadastrado.');
      return;
    }
    setEquipments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEquipmentChange = (id: string, field: keyof EquipmentItem, value: string) => {
    setEquipments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !employeeCpf || !isCheckedConsent) {
      toast.error('Preencha os dados do colaborador e confirme a assinatura digital.');
      return;
    }
    setIsGenerated(true);
    toast.success('Termo de Entrega e Responsabilidade emitido com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900 dark:text-slate-100">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Termo de Entrega de Equipamentos com Assinatura Digital
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerador de Recibo de Responsabilidade de Ativos de TI (Item 099)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isGenerated ? (
          /* Form de Emissão do Termo */
          <form onSubmit={handleGenerate} className="p-6 space-y-6">
            
            {/* Seção 1: Dados do Colaborador */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> 1. DADOS DO COLABORADOR (DESTINATÁRIO)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">CPF / Documento</label>
                  <input
                    type="text"
                    required
                    value={employeeCpf}
                    onChange={(e) => setEmployeeCpf(e.target.value)}
                    placeholder="123.456.789-00"
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Departamento / Cargo</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Comercial / Gerente de Contas"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Seção 2: Especificações de Equipamentos (Dinâmica) */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4" /> 2. DETALHES DO EQUIPAMENTO E ATIVO DE TI ({equipments.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddEquipment}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Outro Equipamento
                </button>
              </div>

              {equipments.map((eq, idx) => (
                <div key={eq.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3 relative">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Equipamento #{idx + 1}
                    </span>
                    {equipments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(eq.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Tipo de Equipamento</label>
                      <select
                        value={eq.type}
                        onChange={(e) => handleEquipmentChange(eq.id, 'type', e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      >
                        <option value="Smartphone Corporativo" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">📱 Smartphone Corporativo</option>
                        <option value="Notebook" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">💻 Notebook</option>
                        <option value="Desktop / Estação" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🖥️ Desktop / Estação de Trabalho</option>
                        <option value="Monitor HD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🖥️ Monitor HD / 4K</option>
                        <option value="Tablet / iPad" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">📱 Tablet / iPad</option>
                        <option value="Impressora / Multifuncional" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🖨️ Impressora / Suprimento</option>
                        <option value="Nobreak / Estabilizador" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🔌 Nobreak / Estabilizador</option>
                        <option value="Periféricos / Outro" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">⌨️ Periféricos / Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Marca / Modelo</label>
                      <input
                        type="text"
                        value={eq.brandModel}
                        onChange={(e) => handleEquipmentChange(eq.id, 'brandModel', e.target.value)}
                        placeholder="Ex: Samsung Galaxy S23 128GB"
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Nº de Série / IMEI / Tag</label>
                      <input
                        type="text"
                        value={eq.serialNumber}
                        onChange={(e) => handleEquipmentChange(eq.id, 'serialNumber', e.target.value)}
                        placeholder="Ex: IMEI-358910482910481"
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Acessórios Inclusos</label>
                    <input
                      type="text"
                      value={eq.accessories}
                      onChange={(e) => handleEquipmentChange(eq.id, 'accessories', e.target.value)}
                      placeholder="Ex: Carregador 20W, Capa Protetora, Película de Vidro, Fone de Ouvido"
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Seção 3: Assinatura Digital e Aceite */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 3. ASSINATURA DIGITAL E DECLARAÇÃO DE RESPONSABILIDADE
              </h3>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  Declaro para os devidos fins que recebi os equipamentos acima especificados em perfeito estado de conservação e funcionamento, comprometendo-me a guardá-los e zelar pelo seu uso exclusivamente profissional.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={isCheckedConsent}
                    onChange={(e) => setIsCheckedConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="consentCheck" className="text-xs font-black text-slate-900 dark:text-slate-100 cursor-pointer">
                    Assino eletronicamente este termo de responsabilidade com registro de data, hora e IP.
                  </label>
                </div>
              </div>
            </div>

            {/* Botões do Form */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isCheckedConsent}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Gerar Termo Assinado Digitalmente
              </button>
            </div>
          </form>
        ) : (
          /* Laudo / Documento Gerado em PDF Impresso */
          <div className="p-8 space-y-6">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                TIECIA <span className="text-blue-600">ITSM & ATIVOS</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                TERMO DE RESPONSABILIDADE E ENTREGA DE EQUIPAMENTOS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono font-bold">Protocolo de Recibo #EQUIP-2026-8842</p>
            </div>

            <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              <p>
                Pelo presente termo, a empresa <strong>TIECIA ITSM Ltda</strong> faz a entrega a(o) colaborador(a) <strong>{employeeName}</strong>, inscrito(a) no CPF <strong>{employeeCpf}</strong>, lotado(a) no setor <strong>{department || 'Operacional'}</strong>, do(s) equipamento(s) de TI abaixo especificado(s):
              </p>

              <div className="space-y-3">
                {equipments.map((eq, i) => (
                  <div key={eq.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono space-y-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Item #{i + 1} — {eq.type}</p>
                    <p><strong>Modelo:</strong> {eq.brandModel}</p>
                    <p><strong>Nº de Série / IMEI:</strong> {eq.serialNumber}</p>
                    <p><strong>Acessórios:</strong> {eq.accessories}</p>
                  </div>
                ))}
              </div>

              <p>
                O colaborador assume total responsabilidade pelo uso adequado e guarda do(s) bem(ns) patrimonial(is), comprometendo-se a devolvê-lo(s) nas mesmas condições quando solicitado ou ao término do contrato de trabalho.
              </p>
            </div>

            {/* Carimbo de Assinatura Digital */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    ASSINADO ELETRONICAMENTE POR {employeeName.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5 font-mono">
                    Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} · IP: 177.136.24.91
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-md">
                AUTÊNTICO
              </span>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
              <button
                onClick={() => setIsGenerated(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Editar Dados
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4" /> Imprimir Termo
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" /> Baixar PDF Assinado
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
