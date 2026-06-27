import api from "@/lib/api";
import type { Customer, CustomerCreate, CustomerUpdate } from "@/types/customer";
import type { PaginatedResponse } from "@/types/common";

export const getCustomers = async (
  companyId: number,
  search?: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResponse<Customer>> => {
  const { data } = await api.get<PaginatedResponse<Customer>>(`/customers`, {
    params: { company_id: companyId, search, limit, offset },
  });
  return data;
};

export const getCustomer = async (
  customerId: number,
  companyId: number
): Promise<Customer> => {
  const { data } = await api.get<Customer>(`/customers/${customerId}`, {
    params: { company_id: companyId },
  });
  return data;
};

export const createCustomer = async (
  customerData: CustomerCreate
): Promise<Customer> => {
  const { data } = await api.post<Customer>("/customers", customerData);
  return data;
};

export const updateCustomer = async (
  customerId: number,
  companyId: number,
  customerData: CustomerUpdate
): Promise<Customer> => {
  const { data } = await api.put<Customer>(
    `/customers/${customerId}`,
    customerData,
    {
      params: { company_id: companyId },
    }
  );
  return data;
};

export const deleteCustomer = async (
  customerId: number,
  companyId: number
): Promise<void> => {
  await api.delete(`/customers/${customerId}`, {
    params: { company_id: companyId },
  });
};
