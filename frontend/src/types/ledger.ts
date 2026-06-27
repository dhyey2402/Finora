export interface Ledger {
    id: number;
    company_id: number;
    group_id: number;
    name: string;
    code?: string;
    opening_balance: number;
    current_balance: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LedgerCreate {
    name: string;
    code?: string;
    group_id: number;
    company_id: number;
    opening_balance?: number;
    is_active?: boolean;
}

export interface LedgerUpdate {
    name?: string;
    code?: string;
    group_id?: number;
    opening_balance?: number;
    is_active?: boolean;
}

export interface LedgerListParams {
    company_id: number;
    search?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
}
