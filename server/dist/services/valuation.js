"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuationService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../errors");
/**
 * Valuation Service - Handles valuation document tracking
 */
class ValuationService {
    /**
     * Create a new valuation document record
     */
    static async createDocument(data) {
        const document = await db_1.prisma.valuationDocument.create({
            data: {
                userId: data.userId,
                companyName: data.companyName,
                country: data.country,
                industry: data.industry,
                method: data.method,
                valuation: data.valuation,
                fileUrl: data.fileUrl,
                fileSize: data.fileSize,
                valuationReason: data.valuationReason,
            },
        });
        return document;
    }
    /**
     * Get all valuation documents for a user
     */
    static async getUserDocuments(userId) {
        const documents = await db_1.prisma.valuationDocument.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return documents;
    }
    /**
     * Get a single valuation document by ID
     */
    static async getDocumentById(id, userId) {
        const document = await db_1.prisma.valuationDocument.findFirst({
            where: { id, userId },
        });
        if (!document) {
            throw new errors_1.NotFoundError("Valuation document not found");
        }
        return document;
    }
    /**
     * Delete a valuation document
     */
    static async deleteDocument(id, userId) {
        const document = await db_1.prisma.valuationDocument.findFirst({
            where: { id, userId },
        });
        if (!document) {
            throw new errors_1.NotFoundError("Valuation document not found");
        }
        await db_1.prisma.valuationDocument.delete({
            where: { id },
        });
    }
    /**
     * Get document count for a user
     */
    static async getDocumentCount(userId) {
        return db_1.prisma.valuationDocument.count({
            where: { userId },
        });
    }
}
exports.ValuationService = ValuationService;
