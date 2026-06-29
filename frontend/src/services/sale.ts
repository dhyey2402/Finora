import api from '@/lib/api';
import { Sale, SaleCreate, SaleListParams } from '@/types/sale';
import { PaginatedResponse } from '@/types/common';

export const saleService = {
    getAll: async (params: SaleListParams): Promise<PaginatedResponse<Sale>> => {
        const response = await api.get('/sales', { params });
        return response.data;
    },

    getById: async (id: number, companyId: number): Promise<Sale> => {
        const response = await api.get(`/sales/${id}`, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    create: async (companyId: number, data: SaleCreate): Promise<Sale> => {
        const response = await api.post('/sales', data, {
            params: { company_id: companyId },
        });
        return response.data;
    },
};
