"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePaymentHistory } from "@/app/hooks/usePayments";
import { formatPaymentAmount, formatPaymentDate, type PaymentStatusType } from "@/app/services/payments";

interface PaymentHistoryProps {
  className?: string;
  limit?: number;
}

/**
 * Get badge variant based on payment status
 */
function getPaymentStatusVariant(status: PaymentStatusType): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "SUCCEEDED":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "REFUNDED":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Get human-readable payment status label
 */
function getPaymentStatusLabel(status: PaymentStatusType): string {
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
}

/**
 * Payment History Component
 * Displays payments in table format with formatted amounts
 * Requirements: 5.2, 5.4
 */
export function PaymentHistory({ className, limit }: PaymentHistoryProps) {
  const { data: payments, isLoading, error } = usePaymentHistory();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-destructive">Failed to load payment history</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">No payment history found</p>
      </div>
    );
  }

  const displayPayments = limit ? payments.slice(0, limit) : payments;

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatPaymentDate(payment.createdAt)}</TableCell>
              <TableCell>{payment.description || payment.plan?.name || "Payment"}</TableCell>
              <TableCell className="font-medium">{formatPaymentAmount(payment.amount, payment.currency)}</TableCell>
              <TableCell>
                <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
