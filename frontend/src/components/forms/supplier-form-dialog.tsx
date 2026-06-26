"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, TruckIcon } from "lucide-react";

import type { Supplier, SupplierCreate, SupplierUpdate } from "@/types/supplier";
import { createSupplier, updateSupplier } from "@/services/supplier.service";

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
import { Textarea } from "@/components/ui/textarea";

// ------------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------------
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(200),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSuccess?: () => void;
  companyId: number;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
  companyId,
}: SupplierFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Reset form when dialog opens/closes or supplier changes
  useEffect(() => {
    if (open) {
      if (supplier) {
        reset({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
        });
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, supplier, reset]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: SupplierCreate) => createSupplier(data),
    onSuccess: () => {
      toast.success("Supplier created successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create supplier");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: SupplierUpdate) =>
      updateSupplier(supplier!.id, companyId, data),
    onSuccess: () => {
      toast.success("Supplier updated successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers", companyId] });
      queryClient.invalidateQueries({ queryKey: ["supplier", supplier!.id] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update supplier");
    },
  });

  const onSubmit = (data: SupplierFormValues) => {
    // Transform empty strings to undefined to match backend expectations
    const payload = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
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
            <TruckIcon className="size-5 text-primary" />
            {isEditing ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the supplier's details below."
              : "Enter the details to create a new supplier."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Supplier Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Global Supplies Inc."
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@supplier.com"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 890"
                disabled={isLoading}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              rows={3}
              disabled={isLoading}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
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
              {isEditing ? "Save Changes" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
