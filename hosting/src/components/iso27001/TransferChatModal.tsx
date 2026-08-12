import React, { useState } from 'react';
import { X, ArrowRightLeft, Lock, ShieldCheck, UserCheck, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransferChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  clientName: string;
  currentAgentName?: string;
  onConfirmTransfer: (newQueue: string, newAgentName: string, internalNote: string) => void;
}

const TARGET_QUEUES = [
  { id: 'N2 - Infraestrutura & Servidores', label: 'N2 - Infraestrutura & Servidores', agentCount: 3 },
  { id: 'N2 - Redes, Firewall & VPN', label: 'N2 - Redes, Firewall & VPN', agentCount: 2 },
  { id: 'N2 - Software & Sistemas ERP', label: 'N2 - Software & Sistemas ERP', agentCount: 4 },
  { id: 'N3 - Engenharia / DevOps', label: 'N3 - Engenharia / DevOps', agentCount: 2 },
  { id: 'Coordenadoria de TI', label: 'Coordenadoria de TI', agentCount: 1 },
];

const TARGET_AGENTS = [
  { name: 'Carlos N2 (Infra)', role: 'Especialista N2' },
  { name: 'Juliana Silva (Redes)', role: 'Especialista N2' },
  { name: 'Roberto Mendes (DevOps)', role: 'Especialista N3' },
  { name: 'Fernanda Lima (Sistemas)', role: 'Especialista N2' },
  { name: 'Qualquer Operador Livre na Fila', role: 'Fila Automática' },
];

export function TransferChatModal({
  isOpen,
  onClose,
  chatId,
  clientName,
  currentAgentName,
  onConfirmTransfer,
}: TransferChatModalProps) {
  const [selectedQueue, setSelectedQueue] = useState(TARGET_QUEUES[0].id);
  const [selectedAgent, setSelectedAgent] = useState(TARGET_AGENTS[0].name);
  const [internalNote, setInternalNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) {
      toast.error('Insira uma nota interna técnica explicando o motivo da transferência.');
      return;
    }
    onConfirmTransfer(selectedQueue, selectedAgent, internalNote);
    toast.success(`Chat transferido com sucesso para ${selectedAgent} (${selectedQueue})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Transferência de Atendimento (N1 ➔ N2)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cliente: <strong className="text-slate-800 dark:text-slate-200">{clientName}</strong> (Item 118)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Fila de Destino */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Fila / Especialidade de Destino
            </label>
            <select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
            >
              {TARGET_QUEUES.map((q) => (
                <option key={q.id} value={q.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {q.label} ({q.agentCount} atendentes on-line)
                </option>
              ))}
            </select>
          </div>

          {/* Atendente Específico (Opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Direcionar a um Atendente Específico
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500"
            >
              {TARGET_AGENTS.map((a) => (
                <option key={a.name} value={a.name} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </div>

          {/* Observação Interna Confidencial */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" /> Nota Técnica Interna (Visível apenas para o N2/N3)
              </label>
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                🔒 CONFIDENCIAL
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Ex: Verificado IP de loopback. Cliente necessita de liberação de porta 443 no firewall e redefinição da rota VPN. Testes N1 já executados."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Esta nota será registrada na conversa com a tag confidencial e NÃO será exibida para o cliente.
            </p>
          </div>

          {/* Ações */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Transbordo para N2
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
