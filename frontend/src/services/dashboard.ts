import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardSummaryResponse } from "@/types/dashboard";

/**
 * Fetch dashboard summary data
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  const { data } = await api.get<DashboardSummaryResponse>("/dashboard/summary");
  return data;
};

/**
 * Hook to manage dashboard data fetching state
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
