import { Router, Request, Response, NextFunction } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { WebhookService } from "../services/webhook";
import { isStripeError } from "../errors";
import { authenticateToken } from "../middleware/authMiddleware";

/**
 * Payment routes for authenticated users
 * Requirements: 2.1, 5.2, 6.1
 */
const router = Router();

// Apply authentication to all payment routes
router.use(authenticateToken);

// POST /api/payments/checkout - Create checkout session
// Requirements: 2.1
router.post("/checkout", PaymentController.createCheckout);

// GET /api/payments/history - Get payment history
// Requirements: 5.2
router.get("/history", PaymentController.getPaymentHistory);

// GET /api/payments/subscription - Get subscription status
// Requirements: 4.5
router.get("/subscription", PaymentController.getSubscriptionStatus);

// POST /api/payments/cancel - Cancel subscription
// Requirements: 6.1
router.post("/cancel", PaymentController.cancelSubscription);

export default router;

/**
 * Webhook routes for Stripe events
 * Note: This router must be mounted BEFORE express.json() middleware
 * because Stripe webhooks require the raw body for signature verification
 * Requirements: 3.1, 3.7
 */
export const webhookRouter = Router();

// POST /api/webhooks/stripe - Handle Stripe webhooks
// Requirements: 3.1, 3.7
webhookRouter.post("/stripe", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get the raw body and signature
    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      res.status(400).json({
        success: false,
        error: {
          code: "MISSING_SIGNATURE",
          message: "Missing Stripe signature header",
        },
      });
      return;
    }

    // Process the webhook event
    const result = await WebhookService.handleEvent(payload, signature);

    // Return 200 to acknowledge receipt (Requirement 3.7)
    res.status(200).json({
      success: result.success,
      eventType: result.eventType,
      message: result.message,
    });
  } catch (error) {
    if (isStripeError(error)) {
      // Return 400 for invalid signatures (Requirement 3.6)
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.userMessage,
        },
      });
      return;
    }

    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "WEBHOOK_ERROR",
        message: "An error occurred while processing webhook",
      },
    });
  }
});
