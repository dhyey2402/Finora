"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, TagsIcon } from "lucide-react";

import type { Unit, UnitCreate, UnitUpdate } from "@/types/inventory";
import { createUnit, updateUnit } from "@/services/inventory.service";

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

const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(100),
  abbreviation: z.string().min(1, "Abbreviation is required").max(20),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSuccess?: () => void;
  companyId: number;
}

export function UnitFormDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
  companyId,
}: UnitFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!unit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (unit) {
        reset({
          name: unit.name,
          abbreviation: unit.abbreviation,
        });
      } else {
        reset({
          name: "",
          abbreviation: "",
        });
      }
    }
  }, [open, unit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: UnitCreate) => createUnit(data),
    onSuccess: () => {
      toast.success("Unit created successfully");
      queryClient.invalidateQueries({ queryKey: ["units", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to create unit");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UnitUpdate) => updateUnit(unit!.id, companyId, data),
    onSuccess: () => {
      toast.success("Unit updated successfully");
      queryClient.invalidateQueries({ queryKey: ["units", companyId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update unit");
    },
  });

  const onSubmit = (data: UnitFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({ ...data, company_id: companyId });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagsIcon className="size-5 text-primary" />
            {isEditing ? "Edit Unit" : "Add Unit"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the measurement unit below."
              : "Enter the details to create a new measurement unit."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Unit Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Kilogram / Pieces"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">
              Abbreviation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="abbreviation"
              placeholder="e.g. kg / pcs"
              disabled={isLoading}
              {...register("abbreviation")}
            />
            {errors.abbreviation && (
              <p className="text-xs text-destructive">{errors.abbreviation.message}</p>
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
              {isEditing ? "Save Changes" : "Create Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
