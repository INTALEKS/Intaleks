import { Router } from "express";
import { authenticateToken, requireEmailVerified, requireActiveSubscription, requirePaidSubscription } from "../middleware/authMiddleware";
import { getUserValuationDocuments, getValuationDocumentById, deleteValuationDocument, generatePDF } from "../controllers/valuation.controller";
import { rateLimitPDF } from "../middleware/rateLimiter";

const router = Router();

// All routes require authentication and email verification
router.use(authenticateToken);
router.use(requireEmailVerified);

// Generate PDF report - requires active subscription and rate limited
router.post("/generate-pdf", requireActiveSubscription, rateLimitPDF, generatePDF);

// Get all valuation documents for the current user
router.get("/", requirePaidSubscription, getUserValuationDocuments);

// Get a single valuation document by ID
router.get("/:id", requirePaidSubscription, getValuationDocumentById);

// Delete a valuation document
router.delete("/:id", requirePaidSubscription, deleteValuationDocument);

export default router;
