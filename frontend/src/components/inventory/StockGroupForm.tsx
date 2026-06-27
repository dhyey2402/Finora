"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockGroup, StockGroupCreate, StockGroupUpdate } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const groupSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  parent_id: z.number().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface StockGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  group: StockGroup | null;
  groups: StockGroup[];
  isLoading: boolean;
  companyId: number;
}

export function StockGroupForm({ isOpen, onClose, onSubmit, group, groups, isLoading, companyId }: StockGroupFormProps) {
  const isEditing = !!group;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", parent_id: undefined },
  });

  const watchParentId = watch("parent_id");

  useEffect(() => {
    if (isOpen) {
      if (group) {
        reset({ name: group.name, parent_id: group.parent_id });
      } else {
        reset({ name: "", parent_id: undefined });
      }
    }
  }, [isOpen, group, reset]);

  const handleFormSubmit = (data: GroupFormValues) => {
    if (isEditing) {
      onSubmit(data as StockGroupUpdate);
    } else {
      onSubmit({ ...data, company_id: companyId } as StockGroupCreate);
    }
  };

  const availableParents = groups.filter(g => g.id !== group?.id); // cannot be own parent

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Stock Group" : "Add Stock Group"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" disabled={isLoading} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Parent Group</Label>
            <Select 
              disabled={isLoading} 
              value={watchParentId?.toString() || "none"}
              onValueChange={(val) => setValue("parent_id", val === "none" ? undefined : parseInt(val, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Parent Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Level)</SelectItem>
                {availableParents.map(g => (
                  <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
