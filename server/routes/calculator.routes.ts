import { Router } from "express";
import { authenticateToken, requireActiveSubscription } from "../middleware/authMiddleware";
import { calculateValuation } from "../controllers/calculator.controller";
import { rateLimitCalculation } from "../middleware/rateLimiter";

const router = Router();

// Calculate valuation - requires authentication and active subscription
router.post("/calculate", authenticateToken, requireActiveSubscription, rateLimitCalculation, calculateValuation);

export default router;
