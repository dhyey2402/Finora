"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockGroups, deleteStockGroup } from "@/services/inventory.service";
import { getCompanies } from "@/services/company.service";
import type { StockGroup } from "@/types/inventory";
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
import { StockGroupFormDialog } from "@/components/forms/stock-group-form-dialog";
import { toast } from "sonner";
import {
  PlusIcon,
  Loader2Icon,
  BoxesIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

export default function StockGroupsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StockGroup | null>(null);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const selectedCompanyId = companies?.[0]?.id;

  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stock-groups", selectedCompanyId],
    queryFn: () => getStockGroups(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const groups = groupsData?.items || [];
  const isLoading = isLoadingCompanies || isLoadingGroups;

  // Helper to resolve parent name
  const getParentName = (parentId?: number) => {
    if (!parentId) return "—";
    const parent = groups.find((g) => g.id === parentId);
    return parent ? parent.name : parentId;
  };

  const deleteMutation = useMutation({
    mutationFn: (groupId: number) => deleteStockGroup(groupId, selectedCompanyId!),
    onSuccess: () => {
      toast.success("Stock Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stock-groups", selectedCompanyId] });
    },
    onError: () => {
      toast.error("Failed to delete stock group");
    },
  });

  const handleDelete = (group: StockGroup) => {
    if (!confirm(`Are you sure you want to delete group "${group.name}"?`)) return;
    deleteMutation.mutate(group.id);
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleEdit = (group: StockGroup) => {
    setEditingGroup(group);
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
          <h1 className="text-2xl font-bold tracking-tight">Stock Groups</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCwIcon className={`mr-1.5 size-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={!selectedCompanyId}>
            <PlusIcon className="mr-1.5 size-3.5" />
            Add Group
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BoxesIcon className="size-4 text-muted-foreground" />
            Stock Groups Directory
          </CardTitle>
          <CardDescription>
            {groups.length > 0 ? `Showing ${groups.length} groups` : "No groups recorded"}
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

          {!isLoading && !isError && groups.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="font-medium text-muted-foreground">No stock groups yet</p>
            </div>
          )}

          {!isLoading && !isError && groups.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Parent Group</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{getParentName(group.parent_id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(group)}>
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(group)} disabled={deleteMutation.isPending}>
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
        <StockGroupFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          stockGroup={editingGroup}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
