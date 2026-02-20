"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionnaireAPI, type QuestionnaireSubmission, type QuestionnaireScores } from "@/lib/questionnaire-api";
import { toast } from "sonner";

const QUESTIONNAIRE_KEYS = {
  all: ["questionnaire"] as const,
  responses: () => [...QUESTIONNAIRE_KEYS.all, "responses"] as const,
  response: (id: string) => [...QUESTIONNAIRE_KEYS.all, "response", id] as const,
};

/**
 * Hook to get user's questionnaire responses
 */
export function useQuestionnaireResponses() {
  return useQuery({
    queryKey: QUESTIONNAIRE_KEYS.responses(),
    queryFn: () => questionnaireAPI.getUserResponses(),
  });
}

/**
 * Hook to get a specific questionnaire response
 */
export function useQuestionnaireResponse(id: string) {
  return useQuery({
    queryKey: QUESTIONNAIRE_KEYS.response(id),
    queryFn: () => questionnaireAPI.getResponse(id),
    enabled: !!id,
  });
}

/**
 * Hook to submit questionnaire
 */
export function useSubmitQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionnaireSubmission) => questionnaireAPI.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTIONNAIRE_KEYS.responses() });
      toast.success("Questionnaire submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit questionnaire");
    },
  });
}

/**
 * Hook to calculate preview without saving
 */
export function useCalculatePreview() {
  return useMutation({
    mutationFn: ({ country, industry, scores, overrideMultiple }: { country: string; industry: string; scores: QuestionnaireScores; overrideMultiple?: number }) => questionnaireAPI.calculatePreview(country, industry, scores, overrideMultiple),
  });
}
