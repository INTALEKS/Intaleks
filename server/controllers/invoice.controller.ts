import { Request, Response } from "express";
import { invoiceService } from "../services/invoice";
import { NotFoundError } from "../errors";

/**
 * Invoice Controller
 * Handles invoice-related HTTP requests
 */
export class InvoiceController {
  /**
   * Get user's invoices
   */
  static async getUserInvoices(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const invoices = await invoiceService.getUserInvoices(userId);
      res.json({ data: invoices });
    } catch (error) {
      console.error("Error fetching user invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  /**
   * Get invoice by ID (user can only access their own invoices)
   */
  static async getInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const invoice = await invoiceService.getInvoiceById(id);

      // Check if user owns this invoice
      if (invoice.userId !== userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      res.json({ data: invoice });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: "Invoice not found" });
        return;
      }

      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  }

  /**
   * Resend invoice email
   */
  static async resendInvoiceEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const invoice = await invoiceService.getInvoiceById(id);

      // Check if user owns this invoice
      if (invoice.userId !== userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      await invoiceService.sendInvoiceEmail(id);
      res.json({ data: { message: "Invoice email sent successfully" } });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: "Invoice not found" });
        return;
      }

      console.error("Error resending invoice email:", error);
      res.status(500).json({ error: "Failed to resend invoice email" });
    }
  }

  /**
   * Get all invoices (admin only)
   */
  static async getAllInvoices(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      const invoices = await invoiceService.getAllInvoices();
      res.json({ data: invoices });
    } catch (error) {
      console.error("Error fetching all invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }
}
