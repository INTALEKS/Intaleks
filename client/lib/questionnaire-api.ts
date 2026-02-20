const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

export interface QuestionnaireScores {
  ownerDependence: number;
  recurringRevenue: number;
  customerConcentration: number;
  managementDepth: number;
  growthRate: number;
  competitiveAdvantage: number;
  revenueDiversification: number;
  systemsScalability: number;
  marginStability: number;
  externalRisk: number;
}

export interface QuestionnaireSubmission extends QuestionnaireScores {
  country: string;
  industry: string;
  valuationDocumentId?: string;
  overrideMultiple?: number;
}

export interface QuestionnaireResponse extends QuestionnaireScores {
  id: string;
  userId: string;
  valuationDocumentId: string | null;
  totalScore: number;
  baseMultiple: number | null;
  scoreFactor: number | null;
  calculatedMultiple: number;
  overrideMultiple: number | null;
  multipleCategory: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewResult {
  totalScore: number;
  category: string;
  baseMultiple: number;
  scoreFactor: number;
  calculatedMultiple: number;
  finalMultiple: number;
}

export const questionnaireAPI = {
  /**
   * Submit questionnaire and get calculated multiple
   */
  async submit(data: QuestionnaireSubmission): Promise<QuestionnaireResponse> {
    const response = await fetch(`${BASE_URL}/questionnaire`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to submit questionnaire");
    }

    return result;
  },

  /**
   * Get user's questionnaire responses
   */
  async getUserResponses(): Promise<QuestionnaireResponse[]> {
    const response = await fetch(`${BASE_URL}/questionnaire`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to fetch questionnaire responses");
    }

    return result;
  },

  /**
   * Get a specific questionnaire response
   */
  async getResponse(id: string): Promise<QuestionnaireResponse> {
    const response = await fetch(`${BASE_URL}/questionnaire/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to fetch questionnaire response");
    }

    return result;
  },

  /**
   * Calculate preview without saving
   */
  async calculatePreview(country: string, industry: string, scores: QuestionnaireScores, overrideMultiple?: number): Promise<PreviewResult> {
    const response = await fetch(`${BASE_URL}/questionnaire/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        country,
        industry,
        overrideMultiple,
        ...scores,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to calculate preview");
    }

    return result;
  },
};
