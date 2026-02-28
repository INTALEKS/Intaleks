"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const valuation_controller_1 = require("../controllers/valuation.controller");
const router = (0, express_1.Router)();
// All routes require authentication and email verification
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requireEmailVerified);
// Generate PDF report
router.post("/generate-pdf", valuation_controller_1.generatePDF);
// Create a new valuation document
router.post("/", valuation_controller_1.createValuationDocument);
// Get all valuation documents for the current user
router.get("/", valuation_controller_1.getUserValuationDocuments);
// Get a single valuation document by ID
router.get("/:id", valuation_controller_1.getValuationDocumentById);
// Delete a valuation document
router.delete("/:id", valuation_controller_1.deleteValuationDocument);
exports.default = router;
