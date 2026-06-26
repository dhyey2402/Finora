import type { Company } from "./company";

export interface DashboardSummaryResponse {
  companies_count: number;
  customers_count: number;
  suppliers_count: number;
  inventory_count: number;
  recent_companies: Company[];
  income: number;
  expenses: number;
  net_profit: number;
}
