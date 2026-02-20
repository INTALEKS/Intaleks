"use client";

import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell } from "recharts";

interface PlanPopularityData {
  planId: string;
  planName: string;
  subscriberCount: number;
  percentage: number;
}

interface PlanPopularityChartProps {
  data?: PlanPopularityData[];
  isLoading?: boolean;
}

const COLORS = ["#2b6cf6", "#00e5ff", "#eec02a", "#47b5b3", "#ff6b6b"];

export function PlanPopularityChart({ data = [], isLoading = false }: PlanPopularityChartProps) {
  // Transform API data to chart format
  const chartData = data.map((plan) => ({
    plan: plan.planName.toUpperCase(),
    value: plan.subscriberCount,
  }));

  if (isLoading) {
    return (
      <div className="mt-4">
        <h3 className="mb-1 text-xl font-medium">Plan popularity</h3>
        <div className="w-full bg-(--light-gray-bg) rounded-md flex items-center justify-center" style={{ height: 320 }}>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="mb-1 text-xl font-medium">Plan popularity</h3>

      <div className="w-full bg-(--light-gray-bg) rounded-md" style={{ height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 12 }}>
            <CartesianGrid vertical={false} stroke="#e9eaeb" />

            <XAxis dataKey="plan" axisLine={{ stroke: "#111827", strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 14, fontWeight: 700 }} padding={{ left: 24, right: 24 }} />

            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, "dataMax + 2"]} />

            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56} isAnimationActive={false}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
