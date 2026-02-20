// Dashboard API Service
// Integrates with /api/admin/dashboard endpoints

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  revenueIncreased: boolean;
  totalUsers: number;
  userChange: number;
  userIncreased: boolean;
  activeUsers: number;
  activeChange: number;
  activeIncreased: boolean;
}

export interface TimeSeriesData {
  labels: string[];
  data: number[];
  period: string;
}

export interface PlanPopularityData {
  planId: string;
  planName: string;
  subscriberCount: number;
  percentage: number;
}

export interface CombinedDashboardData {
  stats: DashboardStats | null;
  userGrowth: TimeSeriesData | null;
  planPopularity: PlanPopularityData[] | null;
  inquiryTrends: TimeSeriesData | null;
  errors?: {
    stats?: string;
    userGrowth?: string;
    planPopularity?: string;
    inquiryTrends?: string;
  };
}

export interface TimeRange {
  startDate: string;
  endDate: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

async function fetchWithAuth<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "Request failed");
  }

  return result.data as T;
}

export const DashboardApi = {
  /**
   * Get combined dashboard data (stats, user growth, plan popularity, inquiry trends)
   */
  async getDashboardData(timeRange?: TimeRange): Promise<CombinedDashboardData> {
    let url = `${BASE_URL}/admin/dashboard`;
    if (timeRange) {
      const params = new URLSearchParams({
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      });
      url += `?${params.toString()}`;
    }
    return fetchWithAuth<CombinedDashboardData>(url);
  },

  /**
   * Get aggregated statistics only
   */
  async getStats(): Promise<DashboardStats> {
    return fetchWithAuth<DashboardStats>(`${BASE_URL}/admin/dashboard/stats`);
  },

  /**
   * Get user growth time-series data
   */
  async getUserGrowth(timeRange?: TimeRange): Promise<TimeSeriesData> {
    let url = `${BASE_URL}/admin/dashboard/user-growth`;
    if (timeRange) {
      const params = new URLSearchParams({
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      });
      url += `?${params.toString()}`;
    }
    return fetchWithAuth<TimeSeriesData>(url);
  },

  /**
   * Get subscription plan popularity data
   */
  async getPlanPopularity(): Promise<PlanPopularityData[]> {
    return fetchWithAuth<PlanPopularityData[]>(`${BASE_URL}/admin/dashboard/plan-popularity`);
  },

  /**
   * Get inquiry trends time-series data
   */
  async getInquiryTrends(timeRange?: TimeRange): Promise<TimeSeriesData> {
    let url = `${BASE_URL}/admin/dashboard/inquiry-trends`;
    if (timeRange) {
      const params = new URLSearchParams({
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      });
      url += `?${params.toString()}`;
    }
    return fetchWithAuth<TimeSeriesData>(url);
  },
};
