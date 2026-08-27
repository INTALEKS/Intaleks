"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerService = exports.partnerPlanDetails = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const stripe_1 = require("../config/stripe");
const environment_1 = require("../config/environment");
const crypto_1 = require("crypto");
const email_1 = require("./email");
const errors_1 = require("../errors");
exports.partnerPlanDetails = {
    PARTNER: { valuationLimit: 5 },
    PARTNER_UNLIMITED: { valuationLimit: null },
};
class PartnerService {
    static async createFirmForApprovedApplication(application) {
        const existing = await db_1.prisma.partnerMembership.findFirst({ where: { userId: application.userId } });
        if (existing)
            return existing.firmId;
        const firm = await db_1.prisma.partnerFirm.create({
            data: {
                name: application.companyName,
                professionalType: application.professionalType,
                website: application.website,
                memberships: {
                    create: { userId: application.userId, role: client_1.PartnerMembershipRole.FIRM_ADMIN },
                },
            },
        });
        return firm.id;
    }
    static async getDashboard(userId) {
        const membership = await db_1.prisma.partnerMembership.findFirst({
            where: { userId, active: true },
            include: {
                firm: {
                    include: {
                        memberships: {
                            where: { active: true },
                            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                            orderBy: { createdAt: "asc" },
                        },
                        valuations: {
                            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                            orderBy: { createdAt: "desc" },
                            take: 100,
                        },
                    },
                },
            },
        });
        if (!membership)
            return null;
        const isAdmin = membership.role === client_1.PartnerMembershipRole.FIRM_ADMIN;
        const valuations = isAdmin
            ? membership.firm.valuations
            : membership.firm.valuations.filter((valuation) => valuation.userId === userId);
        return {
            role: membership.role,
            canManageMembers: isAdmin,
            firm: {
                id: membership.firm.id,
                name: membership.firm.name,
                status: membership.firm.status,
                planType: membership.firm.planType,
                accessStartsAt: membership.firm.accessStartsAt,
                accessEndsAt: membership.firm.accessEndsAt,
                valuationLimit: membership.firm.valuationLimit,
                valuationsUsed: membership.firm.valuationsUsed,
            },
            members: isAdmin ? membership.firm.memberships.map((item) => ({
                id: item.id,
                role: item.role,
                user: item.user,
            })) : [],
            valuations,
        };
    }
    static async addMember(adminUserId, email) {
        const adminMembership = await this.getFirmAdminMembership(adminUserId);
        const user = await db_1.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user) {
            const normalizedEmail = email.trim().toLowerCase();
            const token = (0, crypto_1.randomBytes)(32).toString("hex");
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 14);
            const invitation = await db_1.prisma.partnerInvitation.upsert({
                where: { firmId_email: { firmId: adminMembership.firmId, email: normalizedEmail } },
                create: { firmId: adminMembership.firmId, email: normalizedEmail, token, expiresAt },
                update: { token, expiresAt, acceptedAt: null },
                include: { firm: true },
            });
            await email_1.emailService.sendPartnerInvitationEmail(normalizedEmail, invitation.firm.name, `${environment_1.config.frontendUrl}/partner-invite/${token}`);
            return { invitation: true, email: normalizedEmail };
        }
        const existing = await db_1.prisma.partnerMembership.findUnique({
            where: { firmId_userId: { firmId: adminMembership.firmId, userId: user.id } },
        });
        if (existing?.active)
            throw new errors_1.ConflictError("This user is already an active member of the firm");
        if (existing) {
            return db_1.prisma.partnerMembership.update({ where: { id: existing.id }, data: { active: true, role: client_1.PartnerMembershipRole.ADVISER } });
        }
        return db_1.prisma.partnerMembership.create({ data: { firmId: adminMembership.firmId, userId: user.id, role: client_1.PartnerMembershipRole.ADVISER } });
    }
    static async acceptInvitation(userId, token) {
        const invite = await db_1.prisma.partnerInvitation.findUnique({ where: { token } });
        if (!invite || invite.expiresAt <= new Date() || invite.acceptedAt)
            throw new errors_1.ValidationError("This Partner invitation is invalid or has expired");
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.email.toLowerCase() !== invite.email.toLowerCase())
            throw new errors_1.ValidationError("Sign in with the email address that received this invitation");
        await db_1.prisma.partnerMembership.upsert({ where: { firmId_userId: { firmId: invite.firmId, userId } }, create: { firmId: invite.firmId, userId, role: client_1.PartnerMembershipRole.ADVISER }, update: { active: true, role: client_1.PartnerMembershipRole.ADVISER } });
        await db_1.prisma.partnerInvitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    }
    static async removeMember(adminUserId, memberId) {
        const adminMembership = await this.getFirmAdminMembership(adminUserId);
        const member = await db_1.prisma.partnerMembership.findFirst({ where: { id: memberId, firmId: adminMembership.firmId } });
        if (!member)
            throw new errors_1.NotFoundError("Firm member not found");
        if (member.id === adminMembership.id)
            throw new errors_1.ValidationError("The firm administrator cannot remove their own access");
        return db_1.prisma.partnerMembership.update({ where: { id: memberId }, data: { active: false } });
    }
    static async activateFirm(firmId, planType) {
        const detail = exports.partnerPlanDetails[planType];
        if (!detail)
            throw new errors_1.ValidationError("Invalid Partner plan");
        const now = new Date();
        const ends = new Date(now);
        ends.setDate(ends.getDate() + 30);
        return db_1.prisma.partnerFirm.update({
            where: { id: firmId },
            data: { status: client_1.PartnerFirmStatus.ACTIVE, planType, accessStartsAt: now, accessEndsAt: ends, valuationLimit: detail.valuationLimit, valuationsUsed: 0, renewalReminderSentAt: null },
        });
    }
    static async createCheckout(userId, planType, successUrl, cancelUrl) {
        const allowedOrigin = new URL(environment_1.config.frontendUrl).origin;
        if (new URL(successUrl).origin !== allowedOrigin || new URL(cancelUrl).origin !== allowedOrigin) {
            throw new errors_1.ValidationError("Invalid checkout return URL");
        }
        const adminMembership = await this.getFirmAdminMembership(userId);
        const firm = await db_1.prisma.partnerFirm.findUnique({ where: { id: adminMembership.firmId } });
        if (!firm)
            throw new errors_1.NotFoundError("Partner firm not found");
        if (planType !== "PARTNER" && planType !== "PARTNER_UNLIMITED")
            throw new errors_1.ValidationError("Invalid Partner plan");
        const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true, stripeCustomerId: true } });
        if (!user)
            throw new errors_1.NotFoundError("User not found");
        const stripe = (0, stripe_1.getStripe)();
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({ email: user.email, metadata: { userId, partnerFirmId: firm.id } });
            customerId = customer.id;
            await db_1.prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
        }
        const amount = planType === "PARTNER" ? 49500 : 99500;
        const name = planType === "PARTNER" ? "Intaleks Partner" : "Intaleks Partner Unlimited";
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [{
                    price_data: {
                        currency: "aud",
                        unit_amount: amount,
                        product_data: { name, description: "30-day firm access. Does not renew automatically." },
                    },
                    quantity: 1,
                }],
            metadata: { checkoutType: "partner", userId, partnerFirmId: firm.id, partnerPlanType: planType },
            payment_intent_data: { metadata: { checkoutType: "partner", userId, partnerFirmId: firm.id, partnerPlanType: planType } },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        if (!session.url)
            throw new errors_1.ValidationError("Stripe did not return a checkout URL");
        return { sessionId: session.id, url: session.url };
    }
    static async getActiveFirmForUser(userId) {
        const membership = await db_1.prisma.partnerMembership.findFirst({
            where: { userId, active: true, firm: { status: client_1.PartnerFirmStatus.ACTIVE, accessEndsAt: { gt: new Date() } } },
            include: { firm: true },
        });
        return membership?.firm ?? null;
    }
    static async recordValuation(userId) {
        const firm = await this.getActiveFirmForUser(userId);
        if (!firm)
            return null;
        if (firm.valuationLimit !== null && firm.valuationsUsed >= firm.valuationLimit) {
            throw new errors_1.ValidationError("Your firm has reached its valuation limit. Ask the firm administrator to renew, upgrade or approve an additional valuation.");
        }
        await db_1.prisma.partnerFirm.update({ where: { id: firm.id }, data: { valuationsUsed: { increment: 1 } } });
        return firm.id;
    }
    static async getFirmAdminMembership(userId) {
        const membership = await db_1.prisma.partnerMembership.findFirst({
            where: { userId, active: true, role: client_1.PartnerMembershipRole.FIRM_ADMIN },
        });
        if (!membership)
            throw new errors_1.ValidationError("Only the firm administrator can manage firm members");
        return membership;
    }
}
exports.PartnerService = PartnerService;
