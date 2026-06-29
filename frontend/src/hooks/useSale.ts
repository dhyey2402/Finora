import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '@/services/sale';
import { SaleCreate, SaleListParams } from '@/types/sale';

export const useSales = (params: SaleListParams) => {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: () => saleService.getAll(params),
        enabled: !!params.company_id,
    });
};

export const useSale = (id: number, companyId: number) => {
    return useQuery({
        queryKey: ['sale', id, companyId],
        queryFn: () => saleService.getById(id, companyId),
        enabled: !!id && !!companyId,
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, data }: { companyId: number; data: SaleCreate }) => 
            saleService.create(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
        },
    });
};
