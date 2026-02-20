import { Request, Response } from "express";
import * as questionnaireService from "../services/questionnaire";
import { submitQuestionnaireSchema } from "../validation/questionnaireValidation";

/**
 * Submit questionnaire response
 * POST /api/questionnaire
 */
export async function submitQuestionnaire(req: Request, res: Response): Promise<void> {
  const { error, value } = submitQuestionnaireSchema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const response = await questionnaireService.submitQuestionnaire(userId, value);
  res.json(response);
}

/**
 * Get user's questionnaire responses
 * GET /api/questionnaire
 */
export async function getUserResponses(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const responses = await questionnaireService.getUserQuestionnaireResponses(userId);
  res.json(responses);
}

/**
 * Get a specific questionnaire response
 * GET /api/questionnaire/:id
 */
export async function getQuestionnaireResponse(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const response = await questionnaireService.getQuestionnaireResponse(id);
  res.json(response);
}

/**
 * Calculate preview multiple without saving
 * POST /api/questionnaire/preview
 */
export async function calculatePreview(req: Request, res: Response): Promise<void> {
  const { country, industry, overrideMultiple, ...scores } = req.body;

  if (!country || !industry) {
    res.status(400).json({ error: "Country and industry are required" });
    return;
  }

  const result = await questionnaireService.calculatePreviewMultiple(country, industry, scores, overrideMultiple);
  res.json(result);
}
