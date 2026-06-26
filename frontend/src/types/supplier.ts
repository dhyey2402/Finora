export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreate {
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
