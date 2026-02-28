"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicSubscriptionRouter = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const db_1 = require("../config/db");
const stripe_sync_1 = require("../services/stripe-sync");
const roleHierarchy_1 = require("../utils/roleHierarchy");
const router = (0, express_1.Router)();
/**
 * Public subscription routes (no authentication required)
 */
exports.publicSubscriptionRouter = (0, express_1.Router)();
// GET /api/subscriptions/plans - Get all active subscription plans (public)
exports.publicSubscriptionRouter.get("/plans", subscription_controller_1.SubscriptionController.getActivePlans);
/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN or SUPER_ADMIN role
 */
const requireAdmin = (req, res, next) => {
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
    next();
};
// Apply authentication and admin authorization to all routes
router.use(authMiddleware_1.authenticateToken);
router.use(requireAdmin);
/**
 * Subscription Plan Management Routes
 * Requirements: 9.1-13.3
 */
// GET /api/admin/subscriptions - List all subscription plans
// Requirements: 9.1, 9.2
router.get("/", subscription_controller_1.SubscriptionController.getPlans);
// GET /api/admin/subscriptions/:id - Get plan by ID
// Requirements: 9.1
router.get("/:id", subscription_controller_1.SubscriptionController.getPlanById);
// POST /api/admin/subscriptions - Create new plan
// Requirements: 10.1, 10.2, 10.3
router.post("/", subscription_controller_1.SubscriptionController.createPlan);
// PUT /api/admin/subscriptions/:id - Update plan
// Requirements: 11.1, 11.2, 11.3
router.put("/:id", subscription_controller_1.SubscriptionController.updatePlan);
// DELETE /api/admin/subscriptions/:id - Delete plan
// Requirements: 13.1, 13.2, 13.3
router.delete("/:id", subscription_controller_1.SubscriptionController.deletePlan);
// PATCH /api/admin/subscriptions/:id/activate - Activate plan
// Requirements: 12.1, 12.3
router.patch("/:id/activate", subscription_controller_1.SubscriptionController.activatePlan);
// PATCH /api/admin/subscriptions/:id/deactivate - Deactivate plan
// Requirements: 12.2, 12.3
router.patch("/:id/deactivate", subscription_controller_1.SubscriptionController.deactivatePlan);
// POST /api/admin/subscriptions/:id/sync-stripe - Sync plan with Stripe
router.post("/:id/sync-stripe", async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "Plan not found" },
            });
        }
        // If plan already has Stripe IDs, skip
        if (plan.stripePriceId && plan.stripeProductId) {
            return res.status(200).json({
                success: true,
                message: "Plan already synced with Stripe",
                data: plan,
            });
        }
        // Create Stripe product and price
        const stripeIds = await stripe_sync_1.StripeSyncService.createProductAndPrice(plan);
        await stripe_sync_1.StripeSyncService.storeStripeIds(plan.id, stripeIds);
        const updatedPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        return res.status(200).json({
            success: true,
            message: "Plan synced with Stripe successfully",
            data: updatedPlan,
        });
    }
    catch (error) {
        console.error("Sync plan with Stripe error:", error);
        return res.status(500).json({
            success: false,
            error: { code: "SYNC_FAILED", message: "Failed to sync plan with Stripe" },
        });
    }
});
// POST /api/admin/subscriptions/sync-all-stripe - Sync all plans with Stripe
router.post("/sync-all-stripe", async (req, res) => {
    try {
        const plans = await db_1.prisma.subscriptionPlan.findMany({
            where: {
                OR: [{ stripePriceId: null }, { stripeProductId: null }],
            },
        });
        const results = [];
        for (const plan of plans) {
            try {
                const stripeIds = await stripe_sync_1.StripeSyncService.createProductAndPrice(plan);
                await stripe_sync_1.StripeSyncService.storeStripeIds(plan.id, stripeIds);
                results.push({ planId: plan.id, name: plan.name, status: "synced" });
            }
            catch (err) {
                results.push({ planId: plan.id, name: plan.name, status: "failed", error: err.message });
            }
        }
        return res.status(200).json({
            success: true,
            message: `Synced ${results.filter((r) => r.status === "synced").length} of ${plans.length} plans`,
            data: results,
        });
    }
    catch (error) {
        console.error("Sync all plans with Stripe error:", error);
        return res.status(500).json({
            success: false,
            error: { code: "SYNC_FAILED", message: "Failed to sync plans with Stripe" },
        });
    }
});
exports.default = router;
