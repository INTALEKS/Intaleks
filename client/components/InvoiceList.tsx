"use client";

import { useInvoices, useResendInvoiceEmail } from "../app/hooks/useInvoices";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Mail, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function InvoiceList() {
  const { data: invoices, isLoading } = useInvoices();
  const resendEmailMutation = useResendInvoiceEmail();

  const handleResendEmail = async (invoiceId: string, invoiceNumber: string) => {
    try {
      await resendEmailMutation.mutateAsync(invoiceId);
      toast.success(`Invoice ${invoiceNumber} email sent successfully`);
    } catch {
      toast.error("Failed to send invoice email");
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency.toUpperCase() === "USD" ? "$" : currency.toUpperCase();
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">No invoices found. Invoices will appear here after you make payments.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                  <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.createdAt)}
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatAmount(invoice.amount, invoice.currency)}
                  </div>

                  {invoice.plan && <div className="text-gray-500">{invoice.plan.name}</div>}
                </div>

                {invoice.payment.description && <div className="text-sm text-gray-500 mt-1">{invoice.payment.description}</div>}
              </div>

              <div className="flex items-center gap-2">
                {invoice.status === "PAID" && (
                  <Button variant="outline" size="sm" onClick={() => handleResendEmail(invoice.id, invoice.invoiceNumber)} disabled={resendEmailMutation.isPending} className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {resendEmailMutation.isPending ? "Sending..." : "Resend Email"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
