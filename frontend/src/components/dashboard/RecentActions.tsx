import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditLog } from "@/types/audit-log";

interface RecentActionsProps {
  actions: AuditLog[];
}

export function RecentActions({ actions }: RecentActionsProps) {
  return (
    <Card className="rounded-xl border-border/50 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Recent Actions</CardTitle>
        <CardDescription>Latest actions performed in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent actions found.
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex flex-col space-y-1">
                  <span className="font-medium capitalize">{action.action.toLowerCase()} {action.table_name}</span>
                  <span className="text-sm text-muted-foreground">
                    Record ID: {action.record_id || "N/A"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(action.timestamp).toLocaleDateString()} {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
