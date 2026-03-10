import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All invoice routes require authentication
router.use(authenticateToken);

// User invoice routes
router.get("/", InvoiceController.getUserInvoices);
router.get("/:id", InvoiceController.getInvoiceById);
router.post("/:id/resend", InvoiceController.resendInvoiceEmail);

// Admin routes
router.get("/admin/all", InvoiceController.getAllInvoices);

export default router;
