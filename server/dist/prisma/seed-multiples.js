"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const valuationMultiples = [
    // Australia
    { country: "australia", industry: "retail", multiple: 3.0 },
    { country: "australia", industry: "technology", multiple: 7.5 },
    { country: "australia", industry: "service", multiple: 2.0 },
    { country: "australia", industry: "manufacturing", multiple: 4.0 },
    { country: "australia", industry: "hospitality", multiple: 2.25 },
    { country: "australia", industry: "construction", multiple: 3.0 },
    { country: "australia", industry: "professional", multiple: 3.0 },
    { country: "australia", industry: "finance", multiple: 5.0 },
    { country: "australia", industry: "healthcare", multiple: 5.0 },
    { country: "australia", industry: "wholesale", multiple: 3.0 },
    // USA
    { country: "usa", industry: "retail", multiple: 3.5 },
    { country: "usa", industry: "technology", multiple: 8.0 },
    { country: "usa", industry: "service", multiple: 2.5 },
    { country: "usa", industry: "manufacturing", multiple: 4.5 },
    { country: "usa", industry: "hospitality", multiple: 2.5 },
    { country: "usa", industry: "construction", multiple: 3.5 },
    { country: "usa", industry: "professional", multiple: 3.5 },
    { country: "usa", industry: "finance", multiple: 5.5 },
    { country: "usa", industry: "healthcare", multiple: 5.5 },
    { country: "usa", industry: "wholesale", multiple: 3.5 },
    // UK
    { country: "uk", industry: "retail", multiple: 2.8 },
    { country: "uk", industry: "technology", multiple: 7.0 },
    { country: "uk", industry: "service", multiple: 1.8 },
    { country: "uk", industry: "manufacturing", multiple: 3.8 },
    { country: "uk", industry: "hospitality", multiple: 2.0 },
    { country: "uk", industry: "construction", multiple: 2.8 },
    { country: "uk", industry: "professional", multiple: 2.8 },
    { country: "uk", industry: "finance", multiple: 4.8 },
    { country: "uk", industry: "healthcare", multiple: 4.8 },
    { country: "uk", industry: "wholesale", multiple: 2.8 },
    // Canada
    { country: "canada", industry: "retail", multiple: 3.2 },
    { country: "canada", industry: "technology", multiple: 7.8 },
    { country: "canada", industry: "service", multiple: 2.2 },
    { country: "canada", industry: "manufacturing", multiple: 4.2 },
    { country: "canada", industry: "hospitality", multiple: 2.3 },
    { country: "canada", industry: "construction", multiple: 3.2 },
    { country: "canada", industry: "professional", multiple: 3.2 },
    { country: "canada", industry: "finance", multiple: 5.2 },
    { country: "canada", industry: "healthcare", multiple: 5.2 },
    { country: "canada", industry: "wholesale", multiple: 3.2 },
];
async function seedValuationMultiples() {
    console.log("🌱 Seeding valuation multiples...");
    try {
        // Check if multiples already exist
        const existingCount = await prisma.valuationMultiple.count();
        if (existingCount > 0) {
            console.log(`✅ Database already has ${existingCount} valuation multiples. Skipping seed.`);
            return;
        }
        // Create all multiples
        const result = await prisma.valuationMultiple.createMany({
            data: valuationMultiples,
            skipDuplicates: true,
        });
        console.log(`✅ Successfully seeded ${result.count} valuation multiples`);
        console.log(`   - Countries: Australia, USA, UK, Canada`);
        console.log(`   - Industries: 10 per country`);
    }
    catch (error) {
        console.error("❌ Error seeding valuation multiples:", error);
        throw error;
    }
}
async function main() {
    await seedValuationMultiples();
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
