"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getCompanies } from "@/services/company.service";
import { useStockGroups, useCreateStockGroup, useUpdateStockGroup, useDeleteStockGroup } from "@/hooks/useInventory";
import { StockGroupForm } from "@/components/inventory/StockGroupForm";
import { StockGroup } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";

interface TreeNode extends StockGroup {
  children: TreeNode[];
}

export default function StockGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<StockGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const companyId = companies?.[0]?.id || 0;

  // We fetch without pagination for building a full tree
  const { data, isLoading } = useStockGroups(companyId, undefined, 1000, 0);
  const createMutation = useCreateStockGroup();
  const updateMutation = useUpdateStockGroup();
  const deleteMutation = useDeleteStockGroup();

  const handleFormSubmit = async (formData: any) => {
    if (selectedGroup) {
      await updateMutation.mutateAsync({ id: selectedGroup.id, companyId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (group: StockGroup) => {
    if (confirm(`Delete stock group ${group.name}?`)) {
      await deleteMutation.mutateAsync({ id: group.id, companyId });
    }
  };

  const tree = useMemo(() => {
    if (!data?.items) return [];
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];
    
    data.items.forEach(g => map.set(g.id, { ...g, children: [] }));
    data.items.forEach(g => {
      const node = map.get(g.id)!;
      if (g.parent_id && map.has(g.parent_id)) {
        map.get(g.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [data]);

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return (
      <ul className={level > 0 ? "pl-6 border-l ml-2 space-y-2 mt-2" : "space-y-2"}>
        {nodes.map(node => (
          <li key={node.id} className="w-full">
            <div className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow">
              <span className="font-medium">{node.name}</span>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(node); setIsFormOpen(true); }}>
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(node)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            {node.children.length > 0 && renderTree(node.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Groups</h1>
        <Button onClick={() => { setSelectedGroup(null); setIsFormOpen(true); }} disabled={!companyId}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      <div className="bg-muted/10 p-4 rounded-lg border">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4 ml-6" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No stock groups found.</div>
        ) : (
          renderTree(tree)
        )}
      </div>

      <StockGroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        group={selectedGroup}
        groups={data?.items || []}
        isLoading={createMutation.isPending || updateMutation.isPending}
        companyId={companyId}
      />
    </div>
  );
}
