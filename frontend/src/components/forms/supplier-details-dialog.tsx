"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/types/supplier";
import {
  TruckIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";

interface SupplierDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  isDeleting?: boolean;
}

export function SupplierDetailsDialog({
  open,
  onOpenChange,
  supplier,
  onEdit,
  onDelete,
  isDeleting,
}: SupplierDetailsDialogProps) {
  if (!supplier) return null;

  const createdAt = new Date(supplier.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TruckIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">{supplier.name}</DialogTitle>
              <div className="text-sm text-muted-foreground mt-0.5">
                Supplier Details
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 grid gap-4 rounded-lg border p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <MailIcon className="size-4 text-muted-foreground shrink-0" />
            <div className="text-sm">
              {supplier.email ? (
                <a
                  href={`mailto:${supplier.email}`}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {supplier.email}
                </a>
              ) : (
                <span className="text-muted-foreground italic">No email provided</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PhoneIcon className="size-4 text-muted-foreground shrink-0" />
            <div className="text-sm">
              {supplier.phone ? (
                <a
                  href={`tel:${supplier.phone}`}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {supplier.phone}
                </a>
              ) : (
                <span className="text-muted-foreground italic">No phone provided</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPinIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              {supplier.address ? (
                <span className="whitespace-pre-wrap">{supplier.address}</span>
              ) : (
                <span className="text-muted-foreground italic">No address provided</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 px-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            Added on {createdAt}
          </div>
          <div>ID: {supplier.id}</div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(supplier)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2Icon className="mr-2 size-4" />
            )}
            Delete
          </Button>
          <Button
            onClick={() => onEdit(supplier)}
            disabled={isDeleting}
          >
            <PencilIcon className="mr-2 size-4" />
            Edit Supplier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
