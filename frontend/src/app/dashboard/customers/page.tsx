"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, deleteCustomer } from "@/services/customer.service";
import { getCompanies } from "@/services/company.service";
import type { Customer } from "@/types/customer";
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
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog";
import { CustomerDetailsDialog } from "@/components/forms/customer-details-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  UsersIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function CustomersPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Fetch companies to select context
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id; // Default to first company for now

  // Fetch customers for selected company
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customers", selectedCompanyId],
    queryFn: () => getCustomers(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const isLoading = isLoadingCompanies || isLoadingCustomers;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (customerId: number) => deleteCustomer(customerId, selectedCompanyId!),
    onSuccess: () => {
      toast.success("Customer deleted");
      queryClient.invalidateQueries({ queryKey: ["customers", selectedCompanyId] });
      setDetailsOpen(false);
      setViewingCustomer(null);
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });

  const handleDelete = (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete "${customer.name}"?`)) return;
    deleteMutation.mutate(customer.id);
  };

  const handleRowClick = (customer: Customer) => {
    setViewingCustomer(customer);
    setDetailsOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setDetailsOpen(false);
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  if (!companies?.length && !isLoadingCompanies) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No Companies Found</p>
          <p className="text-sm text-muted-foreground">
            Please create a company first before managing customers.
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customers for the selected company.
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
            Add Customer
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            Customer Directory
          </CardTitle>
          <CardDescription>
            {customers.length > 0
              ? `Showing ${customers.length} registered ${
                  customers.length === 1 ? "customer" : "customers"
                }`
              : "No customers registered yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2Icon className="size-8 animate-spin" />
                <p className="text-sm">Loading customers...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircleIcon className="size-10 text-destructive/60" />
                <p className="text-sm text-destructive">Failed to load customers</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && customers.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <UsersIcon className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No customers yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add your first customer to get started.
                  </p>
                </div>
                <Button size="sm" onClick={handleAdd} className="mt-2">
                  <PlusIcon className="mr-1.5 size-3.5" />
                  Add Customer
                </Button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !isError && customers.length > 0 && (
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
                {customers.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(customer)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{customer.name}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground">
                        {customer.email || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {customer.phone || "—"}
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
      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={viewingCustomer}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create / Edit Dialog */}
      {selectedCompanyId && (
        <CustomerFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          customer={editingCustomer}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
