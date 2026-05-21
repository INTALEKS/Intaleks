"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateAdminService = void 0;
const db_1 = require("../config/db");
class AffiliateAdminService {
    static async getOverview() {
        const [applications, affiliates, withdrawals] = await Promise.all([
            db_1.prisma.affiliateApplication.findMany(),
            db_1.prisma.affiliateProfile.findMany(),
            db_1.prisma.affiliateWithdrawal.findMany(),
        ]);
        return {
            applications,
            affiliates,
            withdrawals,
            monthlyPayouts: [2410, 3180, 4220, 3760, 5140, 4980],
            monthlyPayoutMonths: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        };
    }
    static async getApplications(status) {
        return db_1.prisma.affiliateApplication.findMany({
            where: status ? { status: status } : undefined,
            orderBy: { createdAt: "desc" },
        });
    }
    static async updateApplicationStatus(id, status) {
        const app = await db_1.prisma.affiliateApplication.findUnique({ where: { id } });
        if (!app)
            throw new Error("Application not found");
        const updatedApp = await db_1.prisma.affiliateApplication.update({ where: { id }, data: { status } });
        if (status === "APPROVED") {
            const normalizedEmail = app.email.toLowerCase().trim();
            // Check if profile already exists
            const existingProfile = await db_1.prisma.affiliateProfile.findFirst({
                where: { email: normalizedEmail },
            });
            if (!existingProfile) {
                // Find corresponding user
                const user = await db_1.prisma.user.findUnique({
                    where: { email: normalizedEmail },
                });
                if (user) {
                    // Generate unique referral code
                    const prefix = (user.firstName || user.email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "REF";
                    let code = prefix;
                    let attempts = 0;
                    let isUnique = false;
                    while (!isUnique && attempts < 10) {
                        const existing = await db_1.prisma.affiliateProfile.findUnique({
                            where: { code },
                        });
                        if (!existing) {
                            isUnique = true;
                        }
                        else {
                            const randomDigits = Math.floor(1000 + Math.random() * 9000);
                            code = `${prefix.slice(0, 6)}${randomDigits}`;
                            attempts++;
                        }
                    }
                    if (!isUnique) {
                        code = Math.random().toString(36).substring(2, 8).toUpperCase();
                    }
                    await db_1.prisma.affiliateProfile.create({
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
    static async getAffiliates(query) {
        const where = query
            ? {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { company: { contains: query, mode: "insensitive" } },
                    { code: { contains: query, mode: "insensitive" } },
                ],
            }
            : undefined;
        return db_1.prisma.affiliateProfile.findMany({ where, orderBy: { createdAt: "desc" } });
    }
    static async toggleAffiliateStatus(id) {
        const item = await db_1.prisma.affiliateProfile.findUnique({ where: { id } });
        if (!item)
            throw new Error("Affiliate not found");
        return db_1.prisma.affiliateProfile.update({
            where: { id },
            data: { status: item.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
        });
    }
    static async getReferrals(status, search) {
        return db_1.prisma.affiliateReferral.findMany({
            where: {
                ...(status ? { status: status } : {}),
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
    static async getWithdrawals(status) {
        return db_1.prisma.affiliateWithdrawal.findMany({
            where: status ? { status: status } : undefined,
            orderBy: { requestedAt: "desc" },
        });
    }
    static async markWithdrawalProcessed(id, reference) {
        return db_1.prisma.affiliateWithdrawal.update({
            where: { id },
            data: { status: "PROCESSED", reference },
        });
    }
    static async getProgramSettings() {
        const row = await db_1.prisma.affiliateProgramSettings.findFirst({ orderBy: { createdAt: "desc" } });
        if (row)
            return row;
        return db_1.prisma.affiliateProgramSettings.create({
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
    static async updateProgramSettings(id, data) {
        return db_1.prisma.affiliateProgramSettings.update({ where: { id }, data });
    }
}
exports.AffiliateAdminService = AffiliateAdminService;
