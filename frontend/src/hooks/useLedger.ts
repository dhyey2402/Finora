import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerService } from '@/services/ledger';
import { LedgerCreate, LedgerUpdate, LedgerListParams } from '@/types/ledger';

export const useLedgers = (params: LedgerListParams) => {
    return useQuery({
        queryKey: ['ledgers', params],
        queryFn: () => ledgerService.getAll(params),
        enabled: !!params.company_id,
    });
};

export const useLedger = (id: number, companyId: number) => {
    return useQuery({
        queryKey: ['ledger', id, companyId],
        queryFn: () => ledgerService.getById(id, companyId),
        enabled: !!id && !!companyId,
    });
};

export const useCreateLedger = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LedgerCreate) => ledgerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledgers'] });
        },
    });
};

export const useUpdateLedger = (id: number, companyId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LedgerUpdate) => ledgerService.update(id, companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledgers'] });
            queryClient.invalidateQueries({ queryKey: ['ledger', id] });
        },
    });
};

export const useDeleteLedger = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, companyId }: { id: number; companyId: number }) =>
            ledgerService.delete(id, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledgers'] });
        },
    });
};
