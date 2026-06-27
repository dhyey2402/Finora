import api from '@/lib/api';
import { Group, GroupCreate, GroupUpdate, GroupListParams } from '@/types/group';

export const groupService = {
    getAll: async (params: GroupListParams): Promise<Group[]> => {
        const response = await api.get('/groups', { params });
        return response.data;
    },

    getById: async (id: number, companyId: number): Promise<Group> => {
        const response = await api.get(`/groups/${id}`, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    create: async (data: GroupCreate): Promise<Group> => {
        const response = await api.post('/groups', data);
        return response.data;
    },

    update: async (id: number, companyId: number, data: GroupUpdate): Promise<Group> => {
        const response = await api.put(`/groups/${id}`, data, {
            params: { company_id: companyId },
        });
        return response.data;
    },

    delete: async (id: number, companyId: number): Promise<void> => {
        await api.delete(`/groups/${id}`, {
            params: { company_id: companyId },
        });
    },
};
