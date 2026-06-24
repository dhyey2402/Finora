"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboardIcon,
  BuildingIcon,
  BookOpenIcon,
  FolderTreeIcon,
  PackageIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  BarChart3Icon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ChevronLeftIcon,
} from "lucide-react";

// ------------------------------------------------------------------
// Sidebar Navigation Items
// ------------------------------------------------------------------
const sidebarItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Companies",
    href: "/dashboard/companies",
    icon: BuildingIcon,
  },
  {
    label: "Ledgers",
    href: "/dashboard/ledgers",
    icon: BookOpenIcon,
    disabled: true,
  },
  {
    label: "Groups",
    href: "/dashboard/groups",
    icon: FolderTreeIcon,
    disabled: true,
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: PackageIcon,
    disabled: true,
  },
  {
    label: "Purchases",
    href: "/dashboard/purchases",
    icon: ShoppingCartIcon,
    disabled: true,
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: ReceiptIcon,
    disabled: true,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3Icon,
    disabled: true,
  },
];

// ------------------------------------------------------------------
// Dashboard Layout
// ------------------------------------------------------------------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth guard — redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ---------------------------------------------------------- */}
      {/* Mobile Overlay */}
      {/* ---------------------------------------------------------- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---------------------------------------------------------- */}
      {/* Sidebar */}
      {/* ---------------------------------------------------------- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative lg:z-auto",
          collapsed ? "w-16" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sidebar-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <span className="text-sm font-bold">S</span>
              </div>
              <span className="text-base font-semibold tracking-tight">
                SmartERP
              </span>
            </Link>
          )}

          {/* Collapse toggle (desktop) */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden text-sidebar-foreground/60 hover:text-sidebar-foreground lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeftIcon
              className={cn(
                "size-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>

          {/* Close button (mobile) */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));

            const linkContent = (
              <Link
                href={item.disabled ? "#" : item.href}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  item.disabled &&
                    "pointer-events-none opacity-40"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.disabled && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                    Soon
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                    {item.disabled && " (Coming Soon)"}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        <Separator />

        {/* Logout */}
        <div className="p-2">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-sidebar-foreground/60 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon className="size-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </aside>

      {/* ---------------------------------------------------------- */}
      {/* Main Content Area */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-semibold">SmartERP</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
