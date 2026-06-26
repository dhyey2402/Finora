"use client";

import { useDashboard } from "@/services/dashboard";
import { Building2, Package, Truck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FinancialCard } from "@/components/dashboard/FinancialCard";
import { RecentActions } from "@/components/dashboard/RecentActions";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/DashboardError";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
        <DashboardHeader />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return <DashboardError onRetry={() => refetch()} />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <DashboardHeader />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Companies"
          icon={Building2}
          value={data.companies_count}
          description="Registered companies"
        />
        <StatCard
          title="Customers"
          icon={Users}
          value={data.customers_count}
          description="Total customers"
        />
        <StatCard
          title="Suppliers"
          icon={Truck}
          value={data.suppliers_count}
          description="Registered suppliers"
        />
        <StatCard
          title="Inventory"
          icon={Package}
          value={data.inventory_count}
          description="Stock items"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <FinancialCard title="Income" amount={data.income} type="income" />
        <FinancialCard title="Expenses" amount={data.expenses} type="expense" />
        <FinancialCard title="Net Profit" amount={data.net_profit} type="profit" />
      </div>

      {/* Recent Actions */}
      <div className="w-full">
        <RecentActions actions={data.recent_actions} />
      </div>
    </div>
  );
}
