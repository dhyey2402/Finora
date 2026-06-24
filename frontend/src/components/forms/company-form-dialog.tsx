"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompany, updateCompany } from "@/services/company.service";
import type { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";

// ------------------------------------------------------------------
// Zod Validation Schema
// ------------------------------------------------------------------
const companySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Name must be 255 characters or less"),
  address: z
    .string()
    .max(500, "Address must be 500 characters or less"),
  contact_number: z
    .string()
    .max(20, "Contact number must be 20 characters or less"),
  state: z
    .string()
    .max(100, "State must be 100 characters or less"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null; // null = create mode, Company = edit mode
  onSuccess: () => void;
}

// ------------------------------------------------------------------
// Company Form Dialog
// ------------------------------------------------------------------
export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyFormDialogProps) {
  const isEditMode = company !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      address: "",
      contact_number: "",
      state: "",
    },
  });

  // Reset form when dialog opens or company changes
  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          name: company.name,
          address: company.address || "",
          contact_number: company.contact_number || "",
          state: company.state || "",
        });
      } else {
        reset({
          name: "",
          address: "",
          contact_number: "",
          state: "",
        });
      }
    }
  }, [open, company, reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);

    // Clean empty optional fields → send null to API instead of ""
    const payload = {
      name: data.name,
      address: data.address || null,
      contact_number: data.contact_number || null,
      state: data.state || null,
    };

    try {
      if (isEditMode && company) {
        await updateCompany(company.id, payload);
        toast.success("Company updated", {
          description: `"${data.name}" has been updated successfully.`,
        });
      } else {
        await createCompany(payload);
        toast.success("Company created", {
          description: `"${data.name}" has been added successfully.`,
        });
      }
      onSuccess();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message =
        axiosError?.response?.data?.detail || "An error occurred. Please try again.";
      toast.error(isEditMode ? "Update failed" : "Creation failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Company" : "Add New Company"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the company details below."
              : "Fill in the details to register a new company."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. Acme Industries Pvt. Ltd."
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="company-address">Address</Label>
            <Textarea
              id="company-address"
              placeholder="Registered office address"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.address}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="company-contact">Contact Number</Label>
            <Input
              id="company-contact"
              placeholder="+91-9876543210"
              disabled={isSubmitting}
              aria-invalid={!!errors.contact_number}
              {...register("contact_number")}
            />
            {errors.contact_number && (
              <p className="text-xs text-destructive">
                {errors.contact_number.message}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="company-state">State</Label>
            <Input
              id="company-state"
              placeholder="e.g. Gujarat"
              disabled={isSubmitting}
              aria-invalid={!!errors.state}
              {...register("state")}
            />
            {errors.state && (
              <p className="text-xs text-destructive">
                {errors.state.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" data-icon="inline-start" />
                  {isEditMode ? "Update Company" : "Create Company"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
