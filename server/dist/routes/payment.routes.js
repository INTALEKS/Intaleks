"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const webhook_1 = require("../services/webhook");
const errors_1 = require("../errors");
const authMiddleware_1 = require("../middleware/authMiddleware");
/**
 * Payment routes for authenticated users
 * Requirements: 2.1, 5.2, 6.1
 */
const router = (0, express_1.Router)();
// Apply authentication and email verification to all payment routes
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requireEmailVerified);
// POST /api/payments/checkout - Create checkout session
// Requirements: 2.1
router.post("/checkout", payment_controller_1.PaymentController.createCheckout);
// GET /api/payments/history - Get payment history
// Requirements: 5.2
router.get("/history", payment_controller_1.PaymentController.getPaymentHistory);
// GET /api/payments/subscription - Get subscription status
// Requirements: 4.5
router.get("/subscription", payment_controller_1.PaymentController.getSubscriptionStatus);
// POST /api/payments/cancel - Cancel subscription
// Requirements: 6.1
router.post("/cancel", payment_controller_1.PaymentController.cancelSubscription);
exports.default = router;
/**
 * Webhook routes for Stripe events
 * Note: This router must be mounted BEFORE express.json() middleware
 * because Stripe webhooks require the raw body for signature verification
 * Requirements: 3.1, 3.7
 */
exports.webhookRouter = (0, express_1.Router)();
// POST /api/webhooks/stripe - Handle Stripe webhooks
// Requirements: 3.1, 3.7
exports.webhookRouter.post("/stripe", async (req, res, next) => {
    try {
        // Get the raw body and signature
        const payload = req.body;
        const signature = req.headers["stripe-signature"];
        if (!signature) {
            res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_SIGNATURE",
                    message: "Missing Stripe signature header",
                },
            });
            return;
        }
        // Process the webhook event
        const result = await webhook_1.WebhookService.handleEvent(payload, signature);
        // Return 200 to acknowledge receipt (Requirement 3.7)
        res.status(200).json({
            success: result.success,
            eventType: result.eventType,
            message: result.message,
        });
    }
    catch (error) {
        if ((0, errors_1.isStripeError)(error)) {
            // Return 400 for invalid signatures (Requirement 3.6)
            res.status(error.statusCode).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.userMessage,
                },
            });
            return;
        }
        console.error("Webhook processing error:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "WEBHOOK_ERROR",
                message: "An error occurred while processing webhook",
            },
        });
    }
});
