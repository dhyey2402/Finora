import api from '@/lib/api';
import { Invoice, InvoiceCreate, InvoiceListParams } from '@/types/invoice';
import { PaginatedResponse } from '@/types/common';

export const invoiceService = {
    getAll: async (params: InvoiceListParams): Promise<PaginatedResponse<Invoice>> => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    getById: async (id: number, companyId: number): Promise<Invoice> => {
        const response = await api.get(`/invoices/${id}`, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    create: async (companyId: number, data: InvoiceCreate): Promise<Invoice> => {
        const response = await api.post('/invoices', data, {
            params: { company_id: companyId },
        });
        return response.data;
    },
};
