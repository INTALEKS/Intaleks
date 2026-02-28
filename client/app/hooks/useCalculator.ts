import { useMutation } from "@tanstack/react-query";
import { CalculatorAPI, CalculateValuationRequest, CalculateValuationResponse } from "../services/calculator";

export function useCalculateValuation() {
  return useMutation<CalculateValuationResponse, Error, CalculateValuationRequest>({
    mutationFn: (data) => CalculatorAPI.calculateValuation(data),
  });
}
