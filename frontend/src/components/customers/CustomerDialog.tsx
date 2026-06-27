"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";

interface CustomerDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomerDialog({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CustomerDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right">Name</span>
            <span className="col-span-3">{customer.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right">Email</span>
            <span className="col-span-3">{customer.email || "-"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right">Phone</span>
            <span className="col-span-3">{customer.phone || "-"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right">Address</span>
            <span className="col-span-3 whitespace-pre-wrap">{customer.address || "-"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right">Created At</span>
            <span className="col-span-3">
              {new Date(customer.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
