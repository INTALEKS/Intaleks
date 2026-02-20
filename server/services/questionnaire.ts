import { prisma } from "../config/db";
import { NotFoundError } from "../errors";

export interface QuestionnaireInput {
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
  country: string;
  industry: string;
  valuationDocumentId?: string;
  overrideMultiple?: number; // User can override the calculated multiple
}

/**
 * Calculate total score from questionnaire responses
 */
function calculateTotalScore(input: QuestionnaireInput): number {
  return input.ownerDependence + input.recurringRevenue + input.customerConcentration + input.managementDepth + input.growthRate + input.competitiveAdvantage + input.revenueDiversification + input.systemsScalability + input.marginStability + input.externalRisk;
}

/**
 * Determine score range based on total score
 * Maps score to database scoreRange values
 */
function getScoreRange(score: number): string {
  if (score >= 40) return "40-50";
  if (score >= 30) return "30-39";
  if (score >= 20) return "20-29";
  return "<20";
}

/**
 * Determine multiple category based on score
 * Score ranges: 40-50 (Excellent), 30-39 (Good), 20-29 (Average), <20 (Below Average)
 */
function getMultipleCategory(score: number): string {
  if (score >= 40) return "Excellent";
  if (score >= 30) return "Good";
  if (score >= 20) return "Average";
  return "Below Average";
}

/**
 * Get the pre-calculated multiple from database based on score
 * The multiples are already calculated and stored for each score range
 */
async function calculateMultiple(country: string, industry: string, score: number): Promise<{ baseMultiple: number; scoreFactor: number; calculatedMultiple: number; scoreRange: string }> {
  // Determine score range
  const scoreRange = getScoreRange(score);

  // Get pre-calculated multiple from database
  const multipleRecord = await prisma.valuationMultiple.findUnique({
    where: {
      country_industry_scoreRange: {
        country: country.toLowerCase(),
        industry: industry.toLowerCase(),
        scoreRange: scoreRange,
      },
    },
  });

  if (!multipleRecord) {
    console.warn(`⚠️  No valuation multiple found for country="${country}", industry="${industry}", scoreRange="${scoreRange}". Using fallback value of 4.0x`);
  }

  const calculatedMultiple = multipleRecord?.multiple || 4.0;

  // For backwards compatibility, calculate what the base and factor would be
  // Base is always the 40-50 range multiple
  const baseRecord = await prisma.valuationMultiple.findUnique({
    where: {
      country_industry_scoreRange: {
        country: country.toLowerCase(),
        industry: industry.toLowerCase(),
        scoreRange: "40-50",
      },
    },
  });

  const baseMultiple = baseRecord?.multiple || 4.0;
  const scoreFactor = baseMultiple > 0 ? calculatedMultiple / baseMultiple : 1.0;

  return { baseMultiple, scoreFactor, calculatedMultiple, scoreRange };
}

/**
 * Submit questionnaire response and calculate multiple
 */
export async function submitQuestionnaire(userId: string, input: QuestionnaireInput) {
  const totalScore = calculateTotalScore(input);
  const category = getMultipleCategory(totalScore);
  const { baseMultiple, scoreFactor, calculatedMultiple, scoreRange } = await calculateMultiple(input.country, input.industry, totalScore);

  // Use override multiple if provided, otherwise use calculated multiple
  const finalMultiple = input.overrideMultiple ?? calculatedMultiple;

  const response = await prisma.questionnaireResponse.create({
    data: {
      userId,
      ownerDependence: input.ownerDependence,
      recurringRevenue: input.recurringRevenue,
      customerConcentration: input.customerConcentration,
      managementDepth: input.managementDepth,
      growthRate: input.growthRate,
      competitiveAdvantage: input.competitiveAdvantage,
      revenueDiversification: input.revenueDiversification,
      systemsScalability: input.systemsScalability,
      marginStability: input.marginStability,
      externalRisk: input.externalRisk,
      totalScore,
      baseMultiple,
      scoreFactor,
      calculatedMultiple: finalMultiple,
      overrideMultiple: input.overrideMultiple,
      multipleCategory: category,
      valuationDocumentId: input.valuationDocumentId,
    },
  });

  return response;
}

/**
 * Get user's questionnaire responses
 */
export async function getUserQuestionnaireResponses(userId: string) {
  return await prisma.questionnaireResponse.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a specific questionnaire response
 */
export async function getQuestionnaireResponse(id: string) {
  const response = await prisma.questionnaireResponse.findUnique({
    where: { id },
  });

  if (!response) {
    throw new NotFoundError("Questionnaire response not found");
  }

  return response;
}

/**
 * Calculate preview multiple without saving
 */
export async function calculatePreviewMultiple(
  country: string,
  industry: string,
  input: Omit<QuestionnaireInput, "country" | "industry" | "valuationDocumentId">,
  overrideMultiple?: number,
): Promise<{
  totalScore: number;
  category: string;
  baseMultiple: number;
  scoreFactor: number;
  calculatedMultiple: number;
  finalMultiple: number;
  scoreRange: string;
}> {
  const totalScore = calculateTotalScore({ ...input, country, industry });
  const category = getMultipleCategory(totalScore);
  const { baseMultiple, scoreFactor, calculatedMultiple, scoreRange } = await calculateMultiple(country, industry, totalScore);
  const finalMultiple = overrideMultiple ?? calculatedMultiple;

  return {
    totalScore,
    category,
    baseMultiple,
    scoreFactor,
    calculatedMultiple,
    finalMultiple,
    scoreRange,
  };
}
