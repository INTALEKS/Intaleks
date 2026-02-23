"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = exports.deleteValuationDocument = exports.getValuationDocumentById = exports.getUserValuationDocuments = exports.createValuationDocument = void 0;
const valuation_1 = require("../services/valuation");
const valuationValidation_1 = require("../validation/valuationValidation");
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
        // Generate RAVDA Scorecard PDF
        const pdfBuffer = await (0, pdf_service_1.generateValuationPDF)(data);
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
                method: "ravda",
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
        res.setHeader("Content-Disposition", `attachment; filename="ravda-scorecard-${Date.now()}.pdf"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        res.send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.generatePDF = generatePDF;
