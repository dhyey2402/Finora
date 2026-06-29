"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, Package2Icon } from "lucide-react";

import type { StockItem, StockItemCreate, StockItemUpdate } from "@/types/inventory";
import { createStockItem, updateStockItem, getStockGroups, getUnits } from "@/services/inventory.service";

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

const stockItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  sku: z.string().max(100).optional().or(z.literal("")),
  stock_group_id: z.string().min(1, "Stock Group is required"),
  unit_id: z.string().min(1, "Unit is required"),
  quantity: z.coerce.number().min(0).optional(),
  rate: z.coerce.number().min(0).optional(),
});

type StockItemFormValues = z.infer<typeof stockItemSchema>;

interface StockItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockItem?: StockItem | null;
  onSuccess?: () => void;
  companyId: number;
}

export function StockItemFormDialog({
  open,
  onOpenChange,
  stockItem,
  onSuccess,
  companyId,
}: StockItemFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!stockItem;

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["stock-groups", companyId],
    queryFn: () => getStockGroups(companyId),
    enabled: open,
  });

  const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["units", companyId],
    queryFn: () => getUnits(companyId),
    enabled: open,
  });

  const allGroups = groupsData?.items || [];
  const allUnits = unitsData?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockItemFormValues>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      stock_group_id: "",
      unit_id: "",
      quantity: 0,
      rate: 0,
    },
  });

  const stockGroupIdValue = watch("stock_group_id");
  const unitIdValue = watch("unit_id");

  useEffect(() => {
    if (open) {
      if (stockItem) {
        reset({
          name: stockItem.name,
          sku: stockItem.sku || "",
          stock_group_id: stockItem.stock_group_id.toString(),
          unit_id: stockItem.unit_id.toString(),
          quantity: stockItem.quantity,
          rate: stockItem.rate,
        });
      } else {
        reset({
          name: "",
          sku: "",
          stock_group_id: "",
          unit_id: "",
          quantity: 0,
          rate: 0,
        });
      }
    }
  }, [open, stockItem, reset]);

  const createMutation = useMutation({
    mutationFn: (data: StockItemCreate) => createStockItem(data),
    onSuccess: () => {
      toast.success("Stock Item created successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-items", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create stock item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StockItemUpdate) => updateStockItem(stockItem!.id, companyId, data),
    onSuccess: () => {
      toast.success("Stock Item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-items", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update stock item");
    },
  });

  const onSubmit = (data: StockItemFormValues) => {
    const payload = {
      name: data.name,
      sku: data.sku || undefined,
      stock_group_id: parseInt(data.stock_group_id),
      unit_id: parseInt(data.unit_id),
      quantity: data.quantity || 0,
      rate: data.rate || 0,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate({ ...payload, company_id: companyId });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2Icon className="size-5 text-primary" />
            {isEditing ? "Edit Stock Item" : "Add Stock Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the product details below."
              : "Enter the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. MacBook Pro M3"
                disabled={isLoading}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input
                id="sku"
                placeholder="e.g. MBP-M3-14"
                disabled={isLoading}
                {...register("sku")}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_group_id">
                Stock Group <span className="text-destructive">*</span>
              </Label>
              <Select
                value={stockGroupIdValue || undefined}
                onValueChange={(value) => setValue("stock_group_id", value)}
                disabled={isLoading || isLoadingGroups}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {allGroups.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No groups available
                    </SelectItem>
                  ) : (
                    allGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.stock_group_id && (
                <p className="text-xs text-destructive">{errors.stock_group_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Measurement Unit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={unitIdValue || undefined}
                onValueChange={(value) => setValue("unit_id", value)}
                disabled={isLoading || isLoadingUnits}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {allUnits.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No units available
                    </SelectItem>
                  ) : (
                    allUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name} ({u.abbreviation})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.unit_id && (
                <p className="text-xs text-destructive">{errors.unit_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Opening Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                disabled={isLoading || isEditing}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Standard Rate</Label>
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
              {isEditing ? "Save Changes" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
