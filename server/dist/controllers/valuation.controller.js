"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = exports.deleteValuationDocument = exports.getValuationDocumentById = exports.getUserValuationDocuments = exports.createValuationDocument = void 0;
const valuation_1 = require("../services/valuation");
const valuationValidation_1 = require("../validation/valuationValidation");
const pdf_service_1 = require("../services/pdf.service");
const storage_1 = require("../services/storage");
const calculator_1 = require("../services/calculator");
const db_1 = require("../config/db");
/**
 * Create a new valuation document record
 * POST /api/valuations
 */
const createValuationDocument = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { error, value } = valuationValidation_1.valuationDocumentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const validatedData = value;
        const document = await valuation_1.ValuationService.createDocument({
            userId,
            ...validatedData,
        });
        res.status(201).json(document);
    }
    catch (error) {
        next(error);
    }
};
exports.createValuationDocument = createValuationDocument;
/**
 * Get all valuation documents for the current user
 * GET /api/valuations
 */
const getUserValuationDocuments = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const documents = await valuation_1.ValuationService.getUserDocuments(userId);
        res.json(documents);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserValuationDocuments = getUserValuationDocuments;
/**
 * Get a single valuation document by ID
 * GET /api/valuations/:id
 */
const getValuationDocumentById = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id } = req.params;
        const document = await valuation_1.ValuationService.getDocumentById(id, userId);
        res.json(document);
    }
    catch (error) {
        next(error);
    }
};
exports.getValuationDocumentById = getValuationDocumentById;
/**
 * Delete a valuation document
 * DELETE /api/valuations/:id
 */
const deleteValuationDocument = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { id } = req.params;
        await valuation_1.ValuationService.deleteDocument(id, userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteValuationDocument = deleteValuationDocument;
/**
 * Generate PDF valuation report and save to database
 * POST /api/valuations/generate-pdf
 *
 * SECURITY: Server-side recalculation to prevent client manipulation
 */
const generatePDF = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const data = req.body;
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
        const normalizedYears = [...(Array.isArray(data.years) ? data.years : []), ...(Array.isArray(data.financialYears) ? data.financialYears : [])].map((year) => (typeof year === "string" ? year.trim() : "")).filter((year) => year.length > 0);
        // SERVER-SIDE RECALCULATION - Prevent client manipulation
        let recalculatedResult;
        let finalValuation;
        try {
            if (data.valuationMethod === "profit") {
                // Validate required fields for profit method
                if (!data.financialData || normalizedYears.length === 0 || !data.calculatedMultiple) {
                    return res.status(400).json({
                        error: "Missing required fields for profit method: financialData, years, calculatedMultiple",
                    });
                }
                const yearsForCalculation = normalizedYears.length > 0 ? normalizedYears : Object.keys(data.financialData || {});
                // Recalculate on server to prevent manipulation
                recalculatedResult = calculator_1.CalculatorService.validateAndCalculate("profit", {
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
            }
            else if (data.valuationMethod === "asset") {
                // Validate required fields for asset method
                if (!data.assets || !data.liabilities) {
                    return res.status(400).json({
                        error: "Missing required fields for asset method: assets, liabilities",
                    });
                }
                // Recalculate on server to prevent manipulation
                recalculatedResult = calculator_1.CalculatorService.validateAndCalculate("asset", {
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
            }
            else {
                return res.status(400).json({ error: "Invalid valuation method" });
            }
        }
        catch (calcError) {
            console.error("Calculation error:", calcError);
            return res.status(400).json({
                error: "Invalid calculation data",
                message: calcError instanceof Error ? calcError.message : "Calculation failed",
            });
        }
        // Log for audit trail
        console.log(`[AUDIT] User ${userId} generated valuation for ${data.companyName || "Unnamed Company"}: $${finalValuation.toFixed(2)}`);
        // Generate RAVDA Scorecard PDF with server-validated data
        const pdfBuffer = await (0, pdf_service_1.generateValuationPDF)(data);
        // Upload PDF to R2 storage
        let fileUrl;
        let fileSize = pdfBuffer.length;
        try {
            // Generate consistent filename format for both download and storage
            const sanitizedCompanyName = (data.companyName || "Business-Valuation").replace(/[<>:"/\\|?*]/g, "").trim();
            const storageFilename = `${sanitizedCompanyName.replace(/\s+/g, "-").toLowerCase()}-intaleks-business-valuation-report-${Date.now()}.pdf`;
            const uploadResult = await storage_1.StorageService.uploadPDF(pdfBuffer, storageFilename);
            fileUrl = uploadResult.url;
            fileSize = uploadResult.size;
        }
        catch (storageError) {
            // Log error but don't fail the request - user can still download the PDF
            console.error("Failed to upload PDF to R2:", storageError);
            // Continue without fileUrl - record will be saved without R2 link
        }
        // Save document record to database (with or without R2 URL)
        try {
            await valuation_1.ValuationService.createDocument({
                userId,
                companyName: data.companyName || "Unnamed Company",
                country: data.country || "Unknown",
                industry: data.industry || "Unknown",
                method: "ravda",
                valuation: finalValuation, // Use server-calculated value
                fileUrl: fileUrl, // Will be undefined if R2 upload failed
                fileSize: fileSize,
                valuationReason: data.valuationReason,
            });
        }
        catch (dbError) {
            console.error("Failed to save valuation document to database:", dbError);
            // Continue - user can still download the PDF
        }
        // Coupon users get exactly one download — mark as used after successful PDF generation
        if (req.user?.couponAccess && !req.user?.couponUsed) {
            try {
                await db_1.prisma.user.update({
                    where: { id: userId },
                    data: { couponUsed: true },
                });
                console.log(`[COUPON] Marked coupon access as used for user ${userId}`);
            }
            catch (couponErr) {
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
    }
    catch (error) {
        next(error);
    }
};
exports.generatePDF = generatePDF;
