import { prisma } from "../config/db";
import { NotFoundError } from "../errors";

/**
 * Valuation document data for creating a new record
 */
export interface CreateValuationDocumentData {
  userId: string;
  companyName?: string;
  country: string;
  industry: string;
  method: string;
  valuation: number;
  fileUrl?: string;
  fileSize?: number;
}

/**
 * Valuation document response type
 */
export interface ValuationDocumentResponse {
  id: string;
  companyName?: string;
  country: string;
  industry: string;
  method: string;
  valuation: number;
  fileUrl: string | null;
  fileSize: number | null;
  createdAt: Date;
}

/**
 * Valuation Service - Handles valuation document tracking
 */
export class ValuationService {
  /**
   * Create a new valuation document record
   */
  static async createDocument(data: CreateValuationDocumentData): Promise<ValuationDocumentResponse> {
    const document = await prisma.valuationDocument.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        country: data.country,
        industry: data.industry,
        method: data.method,
        valuation: data.valuation,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
      },
    });

    return document;
  }

  /**
   * Get all valuation documents for a user
   */
  static async getUserDocuments(userId: string): Promise<ValuationDocumentResponse[]> {
    const documents = await prisma.valuationDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return documents;
  }

  /**
   * Get a single valuation document by ID
   */
  static async getDocumentById(id: string, userId: string): Promise<ValuationDocumentResponse> {
    const document = await prisma.valuationDocument.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundError("Valuation document not found");
    }

    return document;
  }

  /**
   * Delete a valuation document
   */
  static async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await prisma.valuationDocument.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundError("Valuation document not found");
    }

    await prisma.valuationDocument.delete({
      where: { id },
    });
  }

  /**
   * Get document count for a user
   */
  static async getDocumentCount(userId: string): Promise<number> {
    return prisma.valuationDocument.count({
      where: { userId },
    });
  }
}
