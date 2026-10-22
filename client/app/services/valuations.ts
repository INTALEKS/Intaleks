const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

/**
 * Valuation document type
 */
export interface ValuationDocument {
  id: string;
  companyName: string;
  country: string;
  industry: string;
  method: "asset" | "profit" | "dcf";
  valuation: number;
  fileUrl: string | null;
  fileSize: number | null;
  createdAt: string;
  inputData?: Record<string, unknown> | null;
}

/**
 * Create valuation document input
 */
export interface CreateValuationDocumentInput {
  companyName: string;
  country: string;
  industry: string;
  method: "asset" | "profit" | "dcf";
  valuation: number;
  fileUrl?: string;
  fileSize?: number;
}

/**
 * Valuation API client
 */
export const ValuationApi = {
  /**
   * Create a new valuation document record
   */
  async create(data: CreateValuationDocumentInput): Promise<ValuationDocument> {
    const response = await fetch(`${BASE_URL}/valuation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to create valuation document");
    }

    return result;
  },

  /**
   * Get all valuation documents for the current user
   */
  async getAll(): Promise<ValuationDocument[]> {
    const response = await fetch(`${BASE_URL}/valuation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to fetch valuation documents");
    }

    return result;
  },

  /**
   * Get a single valuation document by ID
   */
  async getById(id: string): Promise<ValuationDocument> {
    const response = await fetch(`${BASE_URL}/valuation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Failed to fetch valuation document");
    }

    return result;
  },

  /**
   * Delete a valuation document
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/valuation/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || "Failed to delete valuation document");
    }
  },
};

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";

  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Format valuation document date
 */
export function formatDocumentDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}
