"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, FileTextIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { InvoiceCreate } from "@/types/invoice";
import { invoiceService } from "@/services/invoice";
import { getCustomers } from "@/services/customer.service";
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

const invoiceItemSchema = z.object({
  stock_item_id: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(0.01, "Qty must be > 0"),
  rate: z.coerce.number().min(0, "Rate must be >= 0"),
  tax_percent: z.coerce.number().min(0).max(100).default(0),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
});

const invoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  invoice_number: z.string().min(1, "Invoice No is required"),
  invoice_date: z.string().min(1, "Date is required"),
  due_date: z.string().optional(),
  status: z.enum(["Paid", "Unpaid", "Cancelled"]).default("Unpaid"),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  companyId: number;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
}: InvoiceFormDialogProps) {
  const queryClient = useQueryClient();

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: () => getCustomers(companyId),
    enabled: open,
  });

  const { data: itemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ["stock-items", companyId],
    queryFn: () => getStockItems(companyId, undefined, 1000),
    enabled: open,
  });

  const allCustomers = customersData?.items || [];
  const allStockItems = itemsData?.items || [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "Unpaid",
      notes: "",
      items: [{ stock_item_id: "", quantity: 1, rate: 0, tax_amount: 0, discount_percent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const customerIdValue = watch("customer_id");
  const statusValue = watch("status");

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
        customer_id: "",
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: "",
        status: "Unpaid",
        notes: "",
        items: [{ stock_item_id: "", quantity: 1, rate: 0, tax_percent: 0, discount_percent: 0 }],
      });
    }
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: InvoiceCreate) => invoiceService.create(companyId, data),
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices", companyId] });
      // Invalidate stock items if invoice implies inventory movement
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });

  const onSubmit = (data: InvoiceFormValues) => {
    const payload: InvoiceCreate = {
      customer_id: parseInt(data.customer_id),
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date || undefined,
      total_amount: totalAmount,
      status: data.status,
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
            <FileTextIcon className="size-5 text-primary" />
            Create New Invoice
          </DialogTitle>
          <DialogDescription>
            Record a new invoice for a customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>
                Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={customerIdValue || undefined}
                onValueChange={(val) => setValue("customer_id", val)}
                disabled={isLoading || isLoadingCustomers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {allCustomers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No customers available
                    </SelectItem>
                  ) : (
                    allCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.customer_id && (
                <p className="text-xs text-destructive">{errors.customer_id.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label>
                Invoice No <span className="text-destructive">*</span>
              </Label>
              <Input disabled={isLoading} {...register("invoice_number")} />
              {errors.invoice_number && (
                <p className="text-xs text-destructive">{errors.invoice_number.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-1">
              <Label>
                Invoice Date <span className="text-destructive">*</span>
              </Label>
              <Input type="date" disabled={isLoading} {...register("invoice_date")} />
              {errors.invoice_date && (
                <p className="text-xs text-destructive">{errors.invoice_date.message}</p>
              )}
            </div>
            
            <div className="space-y-2 col-span-1">
              <Label>Due Date (Optional)</Label>
              <Input type="date" disabled={isLoading} {...register("due_date")} />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={statusValue || undefined}
                onValueChange={(val: any) => setValue("status", val)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
