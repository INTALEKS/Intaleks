"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface UserGrowthChartProps {
  labels?: string[];
  data?: number[];
  isLoading?: boolean;
}

export default function UserGrowthChart({ labels = [], data = [], isLoading = false }: UserGrowthChartProps) {
  // Transform API data to chart format
  const chartData = labels.map((label, index) => ({
    month: label,
    value: data[index] || 0,
  }));

  if (isLoading) {
    return (
      <div className="mt-4">
        <h3 className="mb-1 text-xl font-medium">User Growth</h3>
        <div className="w-full bg-(--light-gray-bg) rounded-md flex items-center justify-center" style={{ height: 320 }}>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="mb-1 text-xl font-medium">User Growth</h3>

      <div className="w-full bg-(--light-gray-bg) rounded-md" style={{ height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
            <CartesianGrid stroke="#e9eaeb" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 14, fontWeight: 600 }} axisLine={{ stroke: "#111", strokeWidth: 1 }} tickLine={false} padding={{ left: 12, right: 12 }} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, "dataMax + 1"]} />
            <Line type="monotone" dataKey="value" stroke="#2b6cf6" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
