import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice';
import { InvoiceCreate, InvoiceListParams } from '@/types/invoice';

export const useInvoices = (params: InvoiceListParams) => {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => invoiceService.getAll(params),
        enabled: !!params.company_id,
    });
};

export const useInvoice = (id: number, companyId: number) => {
    return useQuery({
        queryKey: ['invoice', id, companyId],
        queryFn: () => invoiceService.getById(id, companyId),
        enabled: !!id && !!companyId,
    });
};

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ companyId, data }: { companyId: number; data: InvoiceCreate }) => 
            invoiceService.create(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};
