import React, { useState, useEffect } from 'react';
import { Edit3, Table, Zap, CheckCircle2, Save, X, Search, Sparkles, Check, AlertCircle } from 'lucide-react';
import { getEditableOperatorsList, updateOperatorFieldDirectInPlace, getDirectInPlaceMetrics, type EditableOperator } from '../../lib/direct-in-place-operator-editor';
import { toast } from 'sonner';

/**
 * ✏️ Widget do Item 029: Edição Direct-in-Place de Operadores
 */
export function DirectInPlaceOperatorEditorWidget() {
  const [operators, setOperators] = useState<EditableOperator[]>([]);
  const [metrics, setMetrics] = useState(getDirectInPlaceMetrics());
  const [searchTerm, setSearchTerm] = useState('');

  // Estado da Célula que está sendo editada no momento: { operatorId, fieldName, tempValue }
  const [editingCell, setEditingCell] = useState<{
    operatorId: string;
    fieldName: keyof EditableOperator;
    tempValue: string;
  } | null>(null);

  const [savingCellKey, setSavingCellKey] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getEditableOperatorsList();
    setOperators(list);
    setMetrics(getDirectInPlaceMetrics());
  };

  const handleStartEditing = (operatorId: string, fieldName: keyof EditableOperator, currentValue: string) => {
    setEditingCell({
      operatorId,
      fieldName,
      tempValue: currentValue,
    });
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    const { operatorId, fieldName, tempValue } = editingCell;

    const cellKey = `${operatorId}_${fieldName}`;
    setSavingCellKey(cellKey);

    try {
      await updateOperatorFieldDirectInPlace(operatorId, fieldName, tempValue, 'Bruno Gomes (Super Admin)');
      loadData();
      toast.success(`Campo '${fieldName}' atualizado diretamente na célula!`);
    } catch (err) {
      toast.error('Erro ao atualizar célula.');
    } finally {
      setEditingCell(null);
      setTimeout(() => setSavingCellKey(null), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveCell();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const filteredOperators = operators.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.roleLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Edição Direct-in-Place de Operadores
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Item 029
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Edição direta na célula da tabela (estilo planilha Excel/Notion) com salvamento em tempo real no InstaPasso SSO.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-indigo-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          Salvamento Inline: &lt; 10ms
        </span>
      </div>

      {/* Dica de Uso Excel/Notion */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Dica de Produtividade:</strong> Clique em qualquer célula da tabela para editar o valor. Pressione <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">Enter</kbd> para salvar no InstaPasso SSO ou <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">Esc</kbd> para cancelar.
          </span>
        </div>
      </div>

      {/* Tabela de Operadores Editáveis Direct-in-Place */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Atendentes e Permissões (Edição Estilo Planilha)
            </h4>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-2.5 px-4">Nome do Operador (Clique para Editar)</th>
                <th className="py-2.5 px-4">E-mail Corporativo</th>
                <th className="py-2.5 px-4">Cargo / Função</th>
                <th className="py-2.5 px-4">Departamento</th>
                <th className="py-2.5 px-4 text-right">Status SSO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOperators.map((o) => {
                const isEditingName = editingCell?.operatorId === o.id && editingCell?.fieldName === 'name';
                const isEditingEmail = editingCell?.operatorId === o.id && editingCell?.fieldName === 'email';
                const isEditingRole = editingCell?.operatorId === o.id && editingCell?.fieldName === 'roleLabel';
                const isEditingDept = editingCell?.operatorId === o.id && editingCell?.fieldName === 'department';

                return (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Célula 1: Nome */}
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {isEditingName ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingCell.tempValue}
                            onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveCell}
                            className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-full font-bold"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditing(o.id, 'name', o.name)}
                          className="cursor-pointer hover:text-indigo-300 hover:underline flex items-center justify-between group"
                          title="Clique para editar o Nome"
                        >
                          <span>{o.name}</span>
                          <Edit3 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Célula 2: E-mail */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {isEditingEmail ? (
                        <input
                          type="email"
                          autoFocus
                          value={editingCell.tempValue}
                          onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveCell}
                          className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-full font-mono"
                        />
                      ) : (
                        <div
                          onClick={() => handleStartEditing(o.id, 'email', o.email)}
                          className="cursor-pointer hover:text-indigo-300 hover:underline text-slate-300 flex items-center justify-between group"
                          title="Clique para editar o E-mail"
                        >
                          <span>{o.email}</span>
                          <Edit3 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Célula 3: Cargo */}
                    <td className="py-3 px-4 font-medium text-indigo-300">
                      {isEditingRole ? (
                        <select
                          autoFocus
                          value={editingCell.tempValue}
                          onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                          onBlur={handleSaveCell}
                          onKeyDown={handleKeyDown}
                          className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-full font-bold"
                        >
                          <option value="Analista de Suporte N1">Analista de Suporte N1</option>
                          <option value="Analista de Suporte N2">Analista de Suporte N2</option>
                          <option value="Especialista N3 Cloud & DevOps">Especialista N3 Cloud & DevOps</option>
                          <option value="Coordenador / Supervisor Operacional">Coordenador / Supervisor Operacional</option>
                          <option value="Super Administrador / Supervisor">Super Administrador / Supervisor</option>
                        </select>
                      ) : (
                        <div
                          onClick={() => handleStartEditing(o.id, 'roleLabel', o.roleLabel)}
                          className="cursor-pointer hover:text-indigo-200 hover:underline flex items-center justify-between group"
                          title="Clique para editar o Cargo"
                        >
                          <span>{o.roleLabel}</span>
                          <Edit3 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Célula 4: Departamento */}
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {isEditingDept ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingCell.tempValue}
                          onChange={(e) => setEditingCell({ ...editingCell, tempValue: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveCell}
                          className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-full font-medium"
                        />
                      ) : (
                        <div
                          onClick={() => handleStartEditing(o.id, 'department', o.department)}
                          className="cursor-pointer hover:text-indigo-300 hover:underline flex items-center justify-between group"
                          title="Clique para editar o Departamento"
                        >
                          <span>{o.department}</span>
                          <Edit3 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Célula 5: Status SSO */}
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 ATIVO SSO
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
