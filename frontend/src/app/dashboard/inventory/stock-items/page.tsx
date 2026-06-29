"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockItems, deleteStockItem, getStockGroups, getUnits } from "@/services/inventory.service";
import { getCompanies } from "@/services/company.service";
import type { StockItem, StockGroup, Unit } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockItemFormDialog } from "@/components/forms/stock-item-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  Package2Icon,
  RefreshCwIcon,
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

export default function StockItemsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stock-items", selectedCompanyId],
    queryFn: () => getStockItems(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  // Pre-fetch groups and units for displaying names in the table
  const { data: groupsData } = useQuery({
    queryKey: ["stock-groups", selectedCompanyId],
    queryFn: () => getStockGroups(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units", selectedCompanyId],
    queryFn: () => getUnits(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const items = itemsData?.items || [];
  const groups = groupsData?.items || [];
  const units = unitsData?.items || [];
  
  const isLoading = isLoadingCompanies || isLoadingItems;

  const getGroupName = (id: number) => groups.find((g) => g.id === id)?.name || id;
  const getUnitAbbr = (id: number) => units.find((u) => u.id === id)?.abbreviation || id;

  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => deleteStockItem(itemId, selectedCompanyId!),
    onSuccess: () => {
      toast.success("Stock Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-items", selectedCompanyId] });
    },
    onError: () => {
      toast.error("Failed to delete stock item");
    },
  });

  const handleDelete = (item: StockItem) => {
    if (!confirm(`Are you sure you want to delete item "${item.name}"?`)) return;
    deleteMutation.mutate(item.id);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  if (!companies?.length && !isLoadingCompanies) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No Companies Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Items</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory products and stock quantities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedCompanyId}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2Icon className="size-4 text-muted-foreground" />
            Stock Items Directory
          </CardTitle>
          <CardDescription>
            {items.length > 0 ? `Showing ${items.length} items` : "No items recorded"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex items-center justify-center py-16">
              <AlertCircleIcon className="size-10 text-destructive/60" />
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No stock items yet</p>
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">In Stock</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku || "—"}</TableCell>
                    <TableCell>{getGroupName(item.stock_group_id)}</TableCell>
                    <TableCell className="text-right">${item.rate}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity} {getUnitAbbr(item.unit_id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} disabled={deleteMutation.isPending}>
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <StockItemFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          stockItem={editingItem}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
