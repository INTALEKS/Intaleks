import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ValuationService } from "../services/valuation";
import { valuationDocumentSchema, ValuationDocumentInput } from "../validation/valuationValidation";
import { generateValuationPDF, ValuationPDFData } from "../services/pdf.service";
import { StorageService } from "../services/storage";
import { CalculatorService } from "../services/calculator";
import { prisma } from "../config/db";
import { PartnerService } from "../services/partner.service";

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
 * Generate PDF valuation report and save to database
 * POST /api/valuations/generate-pdf
 *
 * SECURITY: Server-side recalculation to prevent client manipulation
 */
export const generatePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = req.body as ValuationPDFData & {
      valuationMethod: "profit" | "asset" | "both";
      financialData?: any;
      addbacks?: any;
      years?: string[];
      assets?: any;
      liabilities?: any;
      calculatedMultiple?: number;
      country?: string;
      industry?: string;
      acn?: string;
      abn?: string;
      valuationDocumentId?: string;
      calculatorState?: Record<string, unknown>;
    };

    // Debug logging
    console.log("[PDF] Received data:", {
      companyName: data.companyName,
      valuationMethod: data.valuationMethod,
      financialYears: data.financialYears,
      years: data.years,
      hasFinancialData: !!data.financialData,
      financialDataKeys: data.financialData ? Object.keys(data.financialData) : [],
    });

    if (!data.valuationMethod) {
      return res.status(400).json({ error: "Missing required field: valuationMethod" });
    }

    if (data.acn && !/^\d{9}$/.test(data.acn)) {
      return res.status(400).json({ error: "ACN must contain exactly 9 digits" });
    }
    if (data.abn && !/^\d{11}$/.test(data.abn)) {
      return res.status(400).json({ error: "ABN must contain exactly 11 digits" });
    }

    const entitlement = await prisma.user.findUnique({
      where: { id: userId },
      select: { retailValuationEnabled: true, retailValuationCredits: true, retailValuationDocumentId: true },
    });
    const correctionDocumentId = typeof data.valuationDocumentId === "string" ? data.valuationDocumentId : null;
    if (entitlement?.retailValuationEnabled) {
      if (correctionDocumentId) {
        const canCorrect = correctionDocumentId === entitlement.retailValuationDocumentId &&
          Boolean(await prisma.valuationDocument.findFirst({ where: { id: correctionDocumentId, userId }, select: { id: true } }));
        if (!canCorrect) {
          return res.status(403).json({ error: "This report is not eligible for correction. Start a new valuation after purchasing access." });
        }
      } else if (entitlement.retailValuationCredits < 1) {
        return res.status(403).json({ error: "This purchase includes one valuation. Purchase another valuation to create a new report; corrections to your existing report are included." });
      }
    }

    // The server owns report identity metadata so saved browser state cannot
    // produce a stale company name or generation date in a newly created PDF.
    data.companyName = typeof data.companyName === "string" && data.companyName.trim()
      ? data.companyName.trim()
      : "Unnamed Company";
    data.generatedDate = new Date().toISOString().slice(0, 10);

    const normalizedYears = Array.from(
      new Set(
        [...(Array.isArray(data.years) ? data.years : []), ...(Array.isArray(data.financialYears) ? data.financialYears : [])]
          .map((year) => (typeof year === "string" ? year.trim() : ""))
          .filter((year) => year.length > 0),
      ),
    );

    // SERVER-SIDE RECALCULATION - Prevent client manipulation
    let recalculatedResult: ReturnType<typeof CalculatorService.validateAndCalculate>;
    let finalValuation: number;

    try {
      if (data.valuationMethod === "both") {
        if (!data.financialData || normalizedYears.length === 0 || !data.calculatedMultiple || !data.assets || !data.liabilities) {
          return res.status(400).json({
            error: "Missing required fields for both methods: financialData, years, calculatedMultiple, assets, liabilities",
          });
        }

        const profitResult = CalculatorService.validateAndCalculate("profit", {
          financialData: data.financialData,
          addbacks: data.addbacks || [],
          multiple: data.calculatedMultiple,
          years: normalizedYears,
        });
        const assetResult = CalculatorService.validateAndCalculate("asset", {
          assets: data.assets,
          liabilities: data.liabilities,
        });

        // The profit result remains the primary figure for legacy storage/equity fields;
        // both independently recalculated valuations are passed to the PDF.
        finalValuation = profitResult.finalValuation;
        data.finalValuation = finalValuation;
        data.profitValuation = profitResult.finalValuation;
        data.assetValuation = assetResult.finalValuation;
        data.totalAssets = assetResult.totalAssets;
        data.totalLiabilities = assetResult.totalLiabilities;
        data.adjustedEbit = profitResult.averageAdjustedEbit;
        data.totalAddbacks = profitResult.totalAddbacks;
        data.financialData = profitResult.yearlyMetrics;
        data.adjustedEbitPerYear = profitResult.adjustedEbitByYear;
        data.totalAddbacksPerYear = profitResult.totalAddbacksByYear;
        data.averageEbit = normalizedYears.reduce((sum, year) => sum + (profitResult.yearlyMetrics[year]?.ebit || 0), 0) / normalizedYears.length;
        data.financialYears = normalizedYears;
      } else if (data.valuationMethod === "profit") {
        // Validate required fields for profit method
        if (!data.financialData || normalizedYears.length === 0 || !data.calculatedMultiple) {
          return res.status(400).json({
            error: "Missing required fields for profit method: financialData, years, calculatedMultiple",
          });
        }

        const yearsForCalculation = normalizedYears.length > 0 ? normalizedYears : Object.keys(data.financialData || {});

        // Recalculate on server to prevent manipulation
        recalculatedResult = CalculatorService.validateAndCalculate("profit", {
          financialData: data.financialData,
          addbacks: data.addbacks || [],
          multiple: data.calculatedMultiple,
          years: yearsForCalculation,
        });

        finalValuation = recalculatedResult.finalValuation;

        // Log if client-side calculation differs from server-side (potential manipulation attempt)
        if (data.finalValuation && Math.abs(data.finalValuation - finalValuation) > 1) {
          console.warn(`[SECURITY] Client-server valuation mismatch for user ${userId}:`, `Client: ${data.finalValuation.toFixed(2)}, Server: ${finalValuation.toFixed(2)}`, `Difference: ${Math.abs(data.finalValuation - finalValuation).toFixed(2)}`);
        }

        // Update the data object with server-calculated values
        data.finalValuation = finalValuation;
        data.adjustedEbit = recalculatedResult.averageAdjustedEbit;
        data.totalAddbacks = recalculatedResult.totalAddbacks;
        data.profitValuation = finalValuation;
        // Use server-recalculated financial data for PDF
        data.financialData = recalculatedResult.yearlyMetrics;
        data.adjustedEbitPerYear = recalculatedResult.adjustedEbitByYear;
        data.totalAddbacksPerYear = recalculatedResult.totalAddbacksByYear;
        // Calculate average EBIT (before addbacks)
        data.averageEbit = yearsForCalculation.reduce((sum, year) => sum + (recalculatedResult.yearlyMetrics[year]?.ebit || 0), 0) / yearsForCalculation.length;
        // Ensure financialYears is set for PDF generation
        data.financialYears = yearsForCalculation;

        console.log("[PDF] After recalculation:", {
          financialYears: data.financialYears,
          yearlyMetricsKeys: Object.keys(recalculatedResult.yearlyMetrics),
          sampleYear: data.financialYears[0],
          sampleData: recalculatedResult.yearlyMetrics[data.financialYears[0]],
        });
      } else if (data.valuationMethod === "asset") {
        // Validate required fields for asset method
        if (!data.assets || !data.liabilities) {
          return res.status(400).json({
            error: "Missing required fields for asset method: assets, liabilities",
          });
        }

        // Recalculate on server to prevent manipulation
        recalculatedResult = CalculatorService.validateAndCalculate("asset", {
          assets: data.assets,
          liabilities: data.liabilities,
        });

        finalValuation = recalculatedResult.finalValuation;

        // Log if client-side calculation differs from server-side (potential manipulation attempt)
        if (data.finalValuation && Math.abs(data.finalValuation - finalValuation) > 1) {
          console.warn(`[SECURITY] Client-server valuation mismatch for user ${userId}:`, `Client: ${data.finalValuation.toFixed(2)}, Server: ${finalValuation.toFixed(2)}`, `Difference: ${Math.abs(data.finalValuation - finalValuation).toFixed(2)}`);
        }

        // Update the data object with server-calculated values
        data.finalValuation = finalValuation;
        data.assetValuation = finalValuation;
        data.totalAssets = recalculatedResult.totalAssets;
        data.totalLiabilities = recalculatedResult.totalLiabilities;
      } else {
        return res.status(400).json({ error: "Invalid valuation method" });
      }
    } catch (calcError) {
      console.error("Calculation error:", calcError);
      return res.status(400).json({
        error: "Invalid calculation data",
        message: calcError instanceof Error ? calcError.message : "Calculation failed",
      });
    }

    // Log for audit trail
    console.log(`[AUDIT] User ${userId} generated valuation for ${data.companyName || "Unnamed Company"}: $${finalValuation.toFixed(2)}`);

    // Generate RAVDA Scorecard PDF with server-validated data
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateValuationPDF(data);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return res.status(500).json({
        success: false,
        error: {
          code: "PDF_GENERATION_FAILED",
          message: "The valuation report could not be generated. Please review your inputs and try again.",
        },
      });
    }

    // Upload PDF to R2 storage
    let fileUrl: string | undefined;
    let fileSize: number = pdfBuffer.length;

    try {
      // Generate consistent filename format for both download and storage
      const sanitizedCompanyName = (data.companyName || "Business-Valuation").replace(/[<>:"/\\|?*]/g, "").trim();
      const storageFilename = `${sanitizedCompanyName.replace(/\s+/g, "-").toLowerCase()}-intaleks-business-valuation-report-${Date.now()}.pdf`;
      const uploadResult = await StorageService.uploadPDF(pdfBuffer, storageFilename);
      fileUrl = uploadResult.url;
      fileSize = uploadResult.size;
    } catch (storageError) {
      // Log error but don't fail the request - user can still download the PDF
      console.error("Failed to upload PDF to R2:", storageError);
      // Continue without fileUrl - record will be saved without R2 link
    }

    // Attach a partner valuation to the active firm and count it only after
    // the report itself has been generated successfully.
    let partnerFirmId: string | undefined;
    try {
      partnerFirmId = (await PartnerService.recordValuation(userId)) || undefined;
    } catch (partnerError) {
      return next(partnerError);
    }

    // Save new reports against one purchased valuation credit. Corrections update
    // the same owned document and never consume another credit.
    try {
      const documentData = {
        companyName: data.companyName || "Unnamed Company",
        country: data.country || "Unknown",
        industry: data.industry || "Unknown",
        method: "ravda",
        valuation: finalValuation,
        fileUrl: fileUrl || null,
        fileSize,
        valuationReason: data.valuationReason || null,
          inputData: JSON.parse(JSON.stringify(data.calculatorState || data)) as object,
      };
      let documentId: string;
      if (correctionDocumentId) {
        const existing = await prisma.valuationDocument.findFirst({ where: { id: correctionDocumentId, userId }, select: { id: true } });
        if (!existing) return res.status(404).json({ error: "Valuation report not found" });
        const updated = await prisma.valuationDocument.update({ where: { id: correctionDocumentId }, data: documentData });
        documentId = updated.id;
      } else if (entitlement?.retailValuationEnabled) {
        documentId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const consumed = await tx.user.updateMany({
            where: { id: userId, retailValuationEnabled: true, retailValuationCredits: { gt: 0 } },
            data: { retailValuationCredits: { decrement: 1 } },
          });
          if (consumed.count !== 1) throw new Error("VALUATION_CREDIT_REQUIRED");
          const created = await tx.valuationDocument.create({ data: { userId, ...documentData, partnerFirmId } });
          await tx.user.update({ where: { id: userId }, data: { retailValuationDocumentId: created.id } });
          return created.id;
        });
      } else {
        const created = await prisma.valuationDocument.create({ data: { userId, ...documentData, partnerFirmId } });
        documentId = created.id;
      }
      res.setHeader("X-Valuation-Document-Id", documentId);
    } catch (dbError) {
      console.error("Failed to save valuation document to database:", dbError);
      if (dbError instanceof Error && dbError.message === "VALUATION_CREDIT_REQUIRED") {
        return res.status(403).json({ error: "This purchase includes one valuation. Purchase another valuation to create a new report; corrections to your existing report are included." });
      }
      return res.status(500).json({ error: "The valuation report could not be saved. Please retry." });
    }

    // Coupon users get exactly one download — mark as used after successful PDF generation
    if (req.user?.couponAccess && !req.user?.couponUsed) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { couponUsed: true },
        });
        console.log(`[COUPON] Marked coupon access as used for user ${userId}`);
      } catch (couponErr) {
        console.error("Failed to mark coupon as used:", couponErr);
        // Non-fatal — PDF is already sent
      }
    }

    // Generate filename in format: "Company Name - Intaleks Business Valuation Report.pdf"
    const sanitizedCompanyName = (data.companyName || "Business-Valuation").replace(/[<>:"/\\|?*]/g, "").trim();
    const filename = `${sanitizedCompanyName} - Intaleks Business Valuation Report.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
