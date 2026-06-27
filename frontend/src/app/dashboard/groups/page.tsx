"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getCompanies } from "@/services/company.service";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/hooks/useGroup";
import { GroupForm } from "@/components/groups/GroupForm";
import { Group } from "@/types/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function GroupsPage() {
  const [page, setPage] = useState(1);
  const limit = 100; // Simplified for now
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const companyId = companies?.[0]?.id || 0;

  const { data: groups, isLoading } = useGroups({ company_id: companyId, search: debouncedSearch, limit, skip: (page - 1) * limit });
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup(selectedGroup?.id || 0, companyId);
  const deleteMutation = useDeleteGroup();

  const handleFormSubmit = async (formData: any) => {
    if (selectedGroup) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (group: Group) => {
    if (confirm(`Delete group ${group.name}?`)) {
      await deleteMutation.mutateAsync({ id: group.id, companyId });
    }
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return "-";
    const parent = groups?.find(g => g.id === parentId);
    return parent ? parent.name : parentId;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
            <p className="text-muted-foreground">Manage accounting groups.</p>
        </div>
        <Button onClick={() => { setSelectedGroup(null); setIsFormOpen(true); }} disabled={!companyId}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search groups..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Parent Group</TableHead>
              <TableHead>Number of Ledgers</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
            ) : groups?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">No groups found.</TableCell></TableRow>
            ) : (
              groups?.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.code || "-"}</TableCell>
                  <TableCell>{getParentName(group.parent_id)}</TableCell>
                  <TableCell>{group.ledger_count}</TableCell>
                  <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(group); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(group)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <GroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        group={selectedGroup}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />
    </div>
  );
}
