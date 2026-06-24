import api from "@/lib/api";
import type { Company, CompanyCreate, CompanyUpdate } from "@/types/company";

// ------------------------------------------------------------------
// SmartERP — Company API Service
// Encapsulates all HTTP calls to the /companies endpoints.
// ------------------------------------------------------------------

/**
 * Fetch all active companies for the authenticated user.
 */
export async function getCompanies(): Promise<Company[]> {
  const response = await api.get<Company[]>("/companies");
  return response.data;
}

/**
 * Fetch a single company by ID.
 */
export async function getCompany(id: number): Promise<Company> {
  const response = await api.get<Company>(`/companies/${id}`);
  return response.data;
}

/**
 * Create a new company.
 */
export async function createCompany(data: CompanyCreate): Promise<Company> {
  const response = await api.post<Company>("/companies", data);
  return response.data;
}

/**
 * Update an existing company (partial update).
 */
export async function updateCompany(
  id: number,
  data: CompanyUpdate
): Promise<Company> {
  const response = await api.put<Company>(`/companies/${id}`, data);
  return response.data;
}

/**
 * Soft-delete a company by ID.
 */
export async function deleteCompany(id: number): Promise<Company> {
  const response = await api.delete<Company>(`/companies/${id}`);
  return response.data;
}
