"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventoryTransactions, getStockItems } from "@/services/inventory.service";
import { getCompanies } from "@/services/company.service";
import type { InventoryTransaction, StockItem } from "@/types/inventory";
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
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  BarChart3Icon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory-transactions", selectedCompanyId],
    queryFn: () => getInventoryTransactions(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  // Pre-fetch items for displaying names
  const { data: itemsData } = useQuery({
    queryKey: ["stock-items", selectedCompanyId],
    queryFn: () => getStockItems(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const transactions = transactionsData?.items || [];
  const items = itemsData?.items || [];
  
  const isLoading = isLoadingCompanies || isLoadingTransactions;

  const getItemName = (id: number) => items.find((i) => i.id === id)?.name || id;

  const handleAdd = () => {
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
          <h1 className="text-2xl font-bold tracking-tight">Inventory Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Audit log of all stock movements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedCompanyId}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Manual Adjustment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-4 text-muted-foreground" />
            Transactions History
          </CardTitle>
          <CardDescription>
            {transactions.length > 0 ? `Showing ${transactions.length} recent transactions` : "No transactions recorded"}
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

          {!isLoading && !isError && transactions.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No transactions yet</p>
            </div>
          )}

          {!isLoading && !isError && transactions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.transaction_date}</TableCell>
                    <TableCell>
                      <Badge variant={txn.transaction_type === "Sale" ? "destructive" : txn.transaction_type === "Purchase" ? "default" : "secondary"}>
                        {txn.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getItemName(txn.stock_item_id)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {txn.transaction_type === "Sale" ? "-" : ""}{txn.quantity}
                    </TableCell>
                    <TableCell className="text-right">${txn.rate}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {txn.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
