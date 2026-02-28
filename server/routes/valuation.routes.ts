import { Router } from "express";
import { authenticateToken, requireEmailVerified, requireActiveSubscription } from "../middleware/authMiddleware";
import { createValuationDocument, getUserValuationDocuments, getValuationDocumentById, deleteValuationDocument, generatePDF } from "../controllers/valuation.controller";
import { rateLimitPDF } from "../middleware/rateLimiter";

const router = Router();

// All routes require authentication and email verification
router.use(authenticateToken);
router.use(requireEmailVerified);

// Generate PDF report - requires active subscription and rate limited
router.post("/generate-pdf", requireActiveSubscription, rateLimitPDF, generatePDF);

// Create a new valuation document - requires active subscription and rate limited
router.post("/", requireActiveSubscription, rateLimitPDF, createValuationDocument);

// Get all valuation documents for the current user
router.get("/", getUserValuationDocuments);

// Get a single valuation document by ID
router.get("/:id", getValuationDocumentById);

// Delete a valuation document
router.delete("/:id", deleteValuationDocument);

export default router;
