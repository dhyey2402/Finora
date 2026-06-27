"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Unit, UnitCreate, UnitUpdate } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const unitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  abbreviation: z.string().min(1, "Abbreviation is required").max(20),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  unit: Unit | null;
  isLoading: boolean;
  companyId: number;
}

export function UnitForm({ isOpen, onClose, onSubmit, unit, isLoading, companyId }: UnitFormProps) {
  const isEditing = !!unit;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", abbreviation: "" },
  });

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        reset({ name: unit.name, abbreviation: unit.abbreviation });
      } else {
        reset({ name: "", abbreviation: "" });
      }
    }
  }, [isOpen, unit, reset]);

  const handleFormSubmit = (data: UnitFormValues) => {
    if (isEditing) {
      onSubmit(data as UnitUpdate);
    } else {
      onSubmit({ ...data, company_id: companyId } as UnitCreate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Add Unit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" disabled={isLoading} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abbreviation *</Label>
            <Input id="abbreviation" disabled={isLoading} {...register("abbreviation")} />
            {errors.abbreviation && <p className="text-sm text-destructive">{errors.abbreviation.message}</p>}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isEditing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
