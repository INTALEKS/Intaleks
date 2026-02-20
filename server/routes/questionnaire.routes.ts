import { Router, Request, Response, NextFunction } from "express";
import * as questionnaireController from "../controllers/questionnaire.controller";
import { authenticateToken } from "../middleware/authMiddleware";

/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN role
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      error: "Access denied",
      message: "Admin privileges required",
    });
    return;
  }

  next();
};

const router = Router();

// Public routes (authenticated users)
router.post("/", authenticateToken, questionnaireController.submitQuestionnaire);
router.get("/", authenticateToken, questionnaireController.getUserResponses);
router.get("/:id", authenticateToken, questionnaireController.getQuestionnaireResponse);
router.post("/preview", questionnaireController.calculatePreview); // No auth for preview

export { router as questionnaireRouter };
