"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const email_1 = require("../services/email");
async function run() {
    const now = new Date();
    const sevenDays = new Date(now);
    sevenDays.setDate(sevenDays.getDate() + 7);
    const firms = await db_1.prisma.partnerFirm.findMany({
        where: { status: "ACTIVE", accessEndsAt: { gte: now, lte: sevenDays }, renewalReminderSentAt: null },
        include: { memberships: { where: { active: true, role: "FIRM_ADMIN" }, include: { user: { select: { email: true } } } } },
    });
    for (const firm of firms) {
        const sent = await Promise.all(firm.memberships.map((member) => email_1.emailService.sendPartnerRenewalReminderEmail(member.user.email, firm.name, firm.accessEndsAt)));
        if (sent.some(Boolean))
            await db_1.prisma.partnerFirm.update({ where: { id: firm.id }, data: { renewalReminderSentAt: now } });
    }
    console.log(`Partner renewal reminders processed: ${firms.length}`);
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db_1.prisma.$disconnect());
