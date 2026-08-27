"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
const partner_service_1 = require("./partner.service");
class ReferralService {
    /**
     * Submit an application to join the professional referral program
     */
    static async submitApplication(userId, data) {
        const { professionalType, companyName, website } = data;
        if (!professionalType || !companyName) {
            throw new errors_1.ValidationError("Professional type and company name are required");
        }
        // Partner onboarding is independent of Business Owner plans.
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
                        partnerMemberships: { include: { firm: true } },
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
                // Billing is set up manually during guided onboarding. Do not create a
                // customer discount or an automatic recurring Stripe subscription here.
                await db_1.prisma.professionalReferralProfile.create({
                    data: {
                        userId: user.id,
                        code,
                        stripePromoCodeId: null,
                        status: client_1.ReferralStatus.ACTIVE,
                    },
                });
                await partner_service_1.PartnerService.createFirmForApprovedApplication({
                    userId: application.userId,
                    companyName: application.companyName,
                    professionalType: application.professionalType,
                    website: application.website,
                });
            }
        }
        return updatedApplication;
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
