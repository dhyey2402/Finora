"use client";

import type { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, Trash2Icon, Loader2Icon } from "lucide-react";

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface CompanyDetailsDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  isDeleting: boolean;
}

// ------------------------------------------------------------------
// Company Details Dialog
// ------------------------------------------------------------------
export function CompanyDetailsDialog({
  company,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting,
}: CompanyDetailsDialogProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Company Details</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="grid gap-6">
          {/* General Information */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="bg-muted/30 pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                General Information
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold text-foreground">{company.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div>
                  <Badge
                    variant={company.is_active ? "default" : "secondary"}
                    className="font-medium"
                  >
                    {company.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">
                  {company.address || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-sm text-foreground">
                  {company.contact_number || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">State</p>
                <p className="text-sm text-foreground">
                  {company.state || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">GST Number</p>
                <p className="text-sm text-foreground">
                  {company.gst_number || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Financial Year</p>
                <p className="text-sm text-foreground">
                  {company.financial_year || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="border-border/50 shadow-none">
            <CardHeader className="bg-muted/30 pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                System Information
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Company ID</p>
                <p className="font-mono text-sm">{company.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Created At</p>
                <p className="text-sm">
                  {new Date(company.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Updated At</p>
                <p className="text-sm">
                  {new Date(company.updated_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        <div className="p-6 pt-4 border-t">
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(company)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2Icon className="mr-2 size-4" data-icon="inline-start" />
                  Delete Company
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDeleting}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => onEdit(company)}
                disabled={isDeleting}
              >
                <PencilIcon className="mr-2 size-4" data-icon="inline-start" />
                Edit Company
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
