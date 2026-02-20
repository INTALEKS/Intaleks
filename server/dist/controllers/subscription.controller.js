"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscription_1 = require("../services/subscription");
const errors_1 = require("../errors");
const subscriptionValidation_1 = require("../validation/subscriptionValidation");
/**
 * Subscription Controller
 * Handles all HTTP request/response logic for subscription plan management endpoints
 * Requirements: 9.1-13.3
 */
class SubscriptionController {
    /**
     * Get all subscription plans
     * GET /api/admin/subscriptions
     * Requirements: 9.1, 9.2
     */
    static async getPlans(req, res) {
        try {
            const plans = await subscription_1.SubscriptionService.findAll();
            res.status(200).json({
                success: true,
                data: plans,
            });
        }
        catch (error) {
            console.error("Get plans error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving subscription plans",
                },
            });
        }
    }
    /**
     * Get a single subscription plan by ID
     * GET /api/admin/subscriptions/:id
     * Requirements: 9.1
     */
    static async getPlanById(req, res) {
        try {
            const { id } = req.params;
            const plan = await subscription_1.SubscriptionService.findById(id);
            res.status(200).json({
                success: true,
                data: plan,
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
            console.error("Get plan by ID error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving the subscription plan",
                },
            });
        }
    }
    /**
     * Create a new subscription plan
     * POST /api/admin/subscriptions
     */
    static async createPlan(req, res) {
        try {
            // Validate request body
            const { error, value } = subscriptionValidation_1.createSubscriptionSchema.validate(req.body, {
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
                        message: "Invalid plan data",
                        details,
                    },
                });
                return;
            }
            const plan = await subscription_1.SubscriptionService.create(value);
            res.status(201).json({
                success: true,
                message: "Subscription plan created successfully",
                data: plan,
            });
        }
        catch (error) {
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: error.message,
                        details: error.details,
                    },
                });
                return;
            }
            console.error("Create plan error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while creating the subscription plan",
                },
            });
        }
    }
    /**
     * Update an existing subscription plan
     * PUT /api/admin/subscriptions/:id
     */
    static async updatePlan(req, res) {
        try {
            const { id } = req.params;
            // Validate request body
            const { error, value } = subscriptionValidation_1.updateSubscriptionSchema.validate(req.body, {
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
                        message: "Invalid update data",
                        details,
                    },
                });
                return;
            }
            const plan = await subscription_1.SubscriptionService.update(id, value);
            res.status(200).json({
                success: true,
                message: "Subscription plan updated successfully",
                data: plan,
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
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            if (error instanceof errors_1.ValidationError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: error.message,
                        details: error.details,
                    },
                });
                return;
            }
            console.error("Update plan error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while updating the subscription plan",
                },
            });
        }
    }
    /**
     * Delete a subscription plan
     * DELETE /api/admin/subscriptions/:id
     */
    static async deletePlan(req, res) {
        try {
            const { id } = req.params;
            await subscription_1.SubscriptionService.delete(id);
            res.status(200).json({
                success: true,
                message: "Subscription plan deleted successfully",
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
            if (error instanceof errors_1.ConflictError) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: "CONFLICT",
                        message: error.message,
                    },
                });
                return;
            }
            console.error("Delete plan error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while deleting the subscription plan",
                },
            });
        }
    }
    /**
     * Activate a subscription plan
     * PATCH /api/admin/subscriptions/:id/activate
     */
    static async activatePlan(req, res) {
        try {
            const { id } = req.params;
            const plan = await subscription_1.SubscriptionService.activate(id);
            res.status(200).json({
                success: true,
                message: "Subscription plan activated successfully",
                data: plan,
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
            console.error("Activate plan error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while activating the subscription plan",
                },
            });
        }
    }
    /**
     * Deactivate a subscription plan
     * PATCH /api/admin/subscriptions/:id/deactivate
     */
    static async deactivatePlan(req, res) {
        try {
            const { id } = req.params;
            const plan = await subscription_1.SubscriptionService.deactivate(id);
            res.status(200).json({
                success: true,
                message: "Subscription plan deactivated successfully",
                data: plan,
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
            console.error("Deactivate plan error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while deactivating the subscription plan",
                },
            });
        }
    }
    /**
     * Get all active subscription plans (public endpoint)
     * GET /api/subscriptions/plans
     * Requirements: 5.1, 5.2, 5.3
     */
    static async getActivePlans(req, res) {
        try {
            const plans = await subscription_1.SubscriptionService.findActivePlans();
            // Return only required fields per Requirements 5.2
            const publicPlans = plans.map((plan) => ({
                id: plan.id,
                name: plan.name,
                price: plan.price,
                billingPeriod: plan.billingPeriod,
                features: plan.features,
            }));
            res.status(200).json({
                success: true,
                data: publicPlans,
            });
        }
        catch (error) {
            console.error("Get active plans error:", error);
            res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An error occurred while retrieving subscription plans",
                },
            });
        }
    }
}
exports.SubscriptionController = SubscriptionController;
