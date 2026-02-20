"use client";

import { useEffect, useState } from "react";
import Revenue from "@/app/assets/revenue.svg";
import Users from "@/app/assets/users.svg";
import ActiveUsers from "@/app/assets/active-users.svg";
import StatContainer from "@/components/general-ui/StatContainer";
import UserGrowthChart from "@/components/general-ui/UserGrowthChart";
import { PlanPopularityChart } from "@/components/general-ui/PlanPopularityChart";
import { DashboardApi, CombinedDashboardData } from "@/app/services/dashboard";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<CombinedDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const data = await DashboardApi.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats;

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-3">
        <StatContainer title="TOTAL REVENUE" imageIcon={Revenue} value={stats?.totalRevenue ?? 0} increase={stats?.revenueIncreased ?? true} currency={true} changePercent={Math.abs(stats?.revenueChange ?? 0)} />
        <StatContainer title="TOTAL USERS" imageIcon={Users} value={stats?.totalUsers ?? 0} increase={stats?.userIncreased ?? true} currency={false} changePercent={Math.abs(stats?.userChange ?? 0)} />
        <StatContainer title="ACTIVE USERS" imageIcon={ActiveUsers} value={stats?.activeUsers ?? 0} increase={stats?.activeIncreased ?? true} currency={false} changePercent={Math.abs(stats?.activeChange ?? 0)} />
      </div>

      <UserGrowthChart labels={dashboardData?.userGrowth?.labels} data={dashboardData?.userGrowth?.data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PlanPopularityChart data={dashboardData?.planPopularity ?? undefined} isLoading={isLoading} />
        {/* <InquiriesChart labels={dashboardData?.inquiryTrends?.labels} data={dashboardData?.inquiryTrends?.data} isLoading={isLoading} /> */}
      </div>

      {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
    </div>
  );
}
