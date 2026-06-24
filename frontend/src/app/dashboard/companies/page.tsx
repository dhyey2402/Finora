"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCompanies,
  deleteCompany,
} from "@/services/company.service";
import type { Company } from "@/types/company";
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
import { Badge } from "@/components/ui/badge";
import { CompanyFormDialog } from "@/components/forms/company-form-dialog";
import { CompanyDetailsDialog } from "@/components/forms/company-details-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
  BuildingIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";

// ------------------------------------------------------------------
// Companies Page
// ------------------------------------------------------------------
export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch {
      setError("Failed to load companies. Please try again.");
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle delete
  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) return;

    setDeletingId(company.id);
    try {
      await deleteCompany(company.id);
      toast.success("Company deleted", {
        description: `"${company.name}" has been removed.`,
      });
      if (viewingCompany?.id === company.id) {
        setDetailsOpen(false);
        setViewingCompany(null);
      }
      fetchCompanies();
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  // Open dialog for view
  const handleRowClick = (company: Company) => {
    setViewingCompany(company);
    setDetailsOpen(true);
  };

  // Open dialog for create
  const handleAdd = () => {
    setEditingCompany(null);
    setDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (company: Company) => {
    setDetailsOpen(false); // Close details dialog if it's open
    setEditingCompany(company);
    setDialogOpen(true);
  };

  // Callback after successful create/update
  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setEditingCompany(null);
    fetchCompanies();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Manage your registered companies and their details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCompanies} disabled={isLoading}>
            <RefreshCwIcon
              className={`mr-1.5 size-3.5 ${isLoading ? "animate-spin" : ""}`}
              data-icon="inline-start"
            />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <PlusIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="size-4 text-muted-foreground" />
            Company Directory
          </CardTitle>
          <CardDescription>
            {companies.length > 0
              ? `Showing ${companies.length} active ${
                  companies.length === 1 ? "company" : "companies"
                }`
              : "No companies registered yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2Icon className="size-8 animate-spin" />
                <p className="text-sm">Loading companies...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircleIcon className="size-10 text-destructive/60" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchCompanies}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && companies.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <BuildingIcon className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No companies yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first company to get started.
                  </p>
                </div>
                <Button size="sm" onClick={handleAdd} className="mt-2">
                  <PlusIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                  Add Company
                </Button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && companies.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">State</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company, index) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(company)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.address && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                            {company.address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground">
                        {company.contact_number || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground">
                        {company.state || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={company.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {company.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <CompanyDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        company={viewingCompany}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deletingId === viewingCompany?.id}
      />

      {/* Create / Edit Dialog */}
      <CompanyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={editingCompany}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
