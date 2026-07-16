"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
class ReferralService {
    /**
     * Submit an application to join the professional referral program
     */
    static async submitApplication(userId, data) {
        const { professionalType, companyName, website } = data;
        if (!professionalType || !companyName) {
            throw new errors_1.ValidationError("Professional type and company name are required");
        }
        // Retrieve user and their subscription status
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                professionalReferralApplication: true,
                professionalReferralProfile: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        // Require active subscription
        if (user.subscriptionStatus !== "ACTIVE") {
            throw new errors_1.ValidationError("To join the referral program, you must be an active subscriber");
        }
        // Check if they already have an active profile
        if (user.professionalReferralProfile) {
            throw new errors_1.ConflictError("You already have an active professional referral profile");
        }
        // Check for existing pending application
        if (user.professionalReferralApplication && user.professionalReferralApplication.status === "PENDING") {
            throw new errors_1.ConflictError("You already have a pending application under review");
        }
        // Create or update application (since userId is unique, we upsert to avoid duplicate key errors)
        const application = await db_1.prisma.professionalReferralApplication.upsert({
            where: { userId },
            create: {
                userId,
                professionalType,
                companyName,
                website: website || null,
                status: client_1.ReferralApplicationStatus.PENDING,
                feedback: null,
            },
            update: {
                professionalType,
                companyName,
                website: website || null,
                status: client_1.ReferralApplicationStatus.PENDING,
                feedback: null,
            },
        });
        return application;
    }
    /**
     * Get professional referral profile and application status for a user
     */
    static async getProfileAndApplication(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                professionalReferralApplication: true,
                professionalReferralProfile: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        return {
            application: user.professionalReferralApplication,
            profile: user.professionalReferralProfile,
        };
    }
    /**
     * List referral applications (Admin only)
     */
    static async listApplications(status) {
        return db_1.prisma.professionalReferralApplication.findMany({
            where: status ? { status } : undefined,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    /**
     * Helper to generate a unique professional referral code
     */
    static async generateUniqueCode(firstName, lastName, professionalType) {
        const cleanFirstName = firstName.replace(/[^a-zA-Z]/g, "").toUpperCase();
        const cleanLastName = lastName.replace(/[^a-zA-Z]/g, "").toUpperCase();
        const cleanType = professionalType.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);
        const basePrefix = `PROF-${cleanType}-${cleanLastName || cleanFirstName || "REF"}`;
        let code = basePrefix;
        let attempts = 0;
        let isUnique = false;
        while (!isUnique && attempts < 10) {
            const existing = await db_1.prisma.professionalReferralProfile.findUnique({
                where: { code },
            });
            if (!existing) {
                isUnique = true;
            }
            else {
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                code = `${basePrefix}-${randomDigits}`;
                attempts++;
            }
        }
        if (!isUnique) {
            code = `PROF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        return code;
    }
    /**
     * Update referral application status (Admin only)
     */
    static async updateApplicationStatus(applicationId, status, feedback) {
        const application = await db_1.prisma.professionalReferralApplication.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application) {
            throw new errors_1.NotFoundError("Referral application not found");
        }
        if (application.status !== "PENDING") {
            throw new errors_1.ValidationError("Application has already been processed");
        }
        // Update application record
        const updatedApplication = await db_1.prisma.professionalReferralApplication.update({
            where: { id: applicationId },
            data: { status, feedback: feedback || null },
        });
        // If APPROVED, create the ReferralProfile and Stripe Promotion Code
        if (status === "APPROVED") {
            const user = application.user;
            // Check if profile already exists
            const existingProfile = await db_1.prisma.professionalReferralProfile.findFirst({
                where: { userId: user.id },
            });
            if (!existingProfile) {
                const code = await this.generateUniqueCode(user.firstName || "", user.lastName || "", application.professionalType);
                // Create the Stripe Promotion Code for this professional.
                // Returns the Stripe promo code object ID, or null if Stripe is unavailable.
                const stripePromoCodeId = await ReferralService.getOrCreateReferralPromoCode(code);
                // Save ProfessionalReferralProfile to database
                await db_1.prisma.professionalReferralProfile.create({
                    data: {
                        userId: user.id,
                        code,
                        stripePromoCodeId,
                        status: client_1.ReferralStatus.ACTIVE,
                    },
                });
            }
        }
        return updatedApplication;
    }
    /**
     * Get or create a Stripe Promotion Code for a given referral code string.
     * - Reuses the shared 25% referral coupon (creates it once if missing).
     * - Checks Stripe for an existing promo code with that string before creating.
     * - Returns the Stripe Promotion Code ID, or null on failure.
     */
    static async getOrCreateReferralPromoCode(code) {
        try {
            const stripe = (0, stripe_1.getStripe)();
            // Step 1: Get or create the shared 25% referral coupon.
            let couponId = process.env.STRIPE_REFERRAL_COUPON_ID;
            if (!couponId) {
                const coupons = await stripe.coupons.list({ limit: 100 });
                const existing = coupons.data.find((c) => c.percent_off === 25 && c.duration === "forever" && c.valid);
                if (existing) {
                    couponId = existing.id;
                }
                else {
                    const newCoupon = await stripe.coupons.create({
                        percent_off: 25,
                        duration: "forever",
                        name: "Professional Referral 25% Discount",
                    });
                    couponId = newCoupon.id;
                    console.log(`[REFERRAL] Created shared 25% referral coupon in Stripe: ${couponId}`);
                }
            }
            // Step 2: Check if a Stripe Promotion Code already exists for this code string.
            const existing = await stripe.promotionCodes.list({ code, limit: 1 });
            if (existing.data.length > 0) {
                console.log(`[REFERRAL] Reusing existing Stripe promo code: ${code} (${existing.data[0].id})`);
                return existing.data[0].id;
            }
            // Step 3: Create a new unique Stripe Promotion Code for this professional.
            const promoCode = await stripe.promotionCodes.create({
                coupon: couponId,
                code,
            });
            console.log(`[REFERRAL] Created Stripe promo code: ${code} (${promoCode.id})`);
            return promoCode.id;
        }
        catch (err) {
            console.error(`[REFERRAL] Failed to create Stripe promo code for "${code}". Will retry at checkout:`, err);
            return null;
        }
    }
    /**
     * Get referred clients for a professional, including their valuation documents and inputs
     */
    static async getReferredClients(userId) {
        // Verify user is an approved referral partner
        const profile = await db_1.prisma.professionalReferralProfile.findUnique({
            where: { userId },
        });
        if (!profile || profile.status !== client_1.ReferralStatus.ACTIVE) {
            throw new errors_1.ValidationError("No active professional referral profile found for this user");
        }
        // Retrieve referred clients
        const clients = await db_1.prisma.user.findMany({
            where: { referredById: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                subscriptionStatus: true,
                valuationDocuments: {
                    select: {
                        id: true,
                        companyName: true,
                        country: true,
                        industry: true,
                        method: true,
                        valuation: true,
                        fileUrl: true,
                        fileSize: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                questionnaireResponses: {
                    select: {
                        id: true,
                        valuationDocumentId: true,
                        ownerDependence: true,
                        recurringRevenue: true,
                        customerConcentration: true,
                        marginStability: true,
                        growthRate: true,
                        managementDepth: true,
                        competitiveAdvantage: true,
                        systemsScalability: true,
                        revenueDiversification: true,
                        externalRisk: true,
                        totalScore: true,
                        calculatedMultiple: true,
                        multipleCategory: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return clients.map((client) => {
            // Map questionnaire responses to their respective documents
            const docsWithResponses = client.valuationDocuments.map((doc) => {
                const response = client.questionnaireResponses.find((r) => r.valuationDocumentId === doc.id);
                return {
                    ...doc,
                    questionnaireResponse: response || null,
                };
            });
            return {
                id: client.id,
                email: client.email,
                firstName: client.firstName,
                lastName: client.lastName,
                createdAt: client.createdAt,
                subscriptionStatus: client.subscriptionStatus,
                valuationDocuments: docsWithResponses,
            };
        });
    }
}
exports.ReferralService = ReferralService;
