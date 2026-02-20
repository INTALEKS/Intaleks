import { prisma } from "../config/db";

/**
 * Valuation multiple data interface
 */
export interface ValuationMultipleData {
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
}

/**
 * Valuation multiple response type
 */
export interface ValuationMultipleResponse {
  id: string;
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Valuation Multiples Service - Handles valuation multiples CRUD operations
 */
export class ValuationMultipleService {
  /**
   * Create a new valuation multiple
   */
  static async createMultiple(data: ValuationMultipleData): Promise<ValuationMultipleResponse> {
    const multiple = await prisma.valuationMultiple.create({
      data: {
        country: data.country.toLowerCase(),
        industry: data.industry.toLowerCase(),
        scoreRange: data.scoreRange,
        multiple: data.multiple,
      },
    });

    return multiple;
  }

  /**
   * Get all valuation multiples
   */
  static async getAllMultiples(): Promise<ValuationMultipleResponse[]> {
    const multiples = await prisma.valuationMultiple.findMany({
      orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
    });

    return multiples;
  }

  /**
   * Get valuation multiple by country, industry, and revenue range
   */
  static async getMultipleByCountryIndustryRevenue(country: string, industry: string, scoreRange: string): Promise<ValuationMultipleResponse | null> {
    const multiple = await prisma.valuationMultiple.findUnique({
      where: {
        country_industry_scoreRange: {
          country: country.toLowerCase(),
          industry: industry.toLowerCase(),
          scoreRange: scoreRange,
        },
      },
    });

    return multiple;
  }

  /**
   * Get multiples by country and industry (all revenue ranges)
   */
  static async getMultiplesByCountryAndIndustry(country: string, industry: string): Promise<ValuationMultipleResponse[]> {
    const multiples = await prisma.valuationMultiple.findMany({
      where: {
        country: country.toLowerCase(),
        industry: industry.toLowerCase(),
      },
      orderBy: { scoreRange: "asc" },
    });

    return multiples;
  }

  /**
   * Get multiples by country
   */
  static async getMultiplesByCountry(country: string): Promise<ValuationMultipleResponse[]> {
    const multiples = await prisma.valuationMultiple.findMany({
      where: { country: country.toLowerCase() },
      orderBy: { industry: "asc" },
    });

    return multiples;
  }

  /**
   * Update a valuation multiple
   */
  static async updateMultiple(id: string, data: Partial<ValuationMultipleData>): Promise<ValuationMultipleResponse> {
    const updateData: Partial<{
      country: string;
      industry: string;
      scoreRange: string;
      multiple: number;
    }> = {};

    if (data.country) updateData.country = data.country.toLowerCase();
    if (data.industry) updateData.industry = data.industry.toLowerCase();
    if (data.scoreRange) updateData.scoreRange = data.scoreRange;
    if (data.multiple !== undefined) updateData.multiple = data.multiple;

    const multiple = await prisma.valuationMultiple.update({
      where: { id },
      data: updateData,
    });

    return multiple;
  }

  /**
   * Delete a valuation multiple
   */
  static async deleteMultiple(id: string): Promise<void> {
    await prisma.valuationMultiple.delete({
      where: { id },
    });
  }

  /**
   * Bulk create valuation multiples
   */
  static async bulkCreateMultiples(multiples: ValuationMultipleData[]): Promise<ValuationMultipleResponse[]> {
    const formattedMultiples = multiples.map((m) => ({
      country: m.country.toLowerCase(),
      industry: m.industry.toLowerCase(),
      scoreRange: m.scoreRange,
      multiple: m.multiple,
    }));

    await prisma.valuationMultiple.createMany({
      data: formattedMultiples,
      skipDuplicates: true,
    });

    // Return the created multiples
    return await prisma.valuationMultiple.findMany({
      where: {
        OR: formattedMultiples.map((m) => ({
          country: m.country,
          industry: m.industry,
          scoreRange: m.scoreRange,
        })),
      },
      orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
    });
  }

  /**
   * Get multiples formatted for export (CSV/Excel)
   */
  static async getMultiplesForExport(): Promise<
    {
      country: string;
      industry: string;
      scoreRange: string;
      multiple: number;
      createdAt: string;
    }[]
  > {
    const multiples = await prisma.valuationMultiple.findMany({
      select: {
        country: true,
        industry: true,
        scoreRange: true,
        multiple: true,
        createdAt: true,
      },
      orderBy: [{ country: "asc" }, { industry: "asc" }, { scoreRange: "asc" }],
    });

    return multiples.map((m: { country: string; industry: string; scoreRange: string; multiple: number; createdAt: Date }) => ({
      ...m,
      country: m.country.charAt(0).toUpperCase() + m.country.slice(1),
      industry: m.industry.charAt(0).toUpperCase() + m.industry.slice(1),
      createdAt: m.createdAt.toISOString(),
    }));
  }
}
