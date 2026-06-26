import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Company } from "@/types/company";

interface RecentCompaniesProps {
  companies: Company[];
}

export function RecentCompanies({ companies }: RecentCompaniesProps) {
  return (
    <Card className="rounded-xl border-border/50 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Recent Companies</CardTitle>
        <CardDescription>Latest companies added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No companies found.
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {company.state || "State not provided"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(company.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
