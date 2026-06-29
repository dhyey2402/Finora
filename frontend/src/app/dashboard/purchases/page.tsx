"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "@/services/purchase";
import { getCompanies } from "@/services/company.service";
import type { Purchase } from "@/types/purchase";
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
import { PurchaseFormDialog } from "@/components/forms/purchase-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  ShoppingCartIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";

export default function PurchasesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: purchasesData,
    isLoading: isLoadingPurchases,
    isFetching: isFetchingPurchases,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchases", selectedCompanyId],
    queryFn: () => purchaseService.getAll({ company_id: selectedCompanyId! }),
    enabled: !!selectedCompanyId,
  });

  const purchases = purchasesData?.items || [];
  const isLoading = isLoadingCompanies || isLoadingPurchases;

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
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground">
            Manage your purchase vouchers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetchingPurchases}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetchingPurchases ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" disabled={!selectedCompanyId} onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Purchase
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-4 text-muted-foreground" />
            Purchase Directory
          </CardTitle>
          <CardDescription>
            {purchases.length > 0 ? `Showing ${purchases.length} purchases` : "No purchases recorded"}
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

          {!isLoading && !isError && purchases.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No purchases yet</p>
            </div>
          )}

          {!isLoading && !isError && purchases.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchase_number}</TableCell>
                    <TableCell>{purchase.purchase_date}</TableCell>
                    <TableCell>${purchase.total_amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <PurchaseFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
