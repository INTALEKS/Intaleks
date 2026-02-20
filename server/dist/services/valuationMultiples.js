"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuationMultipleService = void 0;
const db_1 = require("../config/db");
/**
 * Valuation Multiples Service - Handles valuation multiples CRUD operations
 */
class ValuationMultipleService {
    /**
     * Create a new valuation multiple
     */
    static async createMultiple(data) {
        const multiple = await db_1.prisma.valuationMultiple.create({
            data: {
                country: data.country.toLowerCase(),
                industry: data.industry.toLowerCase(),
                scoreRange: data.scoreRange,
                multiple: data.multiple,
            },
        });
        return multiple;
    }
    /**
     * Get all valuation multiples
     */
    static async getAllMultiples() {
        const multiples = await db_1.prisma.valuationMultiple.findMany({
            orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
        });
        return multiples;
    }
    /**
     * Get valuation multiple by country, industry, and revenue range
     */
    static async getMultipleByCountryIndustryRevenue(country, industry, scoreRange) {
        const multiple = await db_1.prisma.valuationMultiple.findUnique({
            where: {
                country_industry_scoreRange: {
                    country: country.toLowerCase(),
                    industry: industry.toLowerCase(),
                    scoreRange: scoreRange,
                },
            },
        });
        return multiple;
    }
    /**
     * Get multiples by country and industry (all revenue ranges)
     */
    static async getMultiplesByCountryAndIndustry(country, industry) {
        const multiples = await db_1.prisma.valuationMultiple.findMany({
            where: {
                country: country.toLowerCase(),
                industry: industry.toLowerCase(),
            },
            orderBy: { scoreRange: "asc" },
        });
        return multiples;
    }
    /**
     * Get multiples by country
     */
    static async getMultiplesByCountry(country) {
        const multiples = await db_1.prisma.valuationMultiple.findMany({
            where: { country: country.toLowerCase() },
            orderBy: { industry: "asc" },
        });
        return multiples;
    }
    /**
     * Update a valuation multiple
     */
    static async updateMultiple(id, data) {
        const updateData = {};
        if (data.country)
            updateData.country = data.country.toLowerCase();
        if (data.industry)
            updateData.industry = data.industry.toLowerCase();
        if (data.scoreRange)
            updateData.scoreRange = data.scoreRange;
        if (data.multiple !== undefined)
            updateData.multiple = data.multiple;
        const multiple = await db_1.prisma.valuationMultiple.update({
            where: { id },
            data: updateData,
        });
        return multiple;
    }
    /**
     * Delete a valuation multiple
     */
    static async deleteMultiple(id) {
        await db_1.prisma.valuationMultiple.delete({
            where: { id },
        });
    }
    /**
     * Bulk create valuation multiples
     */
    static async bulkCreateMultiples(multiples) {
        const formattedMultiples = multiples.map((m) => ({
            country: m.country.toLowerCase(),
            industry: m.industry.toLowerCase(),
            scoreRange: m.scoreRange,
            multiple: m.multiple,
        }));
        await db_1.prisma.valuationMultiple.createMany({
            data: formattedMultiples,
            skipDuplicates: true,
        });
        // Return the created multiples
        return await db_1.prisma.valuationMultiple.findMany({
            where: {
                OR: formattedMultiples.map((m) => ({
                    country: m.country,
                    industry: m.industry,
                    scoreRange: m.scoreRange,
                })),
            },
            orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
        });
    }
    /**
     * Get multiples formatted for export (CSV/Excel)
     */
    static async getMultiplesForExport() {
        const multiples = await db_1.prisma.valuationMultiple.findMany({
            select: {
                country: true,
                industry: true,
                scoreRange: true,
                multiple: true,
                createdAt: true,
            },
            orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
        });
        return multiples.map((m) => ({
            ...m,
            country: m.country.charAt(0).toUpperCase() + m.country.slice(1),
            industry: m.industry.charAt(0).toUpperCase() + m.industry.slice(1),
            createdAt: m.createdAt.toISOString(),
        }));
    }
}
exports.ValuationMultipleService = ValuationMultipleService;
