"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Filter, DollarSign, Users, TrendingUp, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useAdminPayments, useAdminPaymentStats } from "@/app/hooks/usePayments";
import { useSubscriptionPlans } from "@/app/hooks/useSubscriptions";
import { formatPaymentAmount, formatPaymentDate, type PaymentStatusType, type ListPaymentsParams } from "@/app/services/payments";

/**
 * Admin Payments Page
 * Displays payment list with filtering and payment statistics
 */
export default function AdminPaymentsPage() {
  const [filters, setFilters] = useState<ListPaymentsParams>({ page: 1, limit: 10 });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");

  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useAdminPayments(filters);
  const { data: stats, isLoading: statsLoading } = useAdminPaymentStats();
  const { data: plans } = useSubscriptionPlans();

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as PaymentStatusType),
      page: 1,
    }));
  };

  const handlePlanFilter = (value: string) => {
    setSelectedPlan(value);
    setFilters((prev) => ({
      ...prev,
      planId: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleDateFilter = (field: "startDate" | "endDate", date: Date | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [field]: date ? format(date, "yyyy-MM-dd") : undefined,
      page: 1,
    }));
  };

  const getStatusBadgeClass = (status: PaymentStatusType): string => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "FAILED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: PaymentStatusType): string => {
    switch (status) {
      case "SUCCEEDED":
        return "Succeeded";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "REFUNDED":
        return "Refunded";
      default:
        return status;
    }
  };

  const totalPages = paymentsData?.pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all payment transactions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={stats ? formatPaymentAmount(stats.totalRevenue) : "$0.00"} icon={<DollarSign className="h-5 w-5" />} isLoading={statsLoading} />
        <StatCard title="Active Subscriptions" value={stats?.activeSubscriptions?.toString() || "0"} icon={<Users className="h-5 w-5" />} isLoading={statsLoading} />
        <StatCard title="Total Payments" value={paymentsData?.pagination?.total?.toString() || "0"} icon={<CreditCard className="h-5 w-5" />} isLoading={paymentsLoading} />
        <StatCard title="Plans" value={stats?.revenueByPlan?.length?.toString() || "0"} icon={<TrendingUp className="h-5 w-5" />} isLoading={statsLoading} />
      </div>

      {/* Revenue by Plan */}
      {stats?.revenueByPlan && stats.revenueByPlan.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Revenue by Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.revenueByPlan.map((item) => (
              <div key={item.planName} className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">{item.planName}</p>
                <p className="text-lg font-semibold">{formatPaymentAmount(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {/* Plan Filter */}
        <Select value={selectedPlan} onValueChange={handlePlanFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <DatePicker date={filters.startDate ? new Date(filters.startDate) : undefined} onSelect={(date) => handleDateFilter("startDate", date)} placeholder="Select date" className="w-[150px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <DatePicker date={filters.endDate ? new Date(filters.endDate) : undefined} onSelect={(date) => handleDateFilter("endDate", date)} placeholder="Select date" className="w-[150px]" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : paymentsError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-500">
                  Failed to load payments
                </TableCell>
              </TableRow>
            ) : !paymentsData?.payments || paymentsData.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              paymentsData.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatPaymentDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.user?.name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{payment.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.plan?.name || "—"}</TableCell>
                  <TableCell className="font-medium">{formatPaymentAmount(payment.amount, payment.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(payment.status)}>
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[150px] truncate">{payment.stripePaymentId || payment.stripeInvoiceId || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{paymentsData?.pagination?.total || 0} total payments</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: currentPage - 1 }))}>
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button key={pageNum} variant="outline" size="sm" className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""} onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}>
                {pageNum}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setFilters((prev) => ({ ...prev, page: currentPage + 1 }))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Statistics Card Component
 */
function StatCard({ title, value, icon, isLoading }: { title: string; value: string; icon: React.ReactNode; isLoading?: boolean }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mt-2" /> : <p className="text-2xl font-bold mt-2">{value}</p>}
    </div>
  );
}
