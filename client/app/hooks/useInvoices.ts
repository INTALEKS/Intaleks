"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "../services/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "VOID";
  emailSent: boolean;
  emailSentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    price: number;
  } | null;
  payment: {
    id: string;
    description: string | null;
  };
}

/**
 * Hook to fetch user's invoices
 */
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await ApiClient.getInvoices();
      return response.data;
    },
  });
}

/**
 * Hook to fetch a specific invoice
 */
export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: async (): Promise<Invoice> => {
      const response = await ApiClient.getInvoice(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
  });
}

/**
 * Hook to resend invoice email
 */
export function useResendInvoiceEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await ApiClient.resendInvoiceEmail(invoiceId);
      return response;
    },
    onSuccess: (_, invoiceId) => {
      // Invalidate and refetch invoice data
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
    },
  });
}
