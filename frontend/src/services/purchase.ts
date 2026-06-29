import api from '@/lib/api';
import { Purchase, PurchaseCreate, PurchaseListParams } from '@/types/purchase';
import { PaginatedResponse } from '@/types/common';

export const purchaseService = {
    getAll: async (params: PurchaseListParams): Promise<PaginatedResponse<Purchase>> => {
        const response = await api.get('/purchases', { params });
        return response.data;
    },

    getById: async (id: number, companyId: number): Promise<Purchase> => {
        const response = await api.get(`/purchases/${id}`, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    create: async (companyId: number, data: PurchaseCreate): Promise<Purchase> => {
        const response = await api.post('/purchases', data, {
            params: { company_id: companyId },
        });
        return response.data;
    },
};
