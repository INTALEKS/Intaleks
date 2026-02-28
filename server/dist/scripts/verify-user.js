"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyUser(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return;
        }
        if (user.emailVerified) {
            console.log(`✅ User already verified: ${email}`);
            return;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });
        console.log(`✅ Successfully verified user: ${email}`);
    }
    catch (error) {
        console.error("Error verifying user:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.log("Usage: ts-node verify-user.ts <email>");
    process.exit(1);
}
verifyUser(email);
