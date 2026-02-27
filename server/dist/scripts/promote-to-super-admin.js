"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function promoteToSuperAdmin() {
    const email = process.argv[2];
    if (!email) {
        console.error("❌ Please provide an email address");
        console.log("Usage: npx tsx scripts/promote-to-super-admin.ts <email>");
        process.exit(1);
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            process.exit(1);
        }
        if (user.role === client_1.UserRole.SUPER_ADMIN) {
            console.log(`✅ User ${email} is already a SUPER_ADMIN`);
            process.exit(0);
        }
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: client_1.UserRole.SUPER_ADMIN },
        });
        console.log(`✅ Successfully promoted ${email} to SUPER_ADMIN`);
        console.log(`   Previous role: ${user.role}`);
        console.log(`   New role: ${updatedUser.role}`);
    }
    catch (error) {
        console.error("❌ Error promoting user:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
promoteToSuperAdmin();
