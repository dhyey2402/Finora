export interface SaleItem {
    id: number;
    sale_id: number;
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount: number;
    discount_amount: number;
    line_total: number;
}

export interface Sale {
    id: number;
    company_id: number;
    customer_id: number;
    sale_number: string;
    sale_date: string;
    total_amount: number;
    notes?: string;
    items: SaleItem[];
    created_at: string;
    updated_at: string;
}

export interface SaleItemCreate {
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount?: number;
    discount_amount?: number;
    line_total: number;
}

export interface SaleCreate {
    customer_id: number;
    sale_number: string;
    sale_date: string;
    total_amount: number;
    notes?: string;
    items: SaleItemCreate[];
}

export interface SaleListParams {
    company_id: number;
    limit?: number;
    offset?: number;
}
