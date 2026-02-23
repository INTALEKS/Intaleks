import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePrice() {
  console.log("💰 Updating plan price...\n");

  const PLAN_ID = "cmlzb221k000013zmq6imdeg4";
  const NEW_PRICE = 399;

  try {
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: PLAN_ID },
      data: { price: NEW_PRICE },
    });

    console.log("✅ Price updated successfully!");
    console.log(`  Name: ${updatedPlan.name}`);
    console.log(`  New Price: $${updatedPlan.price}`);
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrice();
