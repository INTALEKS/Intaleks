import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export class AffiliateAdminService {
  static async getOverview() {
    const [applications, affiliates, withdrawals] = await Promise.all([
      prisma.affiliateApplication.findMany(),
      prisma.affiliateProfile.findMany(),
      prisma.affiliateWithdrawal.findMany(),
    ]);

    return {
      applications,
      affiliates,
      withdrawals,
      monthlyPayouts: [2410, 3180, 4220, 3760, 5140, 4980],
      monthlyPayoutMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    };
  }

  static async getApplications(status?: string) {
    return prisma.affiliateApplication.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateApplicationStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED") {
    const app = await prisma.affiliateApplication.findUnique({ where: { id } });
    if (!app) throw new Error("Application not found");

    const updatedApp = await prisma.affiliateApplication.update({ where: { id }, data: { status } });

    if (status === "APPROVED") {
      const normalizedEmail = app.email.toLowerCase().trim();
      
      // Check if profile already exists
      const existingProfile = await prisma.affiliateProfile.findFirst({
        where: { email: normalizedEmail },
      });

      if (!existingProfile) {
        // Find corresponding user
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (user) {
          // Generate unique referral code
          const prefix = (user.firstName || user.email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "REF";
          let code = prefix;
          let attempts = 0;
          let isUnique = false;

          while (!isUnique && attempts < 10) {
            const existing = await prisma.affiliateProfile.findUnique({
              where: { code },
            });
            if (!existing) {
              isUnique = true;
            } else {
              const randomDigits = Math.floor(1000 + Math.random() * 9000);
              code = `${prefix.slice(0, 6)}${randomDigits}`;
              attempts++;
            }
          }

          if (!isUnique) {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
          }

          await prisma.affiliateProfile.create({
            data: {
              userId: user.id,
              name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || app.name,
              email: user.email,
              company: app.company || "",
              code,
              status: "ACTIVE",
              joinedAtLabel: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            },
          });
        }
      }
    }

    return updatedApp;
  }

  static async getAffiliates(query?: string) {
    const where: Prisma.AffiliateProfileWhereInput | undefined = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined;

    return prisma.affiliateProfile.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  static async toggleAffiliateStatus(id: string) {
    const item = await prisma.affiliateProfile.findUnique({ where: { id } });
    if (!item) throw new Error("Affiliate not found");

    return prisma.affiliateProfile.update({
      where: { id },
      data: { status: item.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
    });
  }

  static async getReferrals(status?: string, search?: string) {
    return prisma.affiliateReferral.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(search
          ? {
              OR: [
                { affiliateName: { contains: search, mode: "insensitive" } },
                { clientMasked: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { conversionDate: "desc" },
    });
  }

  static async getWithdrawals(status?: string) {
    return prisma.affiliateWithdrawal.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { requestedAt: "desc" },
    });
  }

  static async markWithdrawalProcessed(id: string, reference: string) {
    return prisma.affiliateWithdrawal.update({
      where: { id },
      data: { status: "PROCESSED", reference },
    });
  }

  static async getProgramSettings() {
    const row = await prisma.affiliateProgramSettings.findFirst({ orderBy: { createdAt: "desc" } });
    if (row) return row;

    return prisma.affiliateProgramSettings.create({
      data: {
        commissionRate: 25,
        minWithdrawal: 250,
        holdingDays: 3,
        attributionDays: 30,
        adminEmail: "aleks@intaleks.com",
        notifications: {
          appReceived: true,
          appReviewed: true,
          withdrawalRequested: true,
          weeklyReport: false,
          monthlySummary: true,
        },
      },
    });
  }

  static async updateProgramSettings(id: string, data: {
    commissionRate: number;
    minWithdrawal: number;
    holdingDays: number;
    attributionDays: number;
    adminEmail: string;
    notifications: any;
  }) {
    return prisma.affiliateProgramSettings.update({ where: { id }, data });
  }
}
