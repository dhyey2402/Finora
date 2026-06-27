import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customer.service";
import type { CustomerCreate, CustomerUpdate } from "@/types/customer";

export const useCustomers = (companyId: number, search?: string, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["customers", companyId, search, limit, offset],
    queryFn: () => getCustomers(companyId, search, limit, offset),
    enabled: !!companyId,
  });
};

export const useCustomer = (customerId: number, companyId: number) => {
  return useQuery({
    queryKey: ["customers", customerId, companyId],
    queryFn: () => getCustomer(customerId, companyId),
    enabled: !!customerId && !!companyId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerCreate) => createCustomer(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", variables.company_id] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      companyId,
      data,
    }: {
      customerId: number;
      companyId: number;
      data: CustomerUpdate;
    }) => updateCustomer(customerId, companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.customerId, variables.companyId] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, companyId }: { customerId: number; companyId: number }) =>
      deleteCustomer(customerId, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", variables.companyId] });
    },
  });
};
