import React, { useState, useEffect } from 'react';

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
}

export const DEFAULT_ROLES: CustomRole[] = [
  { id: 'role_n1', name: 'N1', permissions: ['tickets.view', 'tickets.create', 'chat.view', 'chat.attend'] },
  { id: 'role_n2', name: 'N2', permissions: ['tickets.view', 'tickets.create', 'tickets.update', 'chat.view', 'chat.attend'] },
  { id: 'role_n3', name: 'N3', permissions: ['tickets.view', 'tickets.create', 'tickets.update', 'tickets.close', 'chat.view', 'chat.attend'] },
  { id: 'role_soc', name: 'SOC', permissions: ['tickets.view', 'reports.view'] },
  { id: 'role_infra', name: 'INFRAESTRUTURA', permissions: ['monitoring.hardware', 'monitoring.printers'] },
  { id: 'role_admin', name: 'Administrador', permissions: ['tickets.view', 'chat.view', 'reports.view', 'admin.users'] },
  { id: 'role_superadmin', name: 'Super Administrador', permissions: ['admin.users', 'admin.roles', 'admin.settings'] }
];

const PERMISSION_GROUPS = [
  {
    category: 'GESTÃO DE TICKETS',
    permissions: [
      { id: 'tickets.view', label: 'Visualizar Tickets' },
      { id: 'tickets.create', label: 'Criar Novos Tickets' },
      { id: 'tickets.update', label: 'Editar Status & Atribuição' },
      { id: 'tickets.close', label: 'Encerrar & Resolver Tickets' },
      { id: 'tickets.delete', label: 'Excluir Registros de Tickets' },
    ]
  },
  {
    category: 'CHAT AO VIVO',
    permissions: [
      { id: 'chat.view', label: 'Acessar Fila de Atendimento' },
      { id: 'chat.attend', label: 'Assumir & Responder Chats' },
      { id: 'chat.manage', label: 'Supervisionar Chats de Outros Operadores' },
      { id: 'chat.history', label: 'Visualizar Histórico Completo de Chats' },
    ]
  },
  {
    category: 'BASE DE CONHECIMENTO & CATÁLOGO',
    permissions: [
      { id: 'kb.view', label: 'Visualizar Artigos da KB' },
      { id: 'kb.manage', label: 'Criar / Publicar Artigos da KB' },
      { id: 'catalog.view', label: 'Visualizar Catálogo de Serviços' },
      { id: 'catalog.manage', label: 'Gerenciar Serviços do Catálogo' },
    ]
  },
  {
    category: 'MONITORAMENTO & DISPOSITIVOS',
    permissions: [
      { id: 'monitoring.hardware', label: 'Painel de Equipamentos & Servidores' },
      { id: 'monitoring.printers', label: 'Painel de Impressoras & Contadores' },
    ]
  },
  {
    category: 'RELATÓRIOS & EXECUTIVE',
    permissions: [
      { id: 'reports.view', label: 'Visualizar Indicadores & Métricas' },
      { id: 'reports.export', label: 'Exportar Relatórios em PDF & Excel' },
    ]
  },
  {
    category: 'ADMINISTRAÇÃO GERAL',
    permissions: [
      { id: 'admin.users', label: 'Gerenciar Equipe / Clientes' },
      { id: 'admin.roles', label: 'Papéis e Permissões' },
      { id: 'admin.settings', label: 'Configurações Globais' },
    ]
  }
];

export function useDynamicRoles() {
  const [roles, setRoles] = useState<CustomRole[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('instapasso_roles');
    if (saved) {
      setRoles(JSON.parse(saved));
    } else {
      setRoles(DEFAULT_ROLES);
      localStorage.setItem('instapasso_roles', JSON.stringify(DEFAULT_ROLES));
    }
  }, []);

  const saveRoles = (newRoles: CustomRole[]) => {
    setRoles(newRoles);
    localStorage.setItem('instapasso_roles', JSON.stringify(newRoles));
  };

  return { roles, saveRoles };
}

export default function RolesManagerPanel() {
  const { roles, saveRoles } = useDynamicRoles();
  const [isEditing, setIsEditing] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);

  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);

  const handleCreateNew = () => {
    setEditingRole(null);
    setFormName('');
    setFormPerms([]);
    setIsEditing(true);
  };

  const handleEdit = (role: CustomRole) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormPerms(role.permissions);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cargo? Usuários atrelados podem perder permissões.')) {
      saveRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formName) return;

    if (editingRole) {
      const newRoles = roles.map(r => r.id === editingRole.id ? { ...r, name: formName, permissions: formPerms } : r);
      saveRoles(newRoles);
    } else {
      const newRole: CustomRole = {
        id: `role_${Date.now()}`,
        name: formName,
        permissions: formPerms
      };
      saveRoles([...roles, newRole]);
    }
    setIsEditing(false);
  };

  const togglePermission = (permId: string) => {
    setFormPerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6">
        <h3 className="text-lg font-medium leading-6 mb-4">{editingRole ? 'Editar Cargo' : 'Novo Cargo'}</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted mb-2">Nome do Cargo</label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-muted"
            placeholder="Ex: Líder de Infraestrutura"
          />
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-foreground">Permissões do Cargo</h4>
          {PERMISSION_GROUPS.map(group => (
            <div key={group.category} className="p-4 border border-border rounded-xl bg-zinc-900/40">
              <h5 className="text-xs font-bold text-foreground uppercase mb-3">{group.category}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {group.permissions.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      formPerms.includes(p.id)
                        ? 'bg-zinc-800 border-zinc-600 text-foreground font-semibold shadow-sm'
                        : 'bg-zinc-900/30 border-zinc-800 text-muted hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formPerms.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      className="rounded border-zinc-700 bg-zinc-900 text-foreground"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-muted hover:text-foreground">Cancelar</button>
          <button onClick={handleSave} className="bg-foreground text-background px-6 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200">
            Salvar Cargo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl mb-8">
      <div className="px-6 py-5 border-b border-border bg-zinc-900/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6">Cargos e Permissões</h3>
          <p className="text-xs text-muted mt-1">Gerencie os papéis disponíveis no sistema e o que cada um pode fazer.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Cargo
        </button>
      </div>
      <div className="divide-y divide-border">
        {roles.map(role => (
          <div key={role.id} className="p-6 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
            <div>
              <h4 className="font-semibold text-foreground">{role.name}</h4>
              <p className="text-xs text-muted mt-1">{role.permissions.length} permissões atribuídas</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(role)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-foreground rounded text-xs font-medium">Editar</button>
              <button onClick={() => handleDelete(role.id)} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-xs font-medium">Excluir</button>
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">Nenhum cargo cadastrado.</div>
        )}
      </div>
    </div>
  );
}
