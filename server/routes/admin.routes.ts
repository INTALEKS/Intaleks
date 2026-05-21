import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth";
import { loginSchema, validateRequest } from "../validation/authValidation";
import { CookieUtils } from "../utils/cookieUtils";
import { PaymentController } from "../controllers/payment.controller";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Admin login endpoint
router.post("/auth/login", validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginAdmin({ email, password });

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    CookieUtils.setAuthToken(res, result.token!);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    console.error("Login endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Admin payment routes (require authentication)
// GET /api/admin/payments - List all payments with filtering
// Requirements: 7.1, 7.2
router.get("/payments", authenticateToken, PaymentController.getAllPayments);

// GET /api/admin/payments/stats - Get payment statistics
// Requirements: 7.1
router.get("/payments/stats", authenticateToken, PaymentController.getPaymentStats);

// POST /api/admin/users/:id/grant-subscription - Grant subscription access
// Requirements: 7.4, 7.5
router.post("/users/:id/grant-subscription", authenticateToken, PaymentController.grantSubscription);

// POST /api/admin/users/:id/revoke-subscription - Revoke subscription access
// Requirements: 7.4, 7.5
router.post("/users/:id/revoke-subscription", authenticateToken, PaymentController.revokeSubscription);

export default router;
