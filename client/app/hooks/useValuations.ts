"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ValuationApi, type CreateValuationDocumentInput } from "@/app/services/valuations";
import { toast } from "sonner";

const VALUATION_KEYS = {
  all: ["valuations"] as const,
  detail: (id: string) => ["valuations", id] as const,
};

/**
 * Hook to fetch all valuation documents for the current user
 */
export function useValuationDocuments() {
  return useQuery({
    queryKey: VALUATION_KEYS.all,
    queryFn: () => ValuationApi.getAll(),
  });
}

/**
 * Hook to fetch a single valuation document
 */
export function useValuationDocument(id: string) {
  return useQuery({
    queryKey: VALUATION_KEYS.detail(id),
    queryFn: () => ValuationApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new valuation document
 */
export function useCreateValuationDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateValuationDocumentInput) => ValuationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VALUATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save valuation document");
    },
  });
}

/**
 * Hook to delete a valuation document
 */
export function useDeleteValuationDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ValuationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VALUATION_KEYS.all });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });
}
