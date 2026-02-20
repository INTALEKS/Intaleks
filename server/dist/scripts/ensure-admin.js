"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminExists = ensureAdminExists;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
async function ensureAdminExists() {
    try {
        // Check if any admin user exists
        const adminExists = await db_1.prisma.user.findFirst({
            where: { role: client_1.UserRole.ADMIN },
        });
        if (adminExists) {
            console.log("✅ Admin user already exists");
            return;
        }
        // Create default admin if none exists
        const email = process.env.ADMIN_EMAIL || "admin@yourdomain.com";
        const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
        const name = process.env.ADMIN_NAME || "Admin User";
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const admin = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log("🔐 Default admin user created:");
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log("⚠️  Please change credentials after first login!");
    }
    catch (error) {
        console.error("Error ensuring admin exists:", error);
    }
}
// Run if called directly
if (require.main === module) {
    ensureAdminExists().then(() => process.exit(0));
}
