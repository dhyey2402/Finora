"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, BarChart3Icon } from "lucide-react";

import type { InventoryTransactionCreate } from "@/types/inventory";
import { createInventoryTransaction, getStockItems } from "@/services/inventory.service";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const transactionSchema = z.object({
  stock_item_id: z.string().min(1, "Stock item is required"),
  transaction_type: z.enum(["Purchase", "Sale", "Adjustment"]),
  transaction_date: z.string().min(1, "Date is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
  rate: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  companyId: number;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
}: TransactionFormDialogProps) {
  const queryClient = useQueryClient();

  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ["stock-items", companyId],
    queryFn: () => getStockItems(companyId),
    enabled: open,
  });

  const allItems = itemsData?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      stock_item_id: "",
      transaction_type: "Adjustment",
      transaction_date: new Date().toISOString().split("T")[0],
      quantity: 0,
      rate: 0,
      notes: "",
    },
  });

  const stockItemIdValue = watch("stock_item_id");
  const transactionTypeValue = watch("transaction_type");

  useEffect(() => {
    if (open) {
      reset({
        stock_item_id: "",
        transaction_type: "Adjustment",
        transaction_date: new Date().toISOString().split("T")[0],
        quantity: 0,
        rate: 0,
        notes: "",
      });
    }
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: InventoryTransactionCreate) => createInventoryTransaction(data),
    onSuccess: () => {
      toast.success("Transaction recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", companyId] });
      // Invalidate stock items to reflect new quantities
      queryClient.invalidateQueries({ queryKey: ["stock-items", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to record transaction");
    },
  });

  const onSubmit = (data: TransactionFormValues) => {
    // If it's a sale or negative adjustment, we might need negative quantity in some schemas, 
    // but the backend usually handles positive quantity for out and positive for in, 
    // or we send negative for deductions. Wait, standard ERPs either use transaction type to determine sign, 
    // or explicit negative. Let's assume the backend handles the sign based on transaction_type.
    
    const payload: InventoryTransactionCreate = {
      company_id: companyId,
      stock_item_id: parseInt(data.stock_item_id),
      transaction_type: data.transaction_type,
      transaction_date: data.transaction_date,
      quantity: data.quantity,
      rate: data.rate,
      notes: data.notes || undefined,
    };

    createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-5 text-primary" />
            Add Manual Transaction
          </DialogTitle>
          <DialogDescription>
            Record a manual inventory adjustment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="stock_item_id">
                Stock Item <span className="text-destructive">*</span>
              </Label>
              <Select
                value={stockItemIdValue || undefined}
                onValueChange={(value) => {
                  setValue("stock_item_id", value);
                  // Auto-fill rate based on selected item
                  const item = allItems.find(i => i.id.toString() === value);
                  if (item) {
                    setValue("rate", item.rate);
                  }
                }}
                disabled={isLoading || isLoadingItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {allItems.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No items available
                    </SelectItem>
                  ) : (
                    allItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} (Qty: {item.quantity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.stock_item_id && (
                <p className="text-xs text-destructive">{errors.stock_item_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={transactionTypeValue}
                onValueChange={(value: "Purchase" | "Sale" | "Adjustment") => setValue("transaction_type", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                  <SelectItem value="Purchase">Purchase (In)</SelectItem>
                  <SelectItem value="Sale">Sale (Out)</SelectItem>
                </SelectContent>
              </Select>
              {errors.transaction_type && (
                <p className="text-xs text-destructive">{errors.transaction_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transaction_date"
                type="date"
                disabled={isLoading}
                {...register("transaction_date")}
              />
              {errors.transaction_date && (
                <p className="text-xs text-destructive">{errors.transaction_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                disabled={isLoading}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                step="any"
                disabled={isLoading}
                {...register("rate")}
              />
              {errors.rate && (
                <p className="text-xs text-destructive">{errors.rate.message}</p>
              )}
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                disabled={isLoading}
                {...register("notes")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
