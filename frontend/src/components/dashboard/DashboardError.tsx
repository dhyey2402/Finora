import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DashboardErrorProps {
  onRetry: () => void;
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col items-start gap-4">
          <span>Unable to load dashboard.</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
