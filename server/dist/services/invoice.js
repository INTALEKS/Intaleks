"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../errors");
const email_1 = require("./email");
/**
 * Invoice Service
 * Handles invoice generation, storage, and email delivery
 */
class InvoiceService {
    /**
     * Generate invoice number in format: INV-YYYY-NNNN
     */
    async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const prefix = `INV-${year}-`;
        // Get the latest invoice for this year
        const latestInvoice = await db_1.prisma.invoice.findFirst({
            where: {
                invoiceNumber: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        let nextNumber = 1;
        if (latestInvoice) {
            const lastNumber = parseInt(latestInvoice.invoiceNumber.split("-")[2]);
            nextNumber = lastNumber + 1;
        }
        return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    }
    /**
     * Create invoice for a payment
     */
    async createInvoice(paymentId) {
        // Get payment with relations
        const payment = await db_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                user: true,
                plan: true,
            },
        });
        if (!payment) {
            throw new errors_1.NotFoundError("Payment not found");
        }
        // Check if invoice already exists
        const existingInvoice = await db_1.prisma.invoice.findUnique({
            where: { paymentId },
        });
        if (existingInvoice) {
            return existingInvoice;
        }
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber();
        // Determine invoice status based on payment status
        let invoiceStatus = "PENDING";
        let paidAt = null;
        if (payment.status === "SUCCEEDED") {
            invoiceStatus = "PAID";
            paidAt = payment.createdAt;
        }
        else if (payment.status === "FAILED") {
            invoiceStatus = "FAILED";
        }
        // Create invoice
        const invoice = await db_1.prisma.invoice.create({
            data: {
                invoiceNumber,
                paymentId: payment.id,
                userId: payment.userId,
                planId: payment.planId,
                amount: payment.amount,
                currency: payment.currency,
                status: invoiceStatus,
                stripeInvoiceId: payment.stripeInvoiceId,
                paidAt,
                dueDate: new Date(), // Due immediately for subscriptions
            },
        });
        return invoice;
    }
    /**
     * Send invoice email to user
     */
    async sendInvoiceEmail(invoiceId) {
        const invoice = await db_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                user: true,
                plan: true,
                payment: true,
            },
        });
        if (!invoice) {
            throw new errors_1.NotFoundError("Invoice not found");
        }
        // Send email
        await email_1.emailService.sendInvoiceEmail({
            email: invoice.user.email,
            firstName: invoice.user.firstName || undefined,
            lastName: invoice.user.lastName || undefined,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            currency: invoice.currency,
            planName: invoice.plan?.name || "Subscription",
            paidAt: invoice.paidAt || invoice.createdAt,
            stripeInvoiceId: invoice.stripeInvoiceId || undefined,
        });
        // Mark email as sent
        await db_1.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                emailSent: true,
                emailSentAt: new Date(),
            },
        });
    }
    /**
     * Get user invoices
     */
    async getUserInvoices(userId) {
        const invoices = await db_1.prisma.invoice.findMany({
            where: { userId },
            include: {
                user: true,
                plan: true,
                payment: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return invoices;
    }
    /**
     * Get invoice by ID
     */
    async getInvoiceById(invoiceId) {
        const invoice = await db_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                user: true,
                plan: true,
                payment: true,
            },
        });
        if (!invoice) {
            throw new errors_1.NotFoundError("Invoice not found");
        }
        return invoice;
    }
    /**
     * Get all invoices (admin)
     */
    async getAllInvoices() {
        const invoices = await db_1.prisma.invoice.findMany({
            include: {
                user: true,
                plan: true,
                payment: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return invoices;
    }
}
exports.invoiceService = new InvoiceService();
