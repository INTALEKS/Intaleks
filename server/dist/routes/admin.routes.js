"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../services/auth");
const authValidation_1 = require("../validation/authValidation");
const cookieUtils_1 = require("../utils/cookieUtils");
const payment_controller_1 = require("../controllers/payment.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Admin login endpoint
router.post("/auth/login", (0, authValidation_1.validateRequest)(authValidation_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await auth_1.AuthService.loginAdmin({ email, password });
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message,
            });
        }
        cookieUtils_1.CookieUtils.setAuthToken(res, result.token);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: { user: result.user },
        });
    }
    catch (error) {
        console.error("Login endpoint error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
// Admin payment routes (require authentication)
// GET /api/admin/payments - List all payments with filtering
// Requirements: 7.1, 7.2
router.get("/payments", authMiddleware_1.authenticateToken, payment_controller_1.PaymentController.getAllPayments);
// GET /api/admin/payments/stats - Get payment statistics
// Requirements: 7.1
router.get("/payments/stats", authMiddleware_1.authenticateToken, payment_controller_1.PaymentController.getPaymentStats);
// POST /api/admin/users/:id/grant-subscription - Grant subscription access
// Requirements: 7.4, 7.5
router.post("/users/:id/grant-subscription", authMiddleware_1.authenticateToken, payment_controller_1.PaymentController.grantSubscription);
// POST /api/admin/users/:id/revoke-subscription - Revoke subscription access
// Requirements: 7.4, 7.5
router.post("/users/:id/revoke-subscription", authMiddleware_1.authenticateToken, payment_controller_1.PaymentController.revokeSubscription);
exports.default = router;
