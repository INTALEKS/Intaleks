"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All invoice routes require authentication
router.use(authMiddleware_1.authenticateToken);
// User invoice routes
router.get("/", invoice_controller_1.InvoiceController.getUserInvoices);
router.get("/:id", invoice_controller_1.InvoiceController.getInvoiceById);
router.post("/:id/resend", invoice_controller_1.InvoiceController.resendInvoiceEmail);
// Admin routes
router.get("/admin/all", invoice_controller_1.InvoiceController.getAllInvoices);
exports.default = router;
