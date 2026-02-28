import { Request, Response, NextFunction } from "express";
import { ValuationService } from "../services/valuation";
import { valuationDocumentSchema, ValuationDocumentInput } from "../validation/valuationValidation";
import { generateValuationPDF, ValuationPDFData } from "../services/pdf.service";
import { StorageService } from "../services/storage";
import { CalculatorService } from "../services/calculator";

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
      valuationMethod: "profit" | "asset";
      financialData?: any;
      addbacks?: any;
      years?: string[];
      assets?: any;
      liabilities?: any;
      calculatedMultiple?: number;
      country?: string;
      industry?: string;
    };

    if (!data.companyName || !data.valuationMethod) {
      return res.status(400).json({ error: "Missing required fields: companyName, valuationMethod" });
    }

    // SERVER-SIDE RECALCULATION - Prevent client manipulation
    let recalculatedResult;
    let finalValuation: number;

    try {
      if (data.valuationMethod === "profit") {
        // Validate required fields for profit method
        if (!data.financialData || !data.years || !data.calculatedMultiple) {
          return res.status(400).json({
            error: "Missing required fields for profit method: financialData, years, calculatedMultiple",
          });
        }

        // Recalculate on server to prevent manipulation
        recalculatedResult = CalculatorService.validateAndCalculate("profit", {
          financialData: data.financialData,
          addbacks: data.addbacks || [],
          multiple: data.calculatedMultiple,
          years: data.years,
        });

        finalValuation = recalculatedResult.finalValuation;

        // Log if client-side calculation differs from server-side (potential manipulation attempt)
        if (data.finalValuation && Math.abs(data.finalValuation - finalValuation) > 1) {
          console.warn(`[SECURITY] Client-server valuation mismatch for user ${userId}:`, `Client: ${data.finalValuation.toFixed(2)}, Server: ${finalValuation.toFixed(2)}`, `Difference: ${Math.abs(data.finalValuation - finalValuation).toFixed(2)}`);
        }

        // Update the data object with server-calculated values
        data.finalValuation = finalValuation;
        data.adjustedEbit = recalculatedResult.averageAdjustedEbit;
        data.profitValuation = finalValuation;
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
    console.log(`[AUDIT] User ${userId} generated valuation for ${data.companyName}: $${finalValuation.toFixed(2)}`);

    // Generate RAVDA Scorecard PDF with server-validated data
    const pdfBuffer = await generateValuationPDF(data);

    // Upload PDF to R2 storage
    let fileUrl: string | undefined;
    let fileSize: number = pdfBuffer.length;

    try {
      const filename = `${data.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-valuation-${Date.now()}.pdf`;
      const uploadResult = await StorageService.uploadPDF(pdfBuffer, filename);
      fileUrl = uploadResult.url;
      fileSize = uploadResult.size;
    } catch (storageError) {
      // Log error but don't fail the request - user can still download the PDF
      console.error("Failed to upload PDF to R2:", storageError);
      // Continue without fileUrl - record will be saved without R2 link
    }

    // Save document record to database (with or without R2 URL)
    try {
      await ValuationService.createDocument({
        userId,
        companyName: data.companyName,
        country: data.country || "Unknown",
        industry: data.industry || "Unknown",
        method: "ravda",
        valuation: finalValuation, // Use server-calculated value
        fileUrl: fileUrl, // Will be undefined if R2 upload failed
        fileSize: fileSize,
      });
    } catch (dbError) {
      console.error("Failed to save valuation document to database:", dbError);
      // Continue - user can still download the PDF
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ravda-scorecard-${Date.now()}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
