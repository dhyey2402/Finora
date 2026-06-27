export interface Group {
    id: number;
    company_id: number;
    name: string;
    code?: string;
    parent_id?: number;
    created_at: string;
    updated_at: string;
    child_count: number;
    ledger_count: number;
}

export interface GroupCreate {
    name: string;
    code?: string;
    parent_id?: number;
    company_id: number;
}

export interface GroupUpdate {
    name?: string;
    code?: string;
    parent_id?: number;
}

export interface GroupListParams {
    company_id: number;
    search?: string;
    parent_id?: number;
    skip?: number;
    limit?: number;
}
