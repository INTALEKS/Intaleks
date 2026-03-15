import { prisma } from "../config/db";
import { NotFoundError } from "../errors";
import { emailService } from "./email";
import { getStripe } from "../config/stripe";
import type { Invoice, Payment, User, SubscriptionPlan } from "@prisma/client";

type InvoiceWithRelations = Invoice & {
  user: User;
  plan: SubscriptionPlan | null;
  payment: Payment;
};

/**
 * Invoice Service
 * Handles invoice generation, storage, and email delivery
 */
class InvoiceService {
  /**
   * Generate invoice number in format: INV-YYYY-NNNN
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Get the latest invoice for this year
    const latestInvoice = await prisma.invoice.findFirst({
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
  async createInvoice(paymentId: string): Promise<Invoice> {
    // Get payment with relations
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { paymentId },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Determine invoice status based on payment status
    let invoiceStatus: "PENDING" | "PAID" | "FAILED" = "PENDING";
    let paidAt: Date | null = null;

    if (payment.status === "SUCCEEDED") {
      invoiceStatus = "PAID";
      paidAt = payment.createdAt;
    } else if (payment.status === "FAILED") {
      invoiceStatus = "FAILED";
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
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
  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        plan: true,
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    const isSuccess = invoice.status === "PAID";

    // Try to fetch payment method details from Stripe
    let paymentMethod: string | undefined;
    try {
      if (invoice.payment.stripePaymentId) {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment.stripePaymentId, {
          expand: ["payment_method"],
        });
        const pm = paymentIntent.payment_method as import("stripe").Stripe.PaymentMethod | null;
        if (pm && pm.card) {
          const brand = pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1);
          paymentMethod = `${brand} ending in ${pm.card.last4}`;
        }
      }
    } catch {
      // Non-critical — proceed without payment method details
    }

    // Send email
    await emailService.sendInvoiceEmail({
      email: invoice.user.email,
      firstName: invoice.user.firstName || undefined,
      lastName: invoice.user.lastName || undefined,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      planName: invoice.plan?.name || "Subscription",
      billingPeriod: invoice.plan?.billingPeriod,
      paidAt: invoice.paidAt || invoice.createdAt,
      stripeInvoiceId: invoice.stripeInvoiceId || undefined,
      paymentMethod,
      nextRenewal: invoice.user.currentPeriodEnd,
      status: isSuccess ? "success" : "failed",
    });

    // Mark email as sent
    await prisma.invoice.update({
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
  async getUserInvoices(userId: string): Promise<InvoiceWithRelations[]> {
    const invoices = await prisma.invoice.findMany({
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
  async getInvoiceById(invoiceId: string): Promise<InvoiceWithRelations> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        plan: true,
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    return invoice;
  }

  /**
   * Get all invoices (admin)
   */
  async getAllInvoices(): Promise<InvoiceWithRelations[]> {
    const invoices = await prisma.invoice.findMany({
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

export const invoiceService = new InvoiceService();
