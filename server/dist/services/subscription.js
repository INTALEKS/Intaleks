"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../errors");
const stripe_sync_1 = require("./stripe-sync");
class SubscriptionService {
    /**
     * Find all subscription plans
     * Requirements: 9.1, 9.2
     */
    static async findAll() {
        const plans = await db_1.prisma.subscriptionPlan.findMany({
            orderBy: { createdAt: "desc" },
        });
        return plans;
    }
    /**
     * Find subscription plan by ID
     * Requirements: 9.1
     */
    static async findById(id) {
        const plan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!plan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${id} not found`);
        }
        return plan;
    }
    /**
     * Create a new subscription plan
     * - Creates plan in database
     * - Syncs with Stripe by creating product and price (if Stripe is configured)
     * - Rolls back on Stripe sync failure
     * Requirements: 8.1, 8.3, 8.5, 10.1, 10.2
     */
    static async create(data) {
        // Check for duplicate name
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { name: data.name },
        });
        if (existingPlan) {
            throw new errors_1.ConflictError(`Subscription plan with name "${data.name}" already exists`);
        }
        // Create plan in database first
        const plan = await db_1.prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                price: data.price,
                billingPeriod: data.billingPeriod ?? "MONTHLY",
                features: data.features,
                active: data.active ?? true,
            },
        });
        // Try to sync with Stripe if configured
        try {
            // Sync with Stripe - create product and price (Requirements 8.1, 8.3)
            const stripeIds = await stripe_sync_1.StripeSyncService.createProductAndPrice(plan);
            // Store Stripe IDs in the plan record (Requirement 8.3)
            await stripe_sync_1.StripeSyncService.storeStripeIds(plan.id, stripeIds);
            // Return updated plan with Stripe IDs
            const updatedPlan = await db_1.prisma.subscriptionPlan.findUnique({
                where: { id: plan.id },
            });
            return updatedPlan;
        }
        catch (error) {
            // Check if Stripe is not configured - allow plan creation without Stripe
            if (error instanceof Error && error.message.includes("Stripe is not configured")) {
                console.warn("Stripe not configured - plan created without Stripe sync");
                return plan;
            }
            // Rollback: delete the plan if Stripe sync fails (Requirement 8.5)
            await db_1.prisma.subscriptionPlan.delete({
                where: { id: plan.id },
            });
            throw error;
        }
    }
    /**
     * Update an existing subscription plan
     * - Updates plan in database
     * - Syncs price changes with Stripe (creates new price, archives old)
     * - Syncs name/active changes with Stripe product
     * Requirements: 8.2, 8.5, 11.1, 11.2, 11.3
     */
    static async update(id, data) {
        // Check if plan exists
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${id} not found`);
        }
        // Check for duplicate name if name is being updated
        if (data.name && data.name !== existingPlan.name) {
            const nameExists = await db_1.prisma.subscriptionPlan.findUnique({
                where: { name: data.name },
            });
            if (nameExists) {
                throw new errors_1.ConflictError(`Subscription plan with name "${data.name}" already exists`);
            }
        }
        // Build update data
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.price !== undefined)
            updateData.price = data.price;
        if (data.billingPeriod !== undefined)
            updateData.billingPeriod = data.billingPeriod;
        if (data.features !== undefined)
            updateData.features = data.features;
        if (data.active !== undefined)
            updateData.active = data.active;
        // Update plan in database
        const plan = await db_1.prisma.subscriptionPlan.update({
            where: { id },
            data: updateData,
        });
        // Sync with Stripe if plan has Stripe IDs
        if (existingPlan.stripeProductId) {
            try {
                // Handle price change - create new price, archive old (Requirement 8.2)
                if (data.price !== undefined && data.price !== existingPlan.price && existingPlan.stripePriceId) {
                    const newPriceId = await stripe_sync_1.StripeSyncService.updatePrice(existingPlan.stripeProductId, existingPlan.stripePriceId, data.price, data.billingPeriod ?? existingPlan.billingPeriod, id);
                    await stripe_sync_1.StripeSyncService.updateStripePriceId(id, newPriceId);
                }
                // Handle name or active status change
                if (data.name !== undefined || data.active !== undefined) {
                    await stripe_sync_1.StripeSyncService.updateProduct(existingPlan.stripeProductId, data.name ?? existingPlan.name, data.active ?? existingPlan.active);
                }
            }
            catch (error) {
                // Check if Stripe is not configured - allow update without Stripe sync
                if (error instanceof Error && error.message.includes("Stripe is not configured")) {
                    console.warn("Stripe not configured - plan updated without Stripe sync");
                }
                else {
                    // Log error but don't rollback database changes for updates
                    // The plan is still valid, just out of sync with Stripe
                    console.error("Failed to sync plan update with Stripe:", error);
                    throw error;
                }
            }
        }
        // Return updated plan
        const updatedPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        return updatedPlan;
    }
    /**
     * Activate a subscription plan
     * - Sets plan to active in database
     * - Reactivates corresponding Stripe product and price
     * Requirements: 8.4, 12.1, 12.3
     */
    static async activate(id) {
        // Check if plan exists
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${id} not found`);
        }
        const plan = await db_1.prisma.subscriptionPlan.update({
            where: { id },
            data: { active: true },
        });
        // Reactivate Stripe product if it exists
        if (existingPlan.stripeProductId) {
            try {
                await stripe_sync_1.StripeSyncService.reactivateProduct(existingPlan.stripeProductId, existingPlan.stripePriceId ?? undefined);
            }
            catch (error) {
                // Log error but don't fail the activation
                console.error("Failed to reactivate Stripe product:", error);
            }
        }
        return plan;
    }
    /**
     * Deactivate a subscription plan
     * - Sets plan to inactive in database
     * - Archives corresponding Stripe product and price
     * Requirements: 8.4, 12.2, 12.3
     */
    static async deactivate(id) {
        // Check if plan exists
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${id} not found`);
        }
        const plan = await db_1.prisma.subscriptionPlan.update({
            where: { id },
            data: { active: false },
        });
        // Archive Stripe product if it exists (Requirement 8.4)
        if (existingPlan.stripeProductId) {
            try {
                await stripe_sync_1.StripeSyncService.archiveProduct(existingPlan.stripeProductId, existingPlan.stripePriceId ?? undefined);
            }
            catch (error) {
                // Log error but don't fail the deactivation
                console.error("Failed to archive Stripe product:", error);
            }
        }
        return plan;
    }
    /**
     * Delete a subscription plan
     * Requirements: 13.1, 13.2, 13.3
     */
    static async delete(id) {
        // Check if plan exists
        const existingPlan = await db_1.prisma.subscriptionPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw new errors_1.NotFoundError(`Subscription plan with ID ${id} not found`);
        }
        // Check for subscribed users
        const subscribedUsersCount = await db_1.prisma.user.count({
            where: { subscriptionId: id },
        });
        if (subscribedUsersCount > 0) {
            throw new errors_1.ConflictError(`Cannot delete subscription plan with ${subscribedUsersCount} subscribed user(s). Please reassign or remove users first.`);
        }
        // Delete plan
        await db_1.prisma.subscriptionPlan.delete({
            where: { id },
        });
    }
    /**
     * Find all active subscription plans (public endpoint)
     * Returns only active plans for public display
     */
    static async findActivePlans() {
        const plans = await db_1.prisma.subscriptionPlan.findMany({
            where: { active: true },
            orderBy: { price: "asc" },
        });
        return plans;
    }
}
exports.SubscriptionService = SubscriptionService;
