"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, deleteSupplier } from "@/services/supplier.service";
import { getCompanies } from "@/services/company.service";
import type { Supplier } from "@/types/supplier";
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
import { SupplierFormDialog } from "@/components/forms/supplier-form-dialog";
import { SupplierDetailsDialog } from "@/components/forms/supplier-details-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  TruckIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function SuppliersPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  // Fetch companies to select context
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id; // Default to first company for now

  // Fetch suppliers for selected company
  const {
    data: suppliers = [],
    isLoading: isLoadingSuppliers,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", selectedCompanyId],
    queryFn: () => getSuppliers(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const isLoading = isLoadingCompanies || isLoadingSuppliers;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (supplierId: number) => deleteSupplier(supplierId, selectedCompanyId!),
    onSuccess: () => {
      toast.success("Supplier deleted");
      queryClient.invalidateQueries({ queryKey: ["suppliers", selectedCompanyId] });
      setDetailsOpen(false);
      setViewingSupplier(null);
    },
    onError: () => {
      toast.error("Failed to delete supplier");
    },
  });

  const handleDelete = (supplier: Supplier) => {
    if (!confirm(`Are you sure you want to delete "${supplier.name}"?`)) return;
    deleteMutation.mutate(supplier.id);
  };

  const handleRowClick = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setDetailsOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setDetailsOpen(false);
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  if (!companies?.length && !isLoadingCompanies) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No Companies Found</p>
          <p className="text-sm text-muted-foreground">
            Please create a company first before managing suppliers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers for the selected company.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCwIcon
              className={`mr-1.5 size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedCompanyId}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="size-4 text-muted-foreground" />
            Supplier Directory
          </CardTitle>
          <CardDescription>
            {suppliers.length > 0
              ? `Showing ${suppliers.length} registered ${
                  suppliers.length === 1 ? "supplier" : "suppliers"
                }`
              : "No suppliers registered yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2Icon className="size-8 animate-spin" />
                <p className="text-sm">Loading suppliers...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircleIcon className="size-10 text-destructive/60" />
                <p className="text-sm text-destructive">Failed to load suppliers</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && suppliers.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <TruckIcon className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No suppliers yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first supplier to get started.
                  </p>
                </div>
                <Button size="sm" onClick={handleAdd} className="mt-2">
                  <PlusIcon className="mr-1.5 size-3.5" />
                  Add Supplier
                </Button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !isError && suppliers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier, index) => (
                  <TableRow
                    key={supplier.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(supplier)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{supplier.name}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground">
                        {supplier.email || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {supplier.phone || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <SupplierDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        supplier={viewingSupplier}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create / Edit Dialog */}
      {selectedCompanyId && (
        <SupplierFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          supplier={editingSupplier}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
