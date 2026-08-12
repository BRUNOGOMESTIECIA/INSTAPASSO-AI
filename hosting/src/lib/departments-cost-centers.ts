import { logCrudAudit } from './audit-logger';

/**
 * 🏷️ Item 030: Cadastro de Departamentos e Centros de Custo
 * 
 * Estrutura corporativa de setores, rateio orçamentário e vinculação de chamados de TI.
 */

export interface CostCenter {
  id: string;
  code: string; // Ex: CC-1010-RH
  departmentName: string;
  managerName: string;
  managerEmail: string;
  budgetMonthly: number; // Em R$
  ticketsConsumed: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const STORAGE_KEY = 'portal_cost_centers_list';

/**
 * Retorna os Centros de Custo cadastrados no sistema
 */
export function getCostCenters(): CostCenter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }

  return getInitialMockCostCenters();
}

/**
 * Mocks iniciais de Departamentos e Centros de Custo corporativos
 */
function getInitialMockCostCenters(): CostCenter[] {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 'cc_rh_1010',
      code: 'CC-1010-RH',
      departmentName: 'Recursos Humanos (RH)',
      managerName: 'Mariana Costa',
      managerEmail: 'mariana.costa@empresa.com.br',
      budgetMonthly: 25000,
      ticketsConsumed: 14,
      status: 'ACTIVE',
      createdAt: timestamp,
    },
    {
      id: 'cc_ti_2020',
      code: 'CC-2020-TI',
      departmentName: 'TI & Infraestrutura',
      managerName: 'Bruno Gomes',
      managerEmail: 'bg@tiecia.com.br',
      budgetMonthly: 45000,
      ticketsConsumed: 32,
      status: 'ACTIVE',
      createdAt: timestamp,
    },
    {
      id: 'cc_fin_3030',
      code: 'CC-3030-FIN',
      departmentName: 'Financeiro & Contábil',
      managerName: 'Roberto Santos',
      managerEmail: 'roberto.santos@empresa.com.br',
      budgetMonthly: 30000,
      ticketsConsumed: 18,
      status: 'ACTIVE',
      createdAt: timestamp,
    },
    {
      id: 'cc_vnd_4040',
      code: 'CC-4040-VND',
      departmentName: 'Vendas & Comercial',
      managerName: 'Amanda Oliveira',
      managerEmail: 'amanda.oliveira@empresa.com.br',
      budgetMonthly: 20000,
      ticketsConsumed: 22,
      status: 'ACTIVE',
      createdAt: timestamp,
    },
    {
      id: 'cc_ope_5050',
      code: 'CC-5050-OPE',
      departmentName: 'Operações B2B',
      managerName: 'Carlos Eduardo',
      managerEmail: 'carlos.eduardo@empresa.com.br',
      budgetMonthly: 25000,
      ticketsConsumed: 19,
      status: 'ACTIVE',
      createdAt: timestamp,
    },
  ];
}

/**
 * Salva a lista de Centros de Custo no armazenamento local
 */
export function saveCostCenters(list: CostCenter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[CostCenters] Erro ao salvar lista:', e);
  }
}

/**
 * Adiciona um novo Departamento e Centro de Custo
 */
export async function addCostCenter(newCc: Omit<CostCenter, 'id' | 'ticketsConsumed' | 'createdAt'>): Promise<CostCenter> {
  const list = getCostCenters();
  const id = `cc_${Date.now()}`;
  const created: CostCenter = {
    ...newCc,
    id,
    ticketsConsumed: 0,
    createdAt: new Date().toISOString(),
  };

  list.unshift(created);
  saveCostCenters(list);

  await logCrudAudit('CREATE', 'cost_centers', id, JSON.stringify({
    action: 'CREATE_DEPARTMENT_COST_CENTER',
    code: created.code,
    departmentName: created.departmentName,
    managerName: created.managerName,
    budgetMonthly: created.budgetMonthly,
  }));

  return created;
}

/**
 * Obtém estatísticas consolidadas de orçamento e consumo
 */
export function getCostCenterMetrics() {
  const list = getCostCenters();
  const totalBudget = list.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.budgetMonthly : 0), 0);
  const totalTickets = list.reduce((sum, c) => sum + c.ticketsConsumed, 0);

  return {
    activeDepartmentsCount: list.filter((c) => c.status === 'ACTIVE').length,
    totalCostCenters: list.length,
    totalMonthlyBudget: totalBudget,
    totalTicketsAssociated: totalTickets,
  };
}
