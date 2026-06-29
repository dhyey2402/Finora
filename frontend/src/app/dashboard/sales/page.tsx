"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { saleService } from "@/services/sale";
import { getCompanies } from "@/services/company.service";
import type { Sale } from "@/types/sale";
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
import { SaleFormDialog } from "@/components/forms/sale-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  BanknoteIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: salesData,
    isLoading: isLoadingSales,
    isFetching: isFetchingSales,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sales", selectedCompanyId],
    queryFn: () => saleService.getAll({ company_id: selectedCompanyId! }),
    enabled: !!selectedCompanyId,
  });

  const sales = salesData?.items || [];
  const isLoading = isLoadingCompanies || isLoadingSales;

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
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales vouchers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetchingSales}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetchingSales ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" disabled={!selectedCompanyId} onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Sale
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BanknoteIcon className="size-4 text-muted-foreground" />
            Sales Directory
          </CardTitle>
          <CardDescription>
            {sales.length > 0 ? `Showing ${sales.length} sales` : "No sales recorded"}
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

          {!isLoading && !isError && sales.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No sales yet</p>
            </div>
          )}

          {!isLoading && !isError && sales.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                    <TableCell>{sale.sale_date}</TableCell>
                    <TableCell>${sale.total_amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <SaleFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
