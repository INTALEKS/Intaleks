"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function deleteNonAdminUsers() {
    try {
        console.log("🔍 Finding non-admin users...");
        // Find all non-admin users
        const nonAdminUsers = await prisma.user.findMany({
            where: {
                role: {
                    not: client_1.UserRole.ADMIN,
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        console.log(`\n📊 Found ${nonAdminUsers.length} non-admin users:`);
        nonAdminUsers.forEach((user) => {
            console.log(`  - ${user.email} (${user.name || "No name"}) - Role: ${user.role}`);
        });
        if (nonAdminUsers.length === 0) {
            console.log("\n✅ No non-admin users to delete.");
            return;
        }
        console.log("\n🗑️  Deleting non-admin users...");
        // Delete all non-admin users
        const result = await prisma.user.deleteMany({
            where: {
                role: {
                    not: client_1.UserRole.ADMIN,
                },
            },
        });
        console.log(`\n✅ Successfully deleted ${result.count} non-admin users.`);
        // Show remaining users
        const remainingUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        console.log(`\n👥 Remaining users (${remainingUsers.length}):`);
        remainingUsers.forEach((user) => {
            console.log(`  - ${user.email} (${user.name || "No name"}) - Role: ${user.role}`);
        });
    }
    catch (error) {
        console.error("❌ Error deleting users:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
deleteNonAdminUsers();
