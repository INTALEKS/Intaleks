"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateValuationMultiples = exports.exportValuationMultiplesJSON = exports.exportValuationMultiplesCSV = exports.deleteValuationMultiple = exports.updateValuationMultiple = exports.createValuationMultiple = exports.getValuationMultiple = exports.getAllValuationMultiples = void 0;
const valuationMultiples_1 = require("../services/valuationMultiples");
const valuationMultiplesValidation_1 = require("../validation/valuationMultiplesValidation");
/**
 * Get all valuation multiples
 * GET /api/valuation-multiples
 */
const getAllValuationMultiples = async (req, res, next) => {
    try {
        const multiples = await valuationMultiples_1.ValuationMultipleService.getAllMultiples();
        res.json(multiples);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllValuationMultiples = getAllValuationMultiples;
/**
 * Get valuation multiple by country and industry
 * GET /api/valuation-multiples/:country/:industry
 */
const getValuationMultiple = async (req, res, next) => {
    try {
        const { country, industry } = req.params;
        const multiple = await valuationMultiples_1.ValuationMultipleService.getMultiplesByCountryAndIndustry(country, industry);
        if (!multiple) {
            res.status(404).json({ error: "Valuation multiple not found" });
            return;
        }
        res.json(multiple);
    }
    catch (error) {
        next(error);
    }
};
exports.getValuationMultiple = getValuationMultiple;
/**
 * Create a new valuation multiple
 * POST /api/valuation-multiples
 */
const createValuationMultiple = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = valuationMultiplesValidation_1.createValuationMultipleSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const multiple = await valuationMultiples_1.ValuationMultipleService.createMultiple(value);
        res.status(201).json(multiple);
    }
    catch (error) {
        next(error);
    }
};
exports.createValuationMultiple = createValuationMultiple;
/**
 * Update a valuation multiple
 * PUT /api/valuation-multiples/:id
 */
const updateValuationMultiple = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate request body
        const { error, value } = valuationMultiplesValidation_1.updateValuationMultipleSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const multiple = await valuationMultiples_1.ValuationMultipleService.updateMultiple(id, value);
        res.json(multiple);
    }
    catch (error) {
        next(error);
    }
};
exports.updateValuationMultiple = updateValuationMultiple;
/**
 * Delete a valuation multiple
 * DELETE /api/valuation-multiples/:id
 */
const deleteValuationMultiple = async (req, res, next) => {
    try {
        const { id } = req.params;
        await valuationMultiples_1.ValuationMultipleService.deleteMultiple(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteValuationMultiple = deleteValuationMultiple;
/**
 * Export all valuation multiples as CSV
 * GET /api/valuation-multiples/export/csv
 */
const exportValuationMultiplesCSV = async (req, res, next) => {
    try {
        const multiples = await valuationMultiples_1.ValuationMultipleService.getMultiplesForExport();
        // Generate CSV content with proper escaping
        const headers = ["Country", "Industry", "Multiple", "Created At"];
        const csvRows = [
            headers.join(","),
            ...multiples.map((m) => {
                // Escape double quotes in strings
                const country = `"${m.country.replace(/"/g, '""')}"`;
                const industry = `"${m.industry.replace(/"/g, '""')}"`;
                return `${country},${industry},${m.multiple},"${m.createdAt}"`;
            }),
        ];
        const csvContent = csvRows.join("\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="valuation-multiples-${new Date().toISOString().split("T")[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        next(error);
    }
};
exports.exportValuationMultiplesCSV = exportValuationMultiplesCSV;
/**
 * Export all valuation multiples as JSON
 * GET /api/valuation-multiples/export/json
 */
const exportValuationMultiplesJSON = async (req, res, next) => {
    try {
        const multiples = await valuationMultiples_1.ValuationMultipleService.getMultiplesForExport();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="valuation-multiples-${new Date().toISOString().split("T")[0]}.json"`);
        res.json({
            exportedAt: new Date().toISOString(),
            totalRecords: multiples.length,
            data: multiples,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.exportValuationMultiplesJSON = exportValuationMultiplesJSON;
/**
 * Bulk create valuation multiples
 * POST /api/valuation-multiples/bulk
 */
const bulkCreateValuationMultiples = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = valuationMultiplesValidation_1.bulkCreateValuationMultiplesSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const createdMultiples = await valuationMultiples_1.ValuationMultipleService.bulkCreateMultiples(value.multiples);
        res.status(201).json({
            message: "Multiples created successfully",
            count: createdMultiples.length,
            data: createdMultiples,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkCreateValuationMultiples = bulkCreateValuationMultiples;
