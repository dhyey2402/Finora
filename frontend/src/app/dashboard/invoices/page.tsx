"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "@/services/invoice";
import { getCompanies } from "@/services/company.service";
import { getCustomers } from "@/services/customer.service";
import type { Invoice } from "@/types/invoice";
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
import { InvoiceFormDialog } from "@/components/forms/invoice-form-dialog";
import { printInvoice } from "@/components/invoice-print";
import {
  PlusIcon,
  Loader2Icon,
  FileTextIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  DownloadIcon,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function InvoicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;
  const selectedCompany = companies?.[0];

  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    isFetching: isFetchingInvoices,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["invoices", selectedCompanyId],
    queryFn: () => invoiceService.getAll({ company_id: selectedCompanyId! }),
    enabled: !!selectedCompanyId,
  });

  // Fetch all customers so we can look up names
  const { data: customersData } = useQuery({
    queryKey: ["customers", selectedCompanyId],
    queryFn: () => getCustomers(selectedCompanyId!, undefined, 1000),
    enabled: !!selectedCompanyId,
  });

  const invoices = invoicesData?.items || [];
  const customers = customersData?.items || [];
  const isLoading = isLoadingCompanies || isLoadingInvoices;

  const getCustomerName = (customerId: number) =>
    customers.find((c) => c.id === customerId)?.name;

  const handleDownload = (invoice: Invoice) => {
    if (!selectedCompany) return;
    setDownloadingId(invoice.id);
    try {
      printInvoice({
        invoice,
        company: selectedCompany,
        customerName: getCustomerName(invoice.customer_id),
      });
    } finally {
      // Small delay so user sees the button state change
      setTimeout(() => setDownloadingId(null), 800);
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Manage your billing and invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetchingInvoices}
          >
            <RefreshCwIcon
              className={`mr-1.5 size-3.5 ${
                isLoading || isFetchingInvoices ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            disabled={!selectedCompanyId}
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon className="mr-1.5 size-3.5" />
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="size-4 text-muted-foreground" />
            Invoice Directory
          </CardTitle>
          <CardDescription>
            {invoices.length > 0
              ? `Showing ${invoices.length} invoices`
              : "No invoices recorded"}
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

          {!isLoading && !isError && invoices.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No invoices yet</p>
            </div>
          )}

          {!isLoading && !isError && invoices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCustomerName(invoice.customer_id) ??
                        `#${invoice.customer_id}`}
                    </TableCell>
                    <TableCell>{invoice.invoice_date}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.due_date ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{Number(invoice.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_STYLES[invoice.status] ?? STATUS_STYLES["Cancelled"]
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                      >
                        {downloadingId === invoice.id ? (
                          <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                          <DownloadIcon className="mr-1.5 size-3.5" />
                        )}
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <InvoiceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
