import { Router } from "express";
import { getAllValuationMultiples, getValuationMultiple, createValuationMultiple, updateValuationMultiple, deleteValuationMultiple, exportValuationMultiplesCSV, exportValuationMultiplesJSON, bulkCreateValuationMultiples } from "../controllers/valuationMultiples.controller";
import { authenticateToken } from "../middleware/authMiddleware";
import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

/**
 * Admin authorization middleware
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
};

/**
 * Public Router - Accessible to all users (no authentication required)
 * Used by calculator and other public features
 */
export const publicValuationMultiplesRouter = Router();

// GET /api/valuation-multiples - Get all multiples (public for calculator)
publicValuationMultiplesRouter.get("/", getAllValuationMultiples);

// GET /api/valuation-multiples/:country/:industry - Get specific multiple (public)
publicValuationMultiplesRouter.get("/:country/:industry", getValuationMultiple);

/**
 * Admin Router - Requires authentication and admin role
 * Used for managing valuation multiples
 */
const adminRouter = Router();

// Apply authentication and admin authorization
adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

// POST /api/admin/valuation-multiples - Create new multiple
adminRouter.post("/", createValuationMultiple);

// PUT /api/admin/valuation-multiples/:id - Update multiple
adminRouter.put("/:id", updateValuationMultiple);

// DELETE /api/admin/valuation-multiples/:id - Delete multiple
adminRouter.delete("/:id", deleteValuationMultiple);

// POST /api/admin/valuation-multiples/bulk - Bulk create multiples
adminRouter.post("/bulk", bulkCreateValuationMultiples);

// GET /api/admin/valuation-multiples/export/csv - Export as CSV
adminRouter.get("/export/csv", exportValuationMultiplesCSV);

// GET /api/admin/valuation-multiples/export/json - Export as JSON
adminRouter.get("/export/json", exportValuationMultiplesJSON);

export default adminRouter;
