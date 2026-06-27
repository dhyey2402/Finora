"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getCompanies } from "@/services/company.service";
import { useLedgers, useCreateLedger, useUpdateLedger, useDeleteLedger } from "@/hooks/useLedger";
import { useGroups } from "@/hooks/useGroup";
import { LedgerForm } from "@/components/ledgers/LedgerForm";
import { Ledger } from "@/types/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function LedgersPage() {
  const [page, setPage] = useState(1);
  const limit = 100;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const companyId = companies?.[0]?.id || 0;

  const { data: ledgers, isLoading } = useLedgers({ company_id: companyId, search: debouncedSearch, limit, skip: (page - 1) * limit });
  const { data: groups } = useGroups({ company_id: companyId });
  
  const createMutation = useCreateLedger();
  const updateMutation = useUpdateLedger(selectedLedger?.id || 0, companyId);
  const deleteMutation = useDeleteLedger();

  const handleFormSubmit = async (formData: any) => {
    if (selectedLedger) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (ledger: Ledger) => {
    if (confirm(`Delete ledger ${ledger.name}?`)) {
      await deleteMutation.mutateAsync({ id: ledger.id, companyId });
    }
  };

  const getGroupName = (groupId: number) => {
    const group = groups?.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Ledger Management</h1>
            <p className="text-muted-foreground">Manage accounting ledgers.</p>
        </div>
        <Button onClick={() => { setSelectedLedger(null); setIsFormOpen(true); }} disabled={!companyId}>
          <Plus className="mr-2 h-4 w-4" /> Add Ledger
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ledgers..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Opening Balance</TableHead>
              <TableHead className="text-right">Current Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
            ) : ledgers?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center">No ledgers found.</TableCell></TableRow>
            ) : (
              ledgers?.map(ledger => (
                <TableRow key={ledger.id}>
                  <TableCell className="font-medium">{ledger.name}</TableCell>
                  <TableCell>{ledger.code || "-"}</TableCell>
                  <TableCell>{getGroupName(ledger.group_id)}</TableCell>
                  <TableCell className="text-right">{ledger.opening_balance}</TableCell>
                  <TableCell className="text-right">{ledger.current_balance}</TableCell>
                  <TableCell>
                    {ledger.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedLedger(ledger); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ledger)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LedgerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        ledger={selectedLedger}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />
    </div>
  );
}
