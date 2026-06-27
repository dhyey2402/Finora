"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { getCompanies } from "@/services/company.service";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/useSuppliers";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";
import { Supplier } from "@/types/supplier";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Get active company
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });
  const companyId = companies?.[0]?.id || 0;

  // Fetch suppliers
  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    isError,
  } = useSuppliers(companyId, debouncedSearch, limit, (page - 1) * limit);

  // Mutations
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const handleRowClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedSupplier) {
      await updateMutation.mutateAsync({
        supplierId: selectedSupplier.id,
        companyId,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSupplier) {
      await deleteMutation.mutateAsync({
        supplierId: selectedSupplier.id,
        companyId,
      });
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <Button
          onClick={() => {
            setSelectedSupplier(null);
            setIsFormOpen(true);
          }}
          disabled={!companyId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <SupplierTable
        suppliers={suppliersData?.items || []}
        isLoading={isLoadingCompanies || isLoadingSuppliers}
        isError={isError}
        onRowClick={handleRowClick}
        page={page}
        total={suppliersData?.total || 0}
        limit={limit}
        onPageChange={setPage}
      />

      <SupplierDialog
        supplier={selectedSupplier}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onEdit={() => {
          setIsDialogOpen(false);
          setIsFormOpen(true);
        }}
        onDelete={() => {
          setIsDialogOpen(false);
          setIsDeleteDialogOpen(true);
        }}
      />

      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        supplier={selectedSupplier}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />

      <DeleteSupplierDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        supplierName={selectedSupplier?.name}
      />
    </div>
  );
}
