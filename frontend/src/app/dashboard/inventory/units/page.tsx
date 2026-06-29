"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnits, deleteUnit } from "@/services/inventory.service";
import { getCompanies } from "@/services/company.service";
import type { Unit } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnitFormDialog } from "@/components/forms/unit-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  TagsIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

export default function UnitsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: unitsData,
    isLoading: isLoadingUnits,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["units", selectedCompanyId],
    queryFn: () => getUnits(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const units = unitsData?.items || [];
  const isLoading = isLoadingCompanies || isLoadingUnits;

  const deleteMutation = useMutation({
    mutationFn: (unitId: number) => deleteUnit(unitId, selectedCompanyId!),
    onSuccess: () => {
      toast.success("Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["units", selectedCompanyId] });
    },
    onError: () => {
      toast.error("Failed to delete unit");
    },
  });

  const handleDelete = (unit: Unit) => {
    if (!confirm(`Are you sure you want to delete unit "${unit.name}"?`)) return;
    deleteMutation.mutate(unit.id);
  };

  const handleAdd = () => {
    setEditingUnit(null);
    setDialogOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setDialogOpen(true);
  };

  if (!companies?.length && !isLoadingCompanies) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No Companies Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Measurement Units</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory measurement units.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedCompanyId}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Unit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagsIcon className="size-4 text-muted-foreground" />
            Units Directory
          </CardTitle>
          <CardDescription>
            {units.length > 0 ? `Showing ${units.length} units` : "No units recorded"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex items-center justify-center py-16">
              <AlertCircleIcon className="size-10 text-destructive/60" />
            </div>
          )}

          {!isLoading && !isError && units.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No units yet</p>
            </div>
          )}

          {!isLoading && !isError && units.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.abbreviation}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(unit)} disabled={deleteMutation.isPending}>
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCompanyId && (
        <UnitFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          unit={editingUnit}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
