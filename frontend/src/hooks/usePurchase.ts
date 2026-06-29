import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseService } from '@/services/purchase';
import { PurchaseCreate, PurchaseListParams } from '@/types/purchase';

export const usePurchases = (params: PurchaseListParams) => {
    return useQuery({
        queryKey: ['purchases', params],
        queryFn: () => purchaseService.getAll(params),
        enabled: !!params.company_id,
    });
};

export const usePurchase = (id: number, companyId: number) => {
    return useQuery({
        queryKey: ['purchase', id, companyId],
        queryFn: () => purchaseService.getById(id, companyId),
        enabled: !!id && !!companyId,
    });
};

export const useCreatePurchase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, data }: { companyId: number; data: PurchaseCreate }) => 
            purchaseService.create(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
        },
    });
};
