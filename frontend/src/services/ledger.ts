import api from '@/lib/api';
import { Ledger, LedgerCreate, LedgerUpdate, LedgerListParams } from '@/types/ledger';

export const ledgerService = {
    getAll: async (params: LedgerListParams): Promise<Ledger[]> => {
        const response = await api.get('/ledgers', { params });
        return response.data;
    },

    getById: async (id: number, companyId: number): Promise<Ledger> => {
        const response = await api.get(`/ledgers/${id}`, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    create: async (data: LedgerCreate): Promise<Ledger> => {
        const response = await api.post('/ledgers', data);
        return response.data;
    },

    update: async (id: number, companyId: number, data: LedgerUpdate): Promise<Ledger> => {
        const response = await api.put(`/ledgers/${id}`, data, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    delete: async (id: number, companyId: number): Promise<void> => {
        await api.delete(`/ledgers/${id}`, {
            params: { company_id: companyId },
        });
    },
};
