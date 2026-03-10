const { PrismaClient } = require("@prisma/client");

async function fixFailedMigration() {
  const prisma = new PrismaClient();

  try {
    console.log("🔧 Attempting to resolve failed migration...");

    // Remove the failed migration record
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20260310123943_y'
    `;

    console.log("✅ Failed migration record removed successfully");
    console.log("🚀 You can now redeploy the application");
  } catch (error) {
    console.error("❌ Error fixing migration:", error.message);
    console.log("💡 You may need to manually connect to the database and run:");
    console.log("   DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20260310123943_y';");
  } finally {
    await prisma.$disconnect();
  }
}

fixFailedMigration();
