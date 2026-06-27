import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUnits, createUnit, updateUnit, deleteUnit,
  getStockGroups, createStockGroup, updateStockGroup, deleteStockGroup,
  getStockItems, getStockItem, createStockItem, updateStockItem, deleteStockItem,
  getInventoryTransactions, createInventoryTransaction
} from "@/services/inventory.service";
import type { 
  UnitCreate, UnitUpdate, 
  StockGroupCreate, StockGroupUpdate,
  StockItemCreate, StockItemUpdate,
  InventoryTransactionCreate
} from "@/types/inventory";

// Units
export const useUnits = (companyId: number, search?: string, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["units", companyId, search, limit, offset],
    queryFn: () => getUnits(companyId, search, limit, offset),
    enabled: !!companyId,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitCreate) => createUnit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["units", variables.company_id] });
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId, data }: { id: number; companyId: number; data: UnitUpdate }) => updateUnit(id, companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["units", variables.companyId] });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId }: { id: number; companyId: number }) => deleteUnit(id, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["units", variables.companyId] });
    },
  });
};

// Stock Groups
export const useStockGroups = (companyId: number, search?: string, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["stockGroups", companyId, search, limit, offset],
    queryFn: () => getStockGroups(companyId, search, limit, offset),
    enabled: !!companyId,
  });
};

export const useCreateStockGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockGroupCreate) => createStockGroup(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockGroups", variables.company_id] });
    },
  });
};

export const useUpdateStockGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId, data }: { id: number; companyId: number; data: StockGroupUpdate }) => updateStockGroup(id, companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockGroups", variables.companyId] });
    },
  });
};

export const useDeleteStockGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId }: { id: number; companyId: number }) => deleteStockGroup(id, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockGroups", variables.companyId] });
    },
  });
};

// Stock Items
export const useStockItems = (companyId: number, search?: string, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["stockItems", companyId, search, limit, offset],
    queryFn: () => getStockItems(companyId, search, limit, offset),
    enabled: !!companyId,
  });
};

export const useStockItem = (id: number, companyId: number) => {
  return useQuery({
    queryKey: ["stockItems", id, companyId],
    queryFn: () => getStockItem(id, companyId),
    enabled: !!id && !!companyId,
  });
};

export const useCreateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockItemCreate) => createStockItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockItems", variables.company_id] });
    },
  });
};

export const useUpdateStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId, data }: { id: number; companyId: number; data: StockItemUpdate }) => updateStockItem(id, companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockItems", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["stockItems", variables.id, variables.companyId] });
    },
  });
};

export const useDeleteStockItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, companyId }: { id: number; companyId: number }) => deleteStockItem(id, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockItems", variables.companyId] });
    },
  });
};

// Transactions
export const useInventoryTransactions = (companyId: number, limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ["inventoryTransactions", companyId, limit, offset],
    queryFn: () => getInventoryTransactions(companyId, limit, offset),
    enabled: !!companyId,
  });
};

export const useCreateInventoryTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryTransactionCreate) => createInventoryTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryTransactions", variables.company_id] });
      queryClient.invalidateQueries({ queryKey: ["stockItems", variables.company_id] });
    },
  });
};
