// ------------------------------------------------------------------
// SmartERP — Company TypeScript Interfaces
// Mirrors the backend Pydantic schemas exactly.
// ------------------------------------------------------------------

export interface Company {
  id: number;
  name: string;
  address: string | null;
  contact_number: string | null;
  state: string | null;
  gst_number: string | null;
  financial_year: string | null;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  address?: string | null;
  contact_number?: string | null;
  state?: string | null;
  gst_number?: string | null;
  financial_year?: string | null;
}

export interface CompanyUpdate {
  name?: string;
  address?: string | null;
  contact_number?: string | null;
  state?: string | null;
  gst_number?: string | null;
  financial_year?: string | null;
}
