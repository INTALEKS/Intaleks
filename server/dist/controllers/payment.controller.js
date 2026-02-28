"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_1 = require("../services/payment");
const errors_1 = require("../errors");
const paymentValidation_1 = require("../validation/paymentValidation");
const roleHierarchy_1 = require("../utils/roleHierarchy");
/**
 * Payment Controller
 * Handles all HTTP request/response logic for payment endpoints
 * Requirements: 2.1, 5.2, 6.1
 */
class PaymentController {
    /**
     * Create a checkout session for a subscription plan
     * POST /api/payments/checkout
     * Requirements: 2.1
     */
    static async createCheckout(req, res) {
        try {
            // Validate request body
            const { error, value } = paymentValidation_1.createCheckoutSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid checkout request",
                        details,
                    },
                });
                return;
            }
            // Ensure user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            const { planId, successUrl, cancelUrl } = value;
            // Create checkout session
            const result = await payment_1.PaymentService.createCheckoutSession({
                userId: req.user.id,
                planId,
                successUrl,
                cancelUrl,
            });
            res.status(200).json({
                success: true,
                data: {
                    sessionId: result.sessionId,
                    url: result.url,
                },
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if ((0, errors_1.isStripeError)(error)) {
                console.error("Stripe error details:", {
                    code: error.code,
                    statusCode: error.statusCode,
                    message: error.message,
                    userMessage: error.userMessage,
                });
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.userMessage,
                    },
                });
                return;
            }
            console.error("Create checkout error:", error);
            console.error("Error details:", {
                name: error instanceof Error ? error.name : "Unknown",
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while creating checkout session",
                },
            });
        }
    }
    /**
     * Get payment history for the authenticated user
     * GET /api/payments/history
     * Requirements: 5.2
     */
    static async getPaymentHistory(req, res) {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            const payments = await payment_1.PaymentService.getPaymentHistory(req.user.id);
            res.status(200).json({
                success: true,
                data: payments,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Get payment history error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving payment history",
                },
            });
        }
    }
    /**
     * Get subscription status for the authenticated user
     * GET /api/payments/subscription
     * Requirements: 4.5
     */
    static async getSubscriptionStatus(req, res) {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            const status = await payment_1.PaymentService.getSubscriptionStatus(req.user.id);
            res.status(200).json({
                success: true,
                data: status,
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Get subscription status error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving subscription status",
                },
            });
        }
    }
    /**
     * Cancel subscription for the authenticated user
     * POST /api/payments/cancel
     * Requirements: 6.1
     */
    static async cancelSubscription(req, res) {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            await payment_1.PaymentService.cancelSubscription(req.user.id);
            res.status(200).json({
                success: true,
                message: "Subscription will be canceled at the end of the current billing period",
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            if ((0, errors_1.isStripeError)(error)) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.userMessage,
                    },
                });
                return;
            }
            console.error("Cancel subscription error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while canceling subscription",
                },
            });
        }
    }
    /**
     * Get all payments with filtering (admin only)
     * GET /api/admin/payments
     * Requirements: 7.1, 7.2
     */
    static async getAllPayments(req, res) {
        try {
            // Ensure user is authenticated and is admin
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            if (!(0, roleHierarchy_1.isAdminOrHigher)(req.user.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Admin access required",
                    },
                });
                return;
            }
            // Validate query parameters
            const { error, value } = paymentValidation_1.listPaymentsSchema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid query parameters",
                        details,
                    },
                });
                return;
            }
            const result = await payment_1.PaymentService.getAllPayments(value);
            res.status(200).json({
                success: true,
                data: result.payments,
                pagination: result.pagination,
            });
        }
        catch (error) {
            console.error("Get all payments error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving payments",
                },
            });
        }
    }
    /**
     * Get payment statistics (admin only)
     * GET /api/admin/payments/stats
     * Requirements: 7.1
     */
    static async getPaymentStats(req, res) {
        try {
            // Ensure user is authenticated and is admin
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            if (!(0, roleHierarchy_1.isAdminOrHigher)(req.user.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Admin access required",
                    },
                });
                return;
            }
            const stats = await payment_1.PaymentService.getPaymentStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Get payment stats error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving payment statistics",
                },
            });
        }
    }
    /**
     * Grant subscription access to a user (admin only)
     * POST /api/admin/users/:id/grant-subscription
     * Requirements: 7.4, 7.5
     */
    static async grantSubscription(req, res) {
        try {
            // Ensure user is authenticated and is admin
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            if (!(0, roleHierarchy_1.isAdminOrHigher)(req.user.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Admin access required",
                    },
                });
                return;
            }
            // Validate request body
            const { error, value } = paymentValidation_1.grantSubscriptionSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid request body",
                        details,
                    },
                });
                return;
            }
            const userId = req.params.id;
            const { planId } = value;
            await payment_1.PaymentService.grantSubscriptionAccess(userId, planId, req.user.id);
            res.status(200).json({
                success: true,
                message: "Subscription access granted successfully",
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Grant subscription error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while granting subscription access",
                },
            });
        }
    }
    /**
     * Revoke subscription access from a user (admin only)
     * POST /api/admin/users/:id/revoke-subscription
     * Requirements: 7.4, 7.5
     */
    static async revokeSubscription(req, res) {
        try {
            // Ensure user is authenticated and is admin
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Authentication required",
                    },
                });
                return;
            }
            if (!(0, roleHierarchy_1.isAdminOrHigher)(req.user.role)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: "FORBIDDEN",
                        message: "Admin access required",
                    },
                });
                return;
            }
            // Validate request body (optional reason)
            const { error, value } = paymentValidation_1.revokeSubscriptionSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const details = {};
                error.details.forEach((detail) => {
                    const field = detail.path.join(".");
                    if (!details[field]) {
                        details[field] = [];
                    }
                    details[field].push(detail.message);
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid request body",
                        details,
                    },
                });
                return;
            }
            const userId = req.params.id;
            const { reason } = value;
            await payment_1.PaymentService.revokeSubscriptionAccess(userId, req.user.id, reason);
            res.status(200).json({
                success: true,
                message: "Subscription access revoked successfully",
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Revoke subscription error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while revoking subscription access",
                },
            });
        }
    }
}
exports.PaymentController = PaymentController;
