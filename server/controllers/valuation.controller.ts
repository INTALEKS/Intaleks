import { Request, Response, NextFunction } from "express";
import { ValuationService } from "../services/valuation";
import { valuationDocumentSchema, ValuationDocumentInput } from "../validation/valuationValidation";
import { generateValuationPDF, ValuationReportData } from "../services/pdfGenerator";
import { PDFService, ExtendedValuationData, applyDefaultValues } from "../services/pdf.service";
import { StorageService } from "../services/storage";

/**
 * Create a new valuation document record
 * POST /api/valuations
 */
export const createValuationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { error, value } = valuationDocumentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const validatedData = value as ValuationDocumentInput;

    const document = await ValuationService.createDocument({
      userId,
      ...validatedData,
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all valuation documents for the current user
 * GET /api/valuations
 */
export const getUserValuationDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const documents = await ValuationService.getUserDocuments(userId);

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single valuation document by ID
 * GET /api/valuations/:id
 */
export const getValuationDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const document = await ValuationService.getDocumentById(id, userId);

    res.json(document);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a valuation document
 * DELETE /api/valuations/:id
 */
export const deleteValuationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    await ValuationService.deleteDocument(id, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Extended valuation report data interface that includes company questionnaire fields
 * for the multi-page PDF report with cover page
 * Requirements: 6.1
 */
export interface ExtendedValuationReportData extends ValuationReportData {
  // Company questionnaire data
  startedYear?: string;
  employees?: string;
  stage?: "startup" | "1-2-years" | "3-5-years" | "5-10-years" | "10-plus-years";
  logoBase64?: string; // Base64 encoded logo image
  logoMimeType?: string; // 'image/png' | 'image/jpeg' | 'image/svg+xml'
  generatedDate?: string;
}

/**
 * Generate PDF valuation report and save to database
 * POST /api/valuations/generate-pdf
 */
export const generatePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = req.body as ExtendedValuationReportData;

    if (!data.companyName || !data.finalValuation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if extended data is provided (company questionnaire fields)
    const hasExtendedData = data.startedYear || data.employees || data.stage || data.logoBase64;

    let pdfBuffer: Buffer;

    if (hasExtendedData) {
      // Use the new multi-page PDF service with cover page
      const extendedData: ExtendedValuationData = applyDefaultValues({
        companyName: data.companyName || "Company Name Not Provided",
        country: data.country || "Australia",
        industry: data.industry || "General",
        generatedDate:
          data.generatedDate ||
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        financialYears: data.financialYears || [],
        financialData: data.financialData || {},
        addbacks: data.addbacks || [],
        totalAddbacks: data.totalAddbacks || 0,
        averageEbit: data.averageEbit || 0,
        adjustedEbit: data.adjustedEbit || 0,
        valuationMethod: data.valuationMethod,
        assets: data.assets,
        liabilities: data.liabilities,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        assetValuation: data.assetValuation,
        capitalizationRate: data.capitalizationRate,
        profitValuation: data.profitValuation,
        finalValuation: data.finalValuation,
        // Extended fields from company questionnaire
        startedYear: data.startedYear,
        employees: data.employees,
        stage: data.stage,
        logoBase64: data.logoBase64,
        logoMimeType: data.logoMimeType,
      });

      // Generate multi-page PDF with cover page
      const pdfService = new PDFService();
      const doc = pdfService.generateMultiPageValuationReport(extendedData);

      // Convert PDFKit document to buffer
      pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
        doc.end();
      });
    } else {
      // Use the legacy single-page PDF generator
      pdfBuffer = await generateValuationPDF(data);
    }

    // Upload PDF to R2 storage
    let fileUrl: string | undefined;
    try {
      const filename = `${data.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-valuation-${Date.now()}.pdf`;
      const uploadResult = await StorageService.uploadPDF(pdfBuffer, filename);
      fileUrl = uploadResult.url;

      // Save document record to database with R2 URL
      await ValuationService.createDocument({
        userId,
        companyName: data.companyName,
        country: data.country,
        industry: data.industry,
        method: data.valuationMethod,
        valuation: data.finalValuation,
        fileUrl: uploadResult.url,
        fileSize: uploadResult.size,
      });
    } catch (storageError) {
      // Log error but don't fail the request - user can still download the PDF
      console.error("Failed to upload PDF to R2:", storageError);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="valuation-report-${Date.now()}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
