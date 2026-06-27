"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getCompanies } from "@/services/company.service";
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from "@/hooks/useInventory";
import { UnitForm } from "@/components/inventory/UnitForm";
import { Unit } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const companyId = companies?.[0]?.id || 0;

  const { data, isLoading } = useUnits(companyId, debouncedSearch, limit, (page - 1) * limit);
  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();
  const deleteMutation = useDeleteUnit();

  const handleFormSubmit = async (formData: any) => {
    if (selectedUnit) {
      await updateMutation.mutateAsync({ id: selectedUnit.id, companyId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (unit: Unit) => {
    if (confirm(`Delete unit ${unit.name}?`)) {
      await deleteMutation.mutateAsync({ id: unit.id, companyId });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Units</h1>
        <Button onClick={() => { setSelectedUnit(null); setIsFormOpen(true); }} disabled={!companyId}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search units..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Abbreviation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center">No units found.</TableCell></TableRow>
            ) : (
              data?.items.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{unit.abbreviation}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedUnit(unit); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(unit)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UnitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        unit={selectedUnit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />
    </div>
  );
}
