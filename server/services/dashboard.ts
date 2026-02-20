import { prisma } from "../config/db";

/**
 * Dashboard Service - Handles dashboard statistics and analytics
 * Requirements: 1.1-6.4
 */

// Type definitions based on design document
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
  errors?: {
    stats?: string;
    userGrowth?: string;
    planPopularity?: string;
  };
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export class DashboardService {
  /**
   * Get aggregated dashboard statistics
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  static async getStats(): Promise<DashboardStats> {
    const now = new Date();

    // Previous period: last month (used for comparison)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get current period metrics
    const [totalUsers, activeUsers, subscriptionPlans] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.subscriptionPlan.findMany({
        include: { _count: { select: { users: true } } },
      }),
    ]);

    // Calculate total revenue (sum of plan.price * subscriber count)
    // Price is stored in cents, convert to dollars for display
    const totalRevenue = subscriptionPlans.reduce((sum: number, plan: { price: number; _count: { users: number } }) => {
      return sum + (plan.price / 100) * plan._count.users;
    }, 0);

    // Get previous period user counts for comparison
    const [previousTotalUsers, previousActiveUsers] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { lte: previousMonthEnd } },
      }),
      prisma.user.count({
        where: {
          status: "ACTIVE",
          createdAt: { lte: previousMonthEnd },
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userChange = calculateChange(totalUsers, previousTotalUsers);
    const activeChange = calculateChange(activeUsers, previousActiveUsers);

    // For revenue, we'd need historical data - simplified to 0 for now
    const revenueChange = 0;

    return {
      totalRevenue,
      revenueChange,
      revenueIncreased: revenueChange >= 0,
      totalUsers,
      userChange,
      userIncreased: userChange >= 0,
      activeUsers,
      activeChange,
      activeIncreased: activeChange >= 0,
    };
  }

  /**
   * Get subscription plan popularity data
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  static async getPlanPopularity(): Promise<PlanPopularityData[]> {
    // Get all subscription plans with their subscriber counts (Requirement 3.4 - include all plans)
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // If no plans exist, return empty array (Requirement 3.5)
    if (plans.length === 0) {
      return [];
    }

    // Calculate total subscribers for percentage calculation
    const totalSubscribers = plans.reduce((sum: number, plan: { _count: { users: number } }) => sum + plan._count.users, 0);

    // Map to PlanPopularityData format (Requirements 3.1, 3.2)
    const planPopularityData: PlanPopularityData[] = plans.map((plan: { id: string; name: string; _count: { users: number } }) => ({
      planId: plan.id,
      planName: plan.name,
      subscriberCount: plan._count.users,
      percentage: totalSubscribers > 0 ? Math.round((plan._count.users / totalSubscribers) * 100) : 0,
    }));

    // Sort by subscriber count descending (Requirement 3.3)
    planPopularityData.sort((a, b) => b.subscriberCount - a.subscriberCount);

    return planPopularityData;
  }

  /**
   * Get user growth time-series data
   * Requirements: 2.1, 2.2, 2.3, 2.4
   */
  static async getUserGrowth(timeRange?: TimeRange): Promise<TimeSeriesData> {
    const now = new Date();

    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (timeRange) {
      startDate = new Date(timeRange.startDate);
      endDate = new Date(timeRange.endDate);
    } else {
      // Default to last 12 months (Requirement 2.3)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    // Get all users within the date range
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Generate month labels and aggregate counts
    const monthlyData = new Map<string, number>();

    // Initialize all months in range with 0
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthlyData.set(key, 0);
      current.setMonth(current.getMonth() + 1);
    }

    // Count users per month
    for (const user of users) {
      const date = new Date(user.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData.has(key)) {
        monthlyData.set(key, (monthlyData.get(key) || 0) + 1);
      }
    }

    // Convert to arrays
    const sortedKeys = Array.from(monthlyData.keys()).sort();
    const labels = sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    });
    const data = sortedKeys.map((key) => monthlyData.get(key) || 0);

    return {
      labels,
      data,
      period: "monthly",
    };
  }

  /**
   * Get combined dashboard data with all metrics
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   * - Executes all queries in parallel (5.5)
   * - Returns partial data with error indicators for failed sections (5.4)
   * - Applies time range to userGrowth (5.2)
   * - Structures response with clearly named sections (5.3)
   */
  static async getDashboardData(timeRange?: TimeRange): Promise<CombinedDashboardData> {
    // Execute all queries in parallel using Promise.allSettled (Requirement 5.5)
    const [statsResult, userGrowthResult, planPopularityResult] = await Promise.allSettled([
      this.getStats(),
      this.getUserGrowth(timeRange), // Apply time range (Requirement 5.2)
      this.getPlanPopularity(),
    ]);

    // Structure response with clearly named sections (Requirement 5.3)
    const result: CombinedDashboardData = {
      stats: null,
      userGrowth: null,
      planPopularity: null,
    };

    const errors: CombinedDashboardData["errors"] = {};

    // Process stats result (Requirement 5.4 - partial data with error indicators)
    if (statsResult.status === "fulfilled") {
      result.stats = statsResult.value;
    } else {
      errors.stats = statsResult.reason?.message || "Failed to fetch statistics";
    }

    // Process userGrowth result
    if (userGrowthResult.status === "fulfilled") {
      result.userGrowth = userGrowthResult.value;
    } else {
      errors.userGrowth = userGrowthResult.reason?.message || "Failed to fetch user growth data";
    }

    // Process planPopularity result
    if (planPopularityResult.status === "fulfilled") {
      result.planPopularity = planPopularityResult.value;
    } else {
      errors.planPopularity = planPopularityResult.reason?.message || "Failed to fetch plan popularity data";
    }

    // Only include errors object if there are errors (Requirement 5.4)
    if (Object.keys(errors).length > 0) {
      result.errors = errors;
    }

    return result;
  }
}
