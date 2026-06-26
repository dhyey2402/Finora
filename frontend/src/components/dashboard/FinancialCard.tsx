import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "profit";
}

export function FinancialCard({ title, amount, type }: FinancialCardProps) {
  const textColorClass = {
    income: "text-green-600 dark:text-green-500",
    expense: "text-red-600 dark:text-red-500",
    profit: "text-blue-600 dark:text-blue-500",
  }[type];

  return (
    <Card className="rounded-xl border-border/50 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", textColorClass)}>
          ₹ {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </CardContent>
    </Card>
  );
}
