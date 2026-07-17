import { prisma } from "../config/db";
import { getStripe } from "../config/stripe";
import { ReferralApplicationStatus, ReferralStatus, UserRole } from "@prisma/client";
import { NotFoundError, ValidationError, ConflictError } from "../errors";

export class ReferralService {
  /**
   * Submit an application to join the professional referral program
   */
  static async submitApplication(
    userId: string,
    data: { professionalType: string; companyName: string; website?: string }
  ) {
    const { professionalType, companyName, website } = data;

    if (!professionalType || !companyName) {
      throw new ValidationError("Professional type and company name are required");
    }

    // Retrieve user and their subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professionalReferralApplication: true,
        professionalReferralProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Require active subscription
    if (user.subscriptionStatus !== "ACTIVE") {
      throw new ValidationError("To join the referral program, you must be an active subscriber");
    }

    // Check if they already have an active profile
    if (user.professionalReferralProfile) {
      throw new ConflictError("You already have an active professional referral profile");
    }

    // Check for existing pending application
    if (user.professionalReferralApplication && user.professionalReferralApplication.status === "PENDING") {
      throw new ConflictError("You already have a pending application under review");
    }

    // Create or update application (since userId is unique, we upsert to avoid duplicate key errors)
    const application = await prisma.professionalReferralApplication.upsert({
      where: { userId },
      create: {
        userId,
        professionalType,
        companyName,
        website: website || null,
        status: ReferralApplicationStatus.PENDING,
        feedback: null,
      },
      update: {
        professionalType,
        companyName,
        website: website || null,
        status: ReferralApplicationStatus.PENDING,
        feedback: null,
      },
    });

    return application;
  }

  /**
   * Get professional referral profile and application status for a user
   */
  static async getProfileAndApplication(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        professionalReferralApplication: true,
        professionalReferralProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      application: user.professionalReferralApplication,
      profile: user.professionalReferralProfile,
    };
  }

  /**
   * List referral applications (Admin only)
   */
  static async listApplications(status?: ReferralApplicationStatus) {
    return prisma.professionalReferralApplication.findMany({
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
  private static async generateUniqueCode(firstName: string, lastName: string, professionalType: string): Promise<string> {
    const cleanFirstName = firstName.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const cleanLastName = lastName.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const cleanType = professionalType.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);

    const basePrefix = `PROF-${cleanType}-${cleanLastName || cleanFirstName || "REF"}`;
    let code = basePrefix;
    let attempts = 0;
    let isUnique = false;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.professionalReferralProfile.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      } else {
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
  static async updateApplicationStatus(
    applicationId: string,
    status: ReferralApplicationStatus,
    feedback?: string
  ) {
    const application = await prisma.professionalReferralApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundError("Referral application not found");
    }

    if (application.status !== "PENDING") {
      throw new ValidationError("Application has already been processed");
    }

    // Update application record
    const updatedApplication = await prisma.professionalReferralApplication.update({
      where: { id: applicationId },
      data: { status, feedback: feedback || null },
    });

    // If APPROVED, create the ReferralProfile and Stripe Promotion Code
    if (status === "APPROVED") {
      const user = application.user;

      // Check if profile already exists
      const existingProfile = await prisma.professionalReferralProfile.findFirst({
        where: { userId: user.id },
      });

      if (!existingProfile) {
        const code = await this.generateUniqueCode(
          user.firstName || "",
          user.lastName || "",
          application.professionalType
        );

        // Create the Stripe Promotion Code for this professional.
        // Returns the Stripe promo code object ID, or null if Stripe is unavailable.
        const stripePromoCodeId = await ReferralService.getOrCreateReferralPromoCode(code);

        // Save ProfessionalReferralProfile to database
        await prisma.professionalReferralProfile.create({
          data: {
            userId: user.id,
            code,
            stripePromoCodeId,
            status: ReferralStatus.ACTIVE,
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
  static async getOrCreateReferralPromoCode(code: string): Promise<string | null> {
    try {
      const stripe = getStripe();

      // Step 1: Get or create the shared 25% referral coupon.
      let couponId = process.env.STRIPE_REFERRAL_COUPON_ID;

      if (!couponId) {
        const coupons = await stripe.coupons.list({ limit: 100 });
        const existing = coupons.data.find(
          (c) => c.percent_off === 25 && c.duration === "forever" && c.valid
        );
        if (existing) {
          couponId = existing.id;
        } else {
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
        promotion: {
          type: "coupon",
          coupon: couponId,
        },
        code,
      } as any);

      console.log(`[REFERRAL] Created Stripe promo code: ${code} (${promoCode.id})`);
      return promoCode.id;
    } catch (err) {
      console.error(`[REFERRAL] Failed to create Stripe promo code for "${code}". Will retry at checkout:`, err);
      return null;
    }
  }


  /**
   * Get referred clients for a professional, including their valuation documents and inputs
   */
  static async getReferredClients(userId: string) {
    // Verify user is an approved referral partner
    const profile = await prisma.professionalReferralProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.status !== ReferralStatus.ACTIVE) {
      throw new ValidationError("No active professional referral profile found for this user");
    }

    // Retrieve referred clients
    const clients = await prisma.user.findMany({
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

    return clients.map((client: any) => {
      // Map questionnaire responses to their respective documents
      const docsWithResponses = client.valuationDocuments.map((doc: any) => {
        const response = client.questionnaireResponses.find(
          (r: any) => r.valuationDocumentId === doc.id
        );
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
