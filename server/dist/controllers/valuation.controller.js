"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = exports.deleteValuationDocument = exports.getValuationDocumentById = exports.getUserValuationDocuments = exports.createValuationDocument = void 0;
const valuation_1 = require("../services/valuation");
const valuationValidation_1 = require("../validation/valuationValidation");
const pdfGenerator_1 = require("../services/pdfGenerator");
const pdf_service_1 = require("../services/pdf.service");
const storage_1 = require("../services/storage");
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
 */
const generatePDF = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const data = req.body;
        if (!data.companyName || !data.finalValuation) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Check if extended data is provided (company questionnaire fields)
        const hasExtendedData = data.startedYear || data.employees || data.stage || data.logoBase64;
        let pdfBuffer;
        if (hasExtendedData) {
            // Use the new multi-page PDF service with cover page
            const extendedData = (0, pdf_service_1.applyDefaultValues)({
                companyName: data.companyName || "Company Name Not Provided",
                country: data.country || "Australia",
                industry: data.industry || "General",
                generatedDate: data.generatedDate ||
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
            const pdfService = new pdf_service_1.PDFService();
            const doc = pdfService.generateMultiPageValuationReport(extendedData);
            // Convert PDFKit document to buffer
            pdfBuffer = await new Promise((resolve, reject) => {
                const chunks = [];
                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(chunks)));
                doc.on("error", reject);
                doc.end();
            });
        }
        else {
            // Use the legacy single-page PDF generator
            pdfBuffer = await (0, pdfGenerator_1.generateValuationPDF)(data);
        }
        // Upload PDF to R2 storage
        let fileUrl;
        try {
            const filename = `${data.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-valuation-${Date.now()}.pdf`;
            const uploadResult = await storage_1.StorageService.uploadPDF(pdfBuffer, filename);
            fileUrl = uploadResult.url;
            // Save document record to database with R2 URL
            await valuation_1.ValuationService.createDocument({
                userId,
                companyName: data.companyName,
                country: data.country,
                industry: data.industry,
                method: data.valuationMethod,
                valuation: data.finalValuation,
                fileUrl: uploadResult.url,
                fileSize: uploadResult.size,
            });
        }
        catch (storageError) {
            // Log error but don't fail the request - user can still download the PDF
            console.error("Failed to upload PDF to R2:", storageError);
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="valuation-report-${Date.now()}.pdf"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.generatePDF = generatePDF;
