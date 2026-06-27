export interface Unit {
  id: number;
  company_id: number;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

export interface UnitCreate {
  company_id: number;
  name: string;
  abbreviation: string;
}

export interface UnitUpdate {
  name?: string;
  abbreviation?: string;
}

export interface StockGroup {
  id: number;
  company_id: number;
  name: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface StockGroupCreate {
  company_id: number;
  name: string;
  parent_id?: number;
}

export interface StockGroupUpdate {
  name?: string;
  parent_id?: number;
}

export interface StockItem {
  id: number;
  company_id: number;
  name: string;
  sku?: string;
  stock_group_id: number;
  unit_id: number;
  quantity: number;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface StockItemCreate {
  company_id: number;
  name: string;
  sku?: string;
  stock_group_id: number;
  unit_id: number;
  quantity?: number;
  rate?: number;
}

export interface StockItemUpdate {
  name?: string;
  sku?: string;
  stock_group_id?: number;
  unit_id?: number;
  quantity?: number;
  rate?: number;
}

export type TransactionType = "Purchase" | "Sale" | "Adjustment";

export interface InventoryTransaction {
  id: number;
  company_id: number;
  stock_item_id: number;
  purchase_id?: number;
  sale_id?: number;
  transaction_type: TransactionType;
  transaction_date: string;
  quantity: number;
  rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransactionCreate {
  company_id: number;
  stock_item_id: number;
  purchase_id?: number;
  sale_id?: number;
  transaction_type: TransactionType;
  transaction_date: string;
  quantity: number;
  rate: number;
  notes?: string;
}
