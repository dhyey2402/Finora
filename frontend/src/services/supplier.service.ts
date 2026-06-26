import api from "@/lib/api";
import type { Supplier, SupplierCreate, SupplierUpdate } from "@/types/supplier";

export const getSuppliers = async (companyId: number): Promise<Supplier[]> => {
  const { data } = await api.get<Supplier[]>(`/suppliers`, {
    params: { company_id: companyId },
  });
  return data;
};

export const getSupplier = async (
  supplierId: number,
  companyId: number
): Promise<Supplier> => {
  const { data } = await api.get<Supplier>(`/suppliers/${supplierId}`, {
    params: { company_id: companyId },
  });
  return data;
};

export const createSupplier = async (
  supplierData: SupplierCreate
): Promise<Supplier> => {
  const { data } = await api.post<Supplier>("/suppliers", supplierData);
  return data;
};

export const updateSupplier = async (
  supplierId: number,
  companyId: number,
  supplierData: SupplierUpdate
): Promise<Supplier> => {
  const { data } = await api.put<Supplier>(
    `/suppliers/${supplierId}`,
    supplierData,
    {
      params: { company_id: companyId },
    }
  );
  return data;
};

export const deleteSupplier = async (
  supplierId: number,
  companyId: number
): Promise<void> => {
  await api.delete(`/suppliers/${supplierId}`, {
    params: { company_id: companyId },
  });
};
