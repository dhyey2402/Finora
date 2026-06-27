import api from "@/lib/api";
import { PaginatedResponse } from "@/types/common";
import {
  Unit, UnitCreate, UnitUpdate,
  StockGroup, StockGroupCreate, StockGroupUpdate,
  StockItem, StockItemCreate, StockItemUpdate,
  InventoryTransaction, InventoryTransactionCreate
} from "@/types/inventory";

// Units
export const getUnits = async (companyId: number, search?: string, limit = 100, offset = 0) => {
  const { data } = await api.get<PaginatedResponse<Unit>>(`/units`, {
    params: { company_id: companyId, search, limit, offset },
  });
  return data;
};

export const createUnit = async (data: UnitCreate) => {
  const { data: response } = await api.post<Unit>(`/units`, data);
  return response;
};

export const updateUnit = async (id: number, companyId: number, data: UnitUpdate) => {
  const { data: response } = await api.put<Unit>(`/units/${id}`, data, {
    params: { company_id: companyId },
  });
  return response;
};

export const deleteUnit = async (id: number, companyId: number) => {
  await api.delete(`/units/${id}`, {
    params: { company_id: companyId },
  });
};

// Stock Groups
export const getStockGroups = async (companyId: number, search?: string, limit = 100, offset = 0) => {
  const { data } = await api.get<PaginatedResponse<StockGroup>>(`/stock-groups`, {
    params: { company_id: companyId, search, limit, offset },
  });
  return data;
};

export const createStockGroup = async (data: StockGroupCreate) => {
  const { data: response } = await api.post<StockGroup>(`/stock-groups`, data);
  return response;
};

export const updateStockGroup = async (id: number, companyId: number, data: StockGroupUpdate) => {
  const { data: response } = await api.put<StockGroup>(`/stock-groups/${id}`, data, {
    params: { company_id: companyId },
  });
  return response;
};

export const deleteStockGroup = async (id: number, companyId: number) => {
  await api.delete(`/stock-groups/${id}`, {
    params: { company_id: companyId },
  });
};

// Stock Items
export const getStockItems = async (companyId: number, search?: string, limit = 100, offset = 0) => {
  const { data } = await api.get<PaginatedResponse<StockItem>>(`/stock-items`, {
    params: { company_id: companyId, search, limit, offset },
  });
  return data;
};

export const getStockItem = async (id: number, companyId: number) => {
  const { data } = await api.get<StockItem>(`/stock-items/${id}`, {
    params: { company_id: companyId },
  });
  return data;
};

export const createStockItem = async (data: StockItemCreate) => {
  const { data: response } = await api.post<StockItem>(`/stock-items`, data);
  return response;
};

export const updateStockItem = async (id: number, companyId: number, data: StockItemUpdate) => {
  const { data: response } = await api.put<StockItem>(`/stock-items/${id}`, data, {
    params: { company_id: companyId },
  });
  return response;
};

export const deleteStockItem = async (id: number, companyId: number) => {
  await api.delete(`/stock-items/${id}`, {
    params: { company_id: companyId },
  });
};

// Transactions
export const getInventoryTransactions = async (companyId: number, limit = 100, offset = 0) => {
  const { data } = await api.get<PaginatedResponse<InventoryTransaction>>(`/inventory-transactions`, {
    params: { company_id: companyId, limit, offset },
  });
  return data;
};

export const createInventoryTransaction = async (data: InventoryTransactionCreate) => {
  const { data: response } = await api.post<InventoryTransaction>(`/inventory-transactions`, data);
  return response;
};
