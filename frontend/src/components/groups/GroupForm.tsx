import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Group } from "@/types/group";
import { useGroups } from "@/hooks/useGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GroupFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    group?: Group | null;
    isLoading?: boolean;
    companyId: number;
}

export function GroupForm({ isOpen, onClose, onSubmit, group, isLoading, companyId }: GroupFormProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [parentId, setParentId] = useState<string>("none");

    // Fetch groups for the parent selector
    const { data: groups } = useGroups({ company_id: companyId });

    useEffect(() => {
        if (group) {
            setName(group.name);
            setCode(group.code || "");
            setParentId(group.parent_id ? group.parent_id.toString() : "none");
        } else {
            setName("");
            setCode("");
            setParentId("none");
        }
    }, [group, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            code: code || undefined,
            parent_id: parentId !== "none" ? parseInt(parentId) : undefined,
            company_id: companyId
        });
    };

    // Filter out the current group to prevent self-referencing parent
    const availableParents = groups?.filter(g => g.id !== group?.id) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{group ? "Edit Group" : "Create Group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Current Assets" />
                    </div>
                    <div className="space-y-2">
                        <Label>Code (Optional)</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CA01" />
                    </div>
                    <div className="space-y-2">
                        <Label>Parent Group</Label>
                        <Select value={parentId} onValueChange={setParentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Parent Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Root Group)</SelectItem>
                                {availableParents.map((g) => (
                                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
