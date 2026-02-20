import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { createValuationDocument, getUserValuationDocuments, getValuationDocumentById, deleteValuationDocument, generatePDF } from "../controllers/valuation.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Generate PDF report
router.post("/generate-pdf", generatePDF);

// Create a new valuation document
router.post("/", createValuationDocument);

// Get all valuation documents for the current user
router.get("/", getUserValuationDocuments);

// Get a single valuation document by ID
router.get("/:id", getValuationDocumentById);

// Delete a valuation document
router.delete("/:id", deleteValuationDocument);

export default router;
