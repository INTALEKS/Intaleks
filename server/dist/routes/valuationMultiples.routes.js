"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicValuationMultiplesRouter = void 0;
const express_1 = require("express");
const valuationMultiples_controller_1 = require("../controllers/valuationMultiples.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleHierarchy_1 = require("../utils/roleHierarchy");
/**
 * Admin authorization middleware
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (!(0, roleHierarchy_1.isAdminOrHigher)(req.user.role)) {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
};
/**
 * Public Router - Accessible to all users (no authentication required)
 * Used by calculator and other public features
 */
exports.publicValuationMultiplesRouter = (0, express_1.Router)();
// GET /api/valuation-multiples - Get all multiples (public for calculator)
exports.publicValuationMultiplesRouter.get("/", valuationMultiples_controller_1.getAllValuationMultiples);
// GET /api/valuation-multiples/:country/:industry - Get specific multiple (public)
exports.publicValuationMultiplesRouter.get("/:country/:industry", valuationMultiples_controller_1.getValuationMultiple);
/**
 * Admin Router - Requires authentication and admin role
 * Used for managing valuation multiples
 */
const adminRouter = (0, express_1.Router)();
// Apply authentication and admin authorization
adminRouter.use(authMiddleware_1.authenticateToken);
adminRouter.use(requireAdmin);
// POST /api/admin/valuation-multiples - Create new multiple
adminRouter.post("/", valuationMultiples_controller_1.createValuationMultiple);
// PUT /api/admin/valuation-multiples/:id - Update multiple
adminRouter.put("/:id", valuationMultiples_controller_1.updateValuationMultiple);
// DELETE /api/admin/valuation-multiples/:id - Delete multiple
adminRouter.delete("/:id", valuationMultiples_controller_1.deleteValuationMultiple);
// POST /api/admin/valuation-multiples/bulk - Bulk create multiples
adminRouter.post("/bulk", valuationMultiples_controller_1.bulkCreateValuationMultiples);
// GET /api/admin/valuation-multiples/export/csv - Export as CSV
adminRouter.get("/export/csv", valuationMultiples_controller_1.exportValuationMultiplesCSV);
// GET /api/admin/valuation-multiples/export/json - Export as JSON
adminRouter.get("/export/json", valuationMultiples_controller_1.exportValuationMultiplesJSON);
exports.default = adminRouter;
