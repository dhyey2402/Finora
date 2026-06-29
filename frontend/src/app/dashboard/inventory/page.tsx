"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2Icon, TagsIcon, BoxesIcon, BarChart3Icon } from "lucide-react";
import Link from "next/link";

export default function InventoryDashboardPage() {
  const links = [
    { name: "Units", href: "/dashboard/inventory/units", icon: TagsIcon, desc: "Manage measurement units" },
    { name: "Stock Groups", href: "/dashboard/inventory/stock-groups", icon: BoxesIcon, desc: "Categorize inventory" },
    { name: "Stock Items", href: "/dashboard/inventory/stock-items", icon: Package2Icon, desc: "Manage products" },
    { name: "Transactions", href: "/dashboard/inventory/transactions", icon: BarChart3Icon, desc: "View stock movements" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your inventory system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:bg-muted/50 transition-colors h-full cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{link.name}</CardTitle>
                <link.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
