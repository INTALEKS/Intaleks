"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function createAdminInteractive() {
    // Get credentials from environment variables or use defaults
    const email = process.env.ADMIN_EMAIL || "admin@yourdomain.com";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const name = process.env.ADMIN_NAME || "Admin User";
    console.log("🔐 Creating admin user...");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    try {
        // Check if user already exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.log(`⚠️  User with email ${email} already exists`);
            console.log(`   ID: ${existingUser.id}`);
            console.log(`   Role: ${existingUser.role}`);
            if (existingUser.role === client_1.UserRole.ADMIN) {
                console.log("✅ Admin user already exists!");
                return;
            }
            else {
                // Update existing user to admin
                const updatedUser = await db_1.prisma.user.update({
                    where: { email },
                    data: { role: client_1.UserRole.ADMIN },
                });
                console.log("✅ Existing user updated to admin role!");
                console.log(`   ID: ${updatedUser.id}`);
                return;
            }
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create admin user
        const user = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log("✅ Admin user created successfully!");
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log("");
        console.log("🔑 Login credentials:");
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log("");
        console.log("⚠️  Please change the password after first login!");
    }
    catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
createAdminInteractive();
