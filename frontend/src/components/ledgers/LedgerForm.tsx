import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ledger } from "@/types/ledger";
import { useGroups } from "@/hooks/useGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LedgerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    ledger?: Ledger | null;
    isLoading?: boolean;
    companyId: number;
}

export function LedgerForm({ isOpen, onClose, onSubmit, ledger, isLoading, companyId }: LedgerFormProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [groupId, setGroupId] = useState<string>("");
    const [openingBalance, setOpeningBalance] = useState<number | "">(0);
    const [isActive, setIsActive] = useState(true);

    const { data: groups } = useGroups({ company_id: companyId });

    useEffect(() => {
        if (ledger) {
            setName(ledger.name);
            setCode(ledger.code || "");
            setGroupId(ledger.group_id.toString());
            setOpeningBalance(ledger.opening_balance);
            setIsActive(ledger.is_active);
        } else {
            setName("");
            setCode("");
            setGroupId("");
            setOpeningBalance(0);
            setIsActive(true);
        }
    }, [ledger, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            code: code || undefined,
            group_id: parseInt(groupId),
            company_id: companyId,
            opening_balance: openingBalance === "" ? 0 : Number(openingBalance),
            is_active: isActive
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ledger ? "Edit Ledger" : "Create Ledger"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bank Account" />
                    </div>
                    <div className="space-y-2">
                        <Label>Code (Optional)</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. BNK01" />
                    </div>
                    <div className="space-y-2">
                        <Label>Group *</Label>
                        <Select value={groupId} onValueChange={setGroupId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups?.map((g) => (
                                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Opening Balance</Label>
                        <Input type="number" min="0" step="0.01" required value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value === "" ? "" : Number(e.target.value))} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                        <Label htmlFor="active">Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || !groupId}>{isLoading ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
