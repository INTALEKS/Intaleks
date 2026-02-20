import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import { UserRole } from "@prisma/client";

export async function ensureAdminExists() {
  try {
    // Check if any admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (adminExists) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create default admin if none exists
    const email = process.env.ADMIN_EMAIL || "admin@yourdomain.com";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const name = process.env.ADMIN_NAME || "Admin User";

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.ADMIN,
      },
    });

    console.log("🔐 Default admin user created:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("⚠️  Please change credentials after first login!");
  } catch (error) {
    console.error("Error ensuring admin exists:", error);
  }
}

// Run if called directly
if (require.main === module) {
  ensureAdminExists().then(() => process.exit(0));
}
