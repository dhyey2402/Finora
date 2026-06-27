"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { getCompanies } from "@/services/company.service";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useCustomers";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { DeleteCustomerDialog } from "@/components/customers/DeleteCustomerDialog";
import { Customer } from "@/types/customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  // Fetch customers
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    isError,
  } = useCustomers(companyId, debouncedSearch, limit, (page - 1) * limit);

  // Mutations
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedCustomer) {
      await updateMutation.mutateAsync({
        customerId: selectedCustomer.id,
        companyId,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      await deleteMutation.mutateAsync({
        customerId: selectedCustomer.id,
        companyId,
      });
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setIsFormOpen(true);
          }}
          disabled={!companyId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <CustomerTable
        customers={customersData?.items || []}
        isLoading={isLoadingCompanies || isLoadingCustomers}
        isError={isError}
        onRowClick={handleRowClick}
        page={page}
        total={customersData?.total || 0}
        limit={limit}
        onPageChange={setPage}
      />

      <CustomerDialog
        customer={selectedCustomer}
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

      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />

      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        customerName={selectedCustomer?.name}
      />
    </div>
  );
}
