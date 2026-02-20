import { Request, Response, NextFunction } from "express";
import { ValuationMultipleService, ValuationMultipleData } from "../services/valuationMultiples";
import { createValuationMultipleSchema, updateValuationMultipleSchema, bulkCreateValuationMultiplesSchema } from "../validation/valuationMultiplesValidation";

/**
 * Get all valuation multiples
 * GET /api/valuation-multiples
 */
export const getAllValuationMultiples = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const multiples = await ValuationMultipleService.getAllMultiples();
    res.json(multiples);
  } catch (error) {
    next(error);
  }
};

/**
 * Get valuation multiple by country and industry
 * GET /api/valuation-multiples/:country/:industry
 */
export const getValuationMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { country, industry } = req.params;
    const multiple = await ValuationMultipleService.getMultiplesByCountryAndIndustry(country, industry);

    if (!multiple) {
      res.status(404).json({ error: "Valuation multiple not found" });
      return;
    }

    res.json(multiple);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new valuation multiple
 * POST /api/valuation-multiples
 */
export const createValuationMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = createValuationMultipleSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const multiple = await ValuationMultipleService.createMultiple(value);
    res.status(201).json(multiple);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a valuation multiple
 * PUT /api/valuation-multiples/:id
 */
export const updateValuationMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateValuationMultipleSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const multiple = await ValuationMultipleService.updateMultiple(id, value);
    res.json(multiple);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a valuation multiple
 * DELETE /api/valuation-multiples/:id
 */
export const deleteValuationMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await ValuationMultipleService.deleteMultiple(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Export all valuation multiples as CSV
 * GET /api/valuation-multiples/export/csv
 */
export const exportValuationMultiplesCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const multiples = await ValuationMultipleService.getMultiplesForExport();

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
  } catch (error) {
    next(error);
  }
};

/**
 * Export all valuation multiples as JSON
 * GET /api/valuation-multiples/export/json
 */
export const exportValuationMultiplesJSON = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const multiples = await ValuationMultipleService.getMultiplesForExport();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="valuation-multiples-${new Date().toISOString().split("T")[0]}.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      totalRecords: multiples.length,
      data: multiples,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create valuation multiples
 * POST /api/valuation-multiples/bulk
 */
export const bulkCreateValuationMultiples = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = bulkCreateValuationMultiplesSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const createdMultiples = await ValuationMultipleService.bulkCreateMultiples(value.multiples);
    res.status(201).json({
      message: "Multiples created successfully",
      count: createdMultiples.length,
      data: createdMultiples,
    });
  } catch (error) {
    next(error);
  }
};
