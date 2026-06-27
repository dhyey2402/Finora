import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '@/services/group';
import { GroupCreate, GroupUpdate, GroupListParams } from '@/types/group';

export const useGroups = (params: GroupListParams) => {
    return useQuery({
        queryKey: ['groups', params],
        queryFn: () => groupService.getAll(params),
        enabled: !!params.company_id,
    });
};

export const useGroup = (id: number, companyId: number) => {
    return useQuery({
        queryKey: ['group', id, companyId],
        queryFn: () => groupService.getById(id, companyId),
        enabled: !!id && !!companyId,
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GroupCreate) => groupService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};

export const useUpdateGroup = (id: number, companyId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GroupUpdate) => groupService.update(id, companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['group', id] });
        },
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, companyId }: { id: number; companyId: number }) =>
            groupService.delete(id, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};
