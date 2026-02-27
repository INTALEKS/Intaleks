"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function updatePrice() {
    console.log("💰 Updating plan price...\n");
    const PLAN_ID = "cmm2k92y60001bo6mjsqx4tl5";
    const NEW_PRICE = 39900; // $399.00 in cents
    try {
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id: PLAN_ID },
            data: { price: NEW_PRICE },
        });
        console.log("✅ Price updated successfully!");
        console.log(`  Name: ${updatedPlan.name}`);
        console.log(`  New Price: $${updatedPlan.price}`);
    }
    catch (error) {
        console.error("❌ Update failed:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
updatePrice();
