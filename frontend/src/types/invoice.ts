export interface InvoiceItem {
    id: number;
    invoice_id: number;
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount: number;
    discount_amount: number;
    line_total: number;
}

export interface Invoice {
    id: number;
    company_id: number;
    customer_id: number;
    sale_id?: number;
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    total_amount: number;
    status: 'Paid' | 'Unpaid' | 'Cancelled';
    notes?: string;
    items: InvoiceItem[];
    created_at: string;
    updated_at: string;
}

export interface InvoiceItemCreate {
    stock_item_id: number;
    quantity: number;
    rate: number;
    tax_amount?: number;
    discount_amount?: number;
    line_total: number;
}

export interface InvoiceCreate {
    customer_id: number;
    sale_id?: number;
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    total_amount: number;
    status?: 'Paid' | 'Unpaid' | 'Cancelled';
    notes?: string;
    items: InvoiceItemCreate[];
}

export interface InvoiceListParams {
    company_id: number;
    limit?: number;
    offset?: number;
}
