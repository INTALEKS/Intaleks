/**
 * API service for valuation multiples
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

export interface ValuationMultiple {
  id: string;
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValuationMultipleFormData {
  country: string;
  industry: string;
  scoreRange: string;
  multiple: number;
}

/**
 * Public API - No authentication required
 * Used by calculator and public features
 */
class PublicValuationMultiplesAPI {
  private baseURL = `${API_BASE_URL}/valuation-multiples`;

  /**
   * Get all valuation multiples (public)
   */
  async getAllMultiples(): Promise<ValuationMultiple[]> {
    try {
      const response = await fetch(this.baseURL);

      if (!response.ok) {
        console.warn("Failed to fetch valuation multiples, using defaults");
        return [];
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching valuation multiples:", error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get multiples formatted as Record<country, Record<industry, Record<scoreRange, number>>>
   * Compatible with calculator that needs score range support
   */
  async getIndustryMultiples(): Promise<Record<string, Record<string, Record<string, number>>>> {
    try {
      const multiples = await this.getAllMultiples();

      return multiples.reduce(
        (acc, multiple) => {
          if (!acc[multiple.country]) {
            acc[multiple.country] = {};
          }
          if (!acc[multiple.country][multiple.industry]) {
            acc[multiple.country][multiple.industry] = {};
          }
          acc[multiple.country][multiple.industry][multiple.scoreRange] = multiple.multiple;
          return acc;
        },
        {} as Record<string, Record<string, Record<string, number>>>,
      );
    } catch (error) {
      console.error("Error formatting industry multiples:", error);
      return {}; // Return empty object on error
    }
  }

  /**
   * Get all multiples for a country and industry (all score ranges)
   */
  async getMultiplesByCountryAndIndustry(country: string, industry: string): Promise<ValuationMultiple[]> {
    try {
      const response = await fetch(`${this.baseURL}/${encodeURIComponent(country)}/${encodeURIComponent(industry)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch valuation multiples");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching multiples by country and industry:", error);
      return [];
    }
  }

  /**
   * Get base multiple (40-50 range) for a country and industry
   * This is used for display purposes before questionnaire is completed
   */
  async getBaseMultiple(country: string, industry: string): Promise<number> {
    try {
      const multiples = await this.getMultiplesByCountryAndIndustry(country, industry);
      const baseMultiple = multiples.find((m) => m.scoreRange === "40-50");
      return baseMultiple?.multiple || 4.0;
    } catch (error) {
      console.warn("Failed to fetch base multiple, using default 4.0:", error);
      return 4.0;
    }
  }
}

/**
 * Admin API - Requires authentication and admin role
 * Used for managing valuation multiples
 */
class AdminValuationMultiplesAPI {
  private baseURL = `${API_BASE_URL}/admin/valuation-multiples`;

  /**
   * Get all valuation multiples (admin view)
   */
  async getAllMultiples(): Promise<ValuationMultiple[]> {
    const response = await fetch(`${API_BASE_URL}/valuation-multiples`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch valuation multiples");
    }

    return response.json();
  }

  /**
   * Create a new valuation multiple (admin only)
   */
  async createMultiple(data: ValuationMultipleFormData): Promise<ValuationMultiple> {
    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to create valuation multiple" }));
      throw new Error(errorData.error || "Failed to create valuation multiple");
    }

    return response.json();
  }

  /**
   * Update a valuation multiple (admin only)
   */
  async updateMultiple(id: string, data: Partial<ValuationMultipleFormData>): Promise<ValuationMultiple> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update valuation multiple" }));
      throw new Error(errorData.error || "Failed to update valuation multiple");
    }

    return response.json();
  }

  /**
   * Delete a valuation multiple (admin only)
   */
  async deleteMultiple(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete valuation multiple" }));
      throw new Error(errorData.error || "Failed to delete valuation multiple");
    }
  }

  /**
   * Export multiples as CSV (admin only)
   */
  async exportCSV(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/csv`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to export valuation multiples as CSV");
    }

    return response.blob();
  }

  /**
   * Export multiples as JSON (admin only)
   */
  async exportJSON(): Promise<{ exportedAt: string; totalRecords: number; data: ValuationMultiple[] }> {
    const response = await fetch(`${this.baseURL}/export/json`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to export valuation multiples as JSON");
    }

    return response.json();
  }

  /**
   * Bulk create multiples (admin only)
   */
  async bulkCreateMultiples(multiples: ValuationMultipleFormData[]): Promise<{ message: string; count: number; data: ValuationMultiple[] }> {
    const response = await fetch(`${this.baseURL}/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ multiples }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to bulk create valuation multiples" }));
      throw new Error(errorData.error || "Failed to bulk create valuation multiples");
    }

    return response.json();
  }
}

// Export public API for calculator and public features
export const valuationMultiplesAPI = new PublicValuationMultiplesAPI();

// Export admin API for admin features
export const adminValuationMultiplesAPI = new AdminValuationMultiplesAPI();
