import type { AuditLog } from "./audit-log";

export interface DashboardSummaryResponse {
  companies_count: number;
  customers_count: number;
  suppliers_count: number;
  inventory_count: number;
  recent_actions: AuditLog[];
  income: number;
  expenses: number;
  net_profit: number;
}
