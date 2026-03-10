const { PrismaClient } = require("@prisma/client");

async function fixFailedMigration() {
  const prisma = new PrismaClient();

  try {
    console.log("🔧 Checking for failed migrations...");

    // Check if the _prisma_migrations table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `;

    if (!tableExists[0].exists) {
      console.log("📋 Migration table does not exist yet - this is normal for first deployment");
      return;
    }

    // Check if the failed migration exists
    const failedMigration = await prisma.$queryRaw`
      SELECT migration_name FROM "_prisma_migrations" 
      WHERE migration_name = '20260310123943_y'
    `;

    if (failedMigration.length === 0) {
      console.log("✅ No failed migration found - database is clean");
      return;
    }

    console.log("🧹 Found failed migration, removing...");

    // Remove the failed migration record
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20260310123943_y'
    `;

    console.log("✅ Failed migration record removed successfully");
    console.log("🚀 Migration deployment can now proceed");
  } catch (error) {
    console.error("❌ Error checking/fixing migration:", error.message);
    console.log("💡 This might be normal if this is the first deployment");
    // Don't throw error - let the process continue
  } finally {
    await prisma.$disconnect();
  }
}

fixFailedMigration();
