"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, BoxesIcon } from "lucide-react";

import type { StockGroup, StockGroupCreate, StockGroupUpdate } from "@/types/inventory";
import { createStockGroup, updateStockGroup, getStockGroups } from "@/services/inventory.service";

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

const stockGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(150),
  parent_id: z.string().optional().nullable(),
});

type StockGroupFormValues = z.infer<typeof stockGroupSchema>;

interface StockGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockGroup?: StockGroup | null;
  onSuccess?: () => void;
  companyId: number;
}

export function StockGroupFormDialog({
  open,
  onOpenChange,
  stockGroup,
  onSuccess,
  companyId,
}: StockGroupFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!stockGroup;

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["stock-groups", companyId],
    queryFn: () => getStockGroups(companyId),
    enabled: open,
  });
  
  const allGroups = groupsData?.items || [];
  // Filter out the current group to prevent self-referencing parent
  const availableParents = allGroups.filter((g) => g.id !== stockGroup?.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockGroupFormValues>({
    resolver: zodResolver(stockGroupSchema),
    defaultValues: {
      name: "",
      parent_id: null,
    },
  });

  const parentIdValue = watch("parent_id");

  useEffect(() => {
    if (open) {
      if (stockGroup) {
        reset({
          name: stockGroup.name,
          parent_id: stockGroup.parent_id?.toString() || null,
        });
      } else {
        reset({
          name: "",
          parent_id: null,
        });
      }
    }
  }, [open, stockGroup, reset]);

  const createMutation = useMutation({
    mutationFn: (data: StockGroupCreate) => createStockGroup(data),
    onSuccess: () => {
      toast.success("Stock Group created successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-groups", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create stock group");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StockGroupUpdate) => updateStockGroup(stockGroup!.id, companyId, data),
    onSuccess: () => {
      toast.success("Stock Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-groups", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update stock group");
    },
  });

  const onSubmit = (data: StockGroupFormValues) => {
    const payload = {
      name: data.name,
      parent_id: data.parent_id && data.parent_id !== "none" ? parseInt(data.parent_id) : undefined,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BoxesIcon className="size-5 text-primary" />
            {isEditing ? "Edit Stock Group" : "Add Stock Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the stock group below."
              : "Enter the details to create a new stock group."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Electronics / Laptops"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Group (Optional)</Label>
            <Select
              value={parentIdValue || "none"}
              onValueChange={(value) => setValue("parent_id", value)}
              disabled={isLoading || isLoadingGroups}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {availableParents.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parent_id && (
              <p className="text-xs text-destructive">{errors.parent_id.message}</p>
            )}
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
              {isEditing ? "Save Changes" : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
