import { PartnerFirmStatus, PartnerMembershipRole, PartnerPlanType } from "@prisma/client";
import { prisma } from "../config/db";
import { getStripe } from "../config/stripe";
import { config } from "../config/environment";
import { randomBytes } from "crypto";
import { emailService } from "./email";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

export const partnerPlanDetails: Record<PartnerPlanType, { valuationLimit: number | null }> = {
  PARTNER: { valuationLimit: 5 },
  PARTNER_UNLIMITED: { valuationLimit: null },
};

export class PartnerService {
  static async createFirmForApprovedApplication(application: { userId: string; companyName: string; professionalType: string; website: string | null }) {
    const existing = await prisma.partnerMembership.findFirst({ where: { userId: application.userId } });
    if (existing) return existing.firmId;

    const firm = await prisma.partnerFirm.create({
      data: {
        name: application.companyName,
        professionalType: application.professionalType,
        website: application.website,
        memberships: {
          create: { userId: application.userId, role: PartnerMembershipRole.FIRM_ADMIN },
        },
      },
    });
    return firm.id;
  }

  static async getDashboard(userId: string) {
    const membership = await prisma.partnerMembership.findFirst({
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
    if (!membership) return null;

    const isAdmin = membership.role === PartnerMembershipRole.FIRM_ADMIN;
    const valuations = isAdmin
      ? membership.firm.valuations
      : membership.firm.valuations.filter((valuation: { userId: string }) => valuation.userId === userId);

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
      members: isAdmin ? membership.firm.memberships.map((item: { id: string; role: PartnerMembershipRole; user: { id: string; firstName: string | null; lastName: string | null; email: string } }) => ({
        id: item.id,
        role: item.role,
        user: item.user,
      })) : [],
      valuations,
    };
  }

  static async addMember(adminUserId: string, email: string) {
    const adminMembership = await this.getFirmAdminMembership(adminUserId);
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      const normalizedEmail = email.trim().toLowerCase();
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      const invitation = await prisma.partnerInvitation.upsert({
        where: { firmId_email: { firmId: adminMembership.firmId, email: normalizedEmail } },
        create: { firmId: adminMembership.firmId, email: normalizedEmail, token, expiresAt },
        update: { token, expiresAt, acceptedAt: null },
        include: { firm: true },
      });
      await emailService.sendPartnerInvitationEmail(normalizedEmail, invitation.firm.name, `${config.frontendUrl}/partner-invite/${token}`);
      return { invitation: true, email: normalizedEmail };
    }

    const existing = await prisma.partnerMembership.findUnique({
      where: { firmId_userId: { firmId: adminMembership.firmId, userId: user.id } },
    });
    if (existing?.active) throw new ConflictError("This user is already an active member of the firm");

    if (existing) {
      return prisma.partnerMembership.update({ where: { id: existing.id }, data: { active: true, role: PartnerMembershipRole.ADVISER } });
    }
    return prisma.partnerMembership.create({ data: { firmId: adminMembership.firmId, userId: user.id, role: PartnerMembershipRole.ADVISER } });
  }

  static async acceptInvitation(userId: string, token: string) {
    const invite = await prisma.partnerInvitation.findUnique({ where: { token } });
    if (!invite || invite.expiresAt <= new Date() || invite.acceptedAt) throw new ValidationError("This Partner invitation is invalid or has expired");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) throw new ValidationError("Sign in with the email address that received this invitation");
    await prisma.partnerMembership.upsert({ where: { firmId_userId: { firmId: invite.firmId, userId } }, create: { firmId: invite.firmId, userId, role: PartnerMembershipRole.ADVISER }, update: { active: true, role: PartnerMembershipRole.ADVISER } });
    await prisma.partnerInvitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
  }

  static async removeMember(adminUserId: string, memberId: string) {
    const adminMembership = await this.getFirmAdminMembership(adminUserId);
    const member = await prisma.partnerMembership.findFirst({ where: { id: memberId, firmId: adminMembership.firmId } });
    if (!member) throw new NotFoundError("Firm member not found");
    if (member.id === adminMembership.id) throw new ValidationError("The firm administrator cannot remove their own access");
    return prisma.partnerMembership.update({ where: { id: memberId }, data: { active: false } });
  }

  static async activateFirm(firmId: string, planType: PartnerPlanType) {
    const detail = partnerPlanDetails[planType];
    if (!detail) throw new ValidationError("Invalid Partner plan");
    const now = new Date();
    const ends = new Date(now);
    ends.setDate(ends.getDate() + 30);
    return prisma.partnerFirm.update({
      where: { id: firmId },
      data: { status: PartnerFirmStatus.ACTIVE, planType, accessStartsAt: now, accessEndsAt: ends, valuationLimit: detail.valuationLimit, valuationsUsed: 0, renewalReminderSentAt: null },
    });
  }

  static async createCheckout(userId: string, planType: PartnerPlanType, successUrl: string, cancelUrl: string) {
    const allowedOrigin = new URL(config.frontendUrl).origin;
    if (new URL(successUrl).origin !== allowedOrigin || new URL(cancelUrl).origin !== allowedOrigin) {
      throw new ValidationError("Invalid checkout return URL");
    }
    const adminMembership = await this.getFirmAdminMembership(userId);
    const firm = await prisma.partnerFirm.findUnique({ where: { id: adminMembership.firmId } });
    if (!firm) throw new NotFoundError("Partner firm not found");
    if (planType !== "PARTNER" && planType !== "PARTNER_UNLIMITED") throw new ValidationError("Invalid Partner plan");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, stripeCustomerId: true } });
    if (!user) throw new NotFoundError("User not found");
    const stripe = getStripe();
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId, partnerFirmId: firm.id } });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
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
    if (!session.url) throw new ValidationError("Stripe did not return a checkout URL");
    return { sessionId: session.id, url: session.url };
  }

  static async getActiveFirmForUser(userId: string) {
    const membership = await prisma.partnerMembership.findFirst({
      where: { userId, active: true, firm: { status: PartnerFirmStatus.ACTIVE, accessEndsAt: { gt: new Date() } } },
      include: { firm: true },
    });
    return membership?.firm ?? null;
  }

  static async recordValuation(userId: string) {
    const firm = await this.getActiveFirmForUser(userId);
    if (!firm) return null;
    if (firm.valuationLimit !== null && firm.valuationsUsed >= firm.valuationLimit) {
      throw new ValidationError("Your firm has reached its valuation limit. Ask the firm administrator to renew, upgrade or approve an additional valuation.");
    }
    await prisma.partnerFirm.update({ where: { id: firm.id }, data: { valuationsUsed: { increment: 1 } } });
    return firm.id;
  }

  private static async getFirmAdminMembership(userId: string) {
    const membership = await prisma.partnerMembership.findFirst({
      where: { userId, active: true, role: PartnerMembershipRole.FIRM_ADMIN },
    });
    if (!membership) throw new ValidationError("Only the firm administrator can manage firm members");
    return membership;
  }
}
