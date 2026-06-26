import api from "@/lib/api";
import type { Customer, CustomerCreate, CustomerUpdate } from "@/types/customer";

export const getCustomers = async (companyId: number): Promise<Customer[]> => {
  const { data } = await api.get<Customer[]>(`/customers`, {
    params: { company_id: companyId },
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
