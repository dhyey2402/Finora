export interface PurchaseItem {
    id: number;
    purchase_id: number;
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount: number;
    discount_amount: number;
    line_total: number;
}

export interface Purchase {
    id: number;
    company_id: number;
    supplier_id: number;
    purchase_number: string;
    purchase_date: string;
    total_amount: number;
    notes?: string;
    items: PurchaseItem[];
    created_at: string;
    updated_at: string;
}

export interface PurchaseItemCreate {
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount?: number;
    discount_amount?: number;
    line_total: number;
}

export interface PurchaseCreate {
    supplier_id: number;
    purchase_number: string;
    purchase_date: string;
    total_amount: number;
    notes?: string;
    items: PurchaseItemCreate[];
}

export interface PurchaseListParams {
    company_id: number;
    limit?: number;
    offset?: number;
}
