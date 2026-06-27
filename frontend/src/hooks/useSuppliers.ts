import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplier.service";
import type { SupplierCreate, SupplierUpdate } from "@/types/supplier";

export const useSuppliers = (companyId: number, search?: string, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["suppliers", companyId, search, limit, offset],
    queryFn: () => getSuppliers(companyId, search, limit, offset),
    enabled: !!companyId,
  });
};

export const useSupplier = (supplierId: number, companyId: number) => {
  return useQuery({
    queryKey: ["suppliers", supplierId, companyId],
    queryFn: () => getSupplier(supplierId, companyId),
    enabled: !!supplierId && !!companyId,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierCreate) => createSupplier(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.company_id] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      supplierId,
      companyId,
      data,
    }: {
      supplierId: number;
      companyId: number;
      data: SupplierUpdate;
    }) => updateSupplier(supplierId, companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.supplierId, variables.companyId] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, companyId }: { supplierId: number; companyId: number }) =>
      deleteSupplier(supplierId, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.companyId] });
    },
  });
};
