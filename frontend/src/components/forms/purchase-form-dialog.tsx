"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, ShoppingCartIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { PurchaseCreate } from "@/types/purchase";
import { purchaseService } from "@/services/purchase";
import { getSuppliers } from "@/services/supplier.service";
import { getStockItems } from "@/services/inventory.service";

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

const purchaseItemSchema = z.object({
  stock_item_id: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(0.01, "Qty must be > 0"),
  rate: z.coerce.number().min(0, "Rate must be >= 0"),
  tax_percent: z.coerce.number().min(0).max(100).default(0),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
});

const purchaseSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  purchase_number: z.string().min(1, "Voucher No is required"),
  purchase_date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  companyId: number;
}

export function PurchaseFormDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
}: PurchaseFormDialogProps) {
  const queryClient = useQueryClient();

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers", companyId],
    queryFn: () => getSuppliers(companyId, undefined, 1000), // Get all for dropdown
    enabled: open,
  });

  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ["stock-items", companyId],
    queryFn: () => getStockItems(companyId, undefined, 1000),
    enabled: open,
  });

  const allSuppliers = suppliersData?.items || [];
  const allStockItems = itemsData?.items || [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier_id: "",
      purchase_number: "",
      purchase_date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ stock_item_id: "", quantity: 1, rate: 0, tax_amount: 0, discount_percent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const supplierIdValue = watch("supplier_id");

  const totalAmount = useMemo(() => {
    return watchItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const r = Number(item.rate) || 0;
      const taxPct = Number(item.tax_percent) || 0;
      const discPct = Number(item.discount_percent) || 0;
      const subtotal = q * r;
      const taxAmt = subtotal * (taxPct / 100);
      const discAmt = subtotal * (discPct / 100);
      return sum + (subtotal + taxAmt - discAmt);
    }, 0);
  }, [watchItems]);

  useEffect(() => {
    if (open) {
      reset({
        supplier_id: "",
        purchase_number: `PUR-${Date.now().toString().slice(-6)}`,
        purchase_date: new Date().toISOString().split("T")[0],
        notes: "",
        items: [{ stock_item_id: "", quantity: 1, rate: 0, tax_percent: 0, discount_percent: 0 }],
      });
    }
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PurchaseCreate) => purchaseService.create(companyId, data),
    onSuccess: () => {
      toast.success("Purchase recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["purchases", companyId] });
      // Invalidate stock items since inventory increased
      queryClient.invalidateQueries({ queryKey: ["stock-items", companyId] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to record purchase");
    },
  });

  const onSubmit = (data: PurchaseFormValues) => {
    const payload: PurchaseCreate = {
      supplier_id: parseInt(data.supplier_id),
      purchase_number: data.purchase_number,
      purchase_date: data.purchase_date,
      total_amount: totalAmount,
      notes: data.notes || undefined,
      items: data.items.map((item) => {
        const q = Number(item.quantity);
        const r = Number(item.rate);
        const taxPct = Number(item.tax_percent);
        const discPct = Number(item.discount_percent);
        const subtotal = q * r;
        const taxAmt = subtotal * (taxPct / 100);
        const discAmt = subtotal * (discPct / 100);
        return {
          stock_item_id: parseInt(item.stock_item_id),
          quantity: q,
          rate: r,
          tax_amount: taxAmt,
          discount_amount: discAmt,
          line_total: subtotal + taxAmt - discAmt,
        };
      }),
    };

    createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-5 text-primary" />
            Add New Purchase
          </DialogTitle>
          <DialogDescription>
            Record a new purchase voucher with line items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label>
                Supplier <span className="text-destructive">*</span>
              </Label>
              <Select
                value={supplierIdValue || undefined}
                onValueChange={(val) => setValue("supplier_id", val)}
                disabled={isLoading || isLoadingSuppliers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {allSuppliers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No suppliers available
                    </SelectItem>
                  ) : (
                    allSuppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.supplier_id && (
                <p className="text-xs text-destructive">{errors.supplier_id.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-1">
              <Label>
                Voucher No <span className="text-destructive">*</span>
              </Label>
              <Input disabled={isLoading} {...register("purchase_number")} />
              {errors.purchase_number && (
                <p className="text-xs text-destructive">{errors.purchase_number.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-1">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              <Input type="date" disabled={isLoading} {...register("purchase_date")} />
              {errors.purchase_date && (
                <p className="text-xs text-destructive">{errors.purchase_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ stock_item_id: "", quantity: 1, rate: 0, tax_percent: 0, discount_percent: 0 })
                }
              >
                <PlusIcon className="mr-1.5 size-3.5" />
                Add Item
              </Button>
            </div>

            {errors.items?.root && (
              <p className="text-xs text-destructive">{errors.items.root.message}</p>
            )}

            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left font-medium text-muted-foreground">
                    <th className="p-2 w-1/3">Stock Item</th>
                    <th className="p-2 w-20">Qty</th>
                    <th className="p-2 w-28">Rate</th>
                    <th className="p-2 w-24">Tax %</th>
                    <th className="p-2 w-28">Disc %</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const itemError = errors.items?.[index];
                    const q = Number(watchItems[index]?.quantity) || 0;
                    const r = Number(watchItems[index]?.rate) || 0;
                    const taxPct = Number(watchItems[index]?.tax_percent) || 0;
                    const discPct = Number(watchItems[index]?.discount_percent) || 0;
                    const subtotal = q * r;
                    const taxAmt = subtotal * (taxPct / 100);
                    const discAmt = subtotal * (discPct / 100);
                    const lineTotal = subtotal + taxAmt - discAmt;

                    return (
                      <tr key={field.id} className="border-b last:border-0 align-top">
                        <td className="p-2">
                          <Select
                            value={watchItems[index]?.stock_item_id || undefined}
                            onValueChange={(val) => {
                              setValue(`items.${index}.stock_item_id`, val);
                              const item = allStockItems.find((i) => i.id.toString() === val);
                              if (item) {
                                setValue(`items.${index}.rate`, item.rate);
                              }
                            }}
                            disabled={isLoading || isLoadingItems}
                          >
                            <SelectTrigger className={itemError?.stock_item_id ? "border-destructive" : ""}>
                              <SelectValue placeholder="Item..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allStockItems.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No items available
                                </SelectItem>
                              ) : (
                                allStockItems.map((si) => (
                                  <SelectItem key={si.id} value={si.id.toString()}>
                                    {si.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            {...register(`items.${index}.quantity`)}
                            className={itemError?.quantity ? "border-destructive" : ""}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            {...register(`items.${index}.rate`)}
                          />
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={100}
                              placeholder="0"
                              {...register(`items.${index}.tax_percent`)}
                              className="pr-7"
                            />
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={100}
                              placeholder="0"
                              {...register(`items.${index}.discount_percent`)}
                              className="pr-7"
                            />
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                          </div>
                        </td>
                        <td className="p-2 text-right pt-4 font-medium">
                          ${lineTotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-right pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2Icon className="size-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Grand Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} {...register("notes")} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              Complete Purchase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
