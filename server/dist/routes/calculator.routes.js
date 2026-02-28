"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const calculator_controller_1 = require("../controllers/calculator.controller");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Calculate valuation - requires authentication and active subscription
router.post("/calculate", authMiddleware_1.authenticateToken, authMiddleware_1.requireActiveSubscription, rateLimiter_1.rateLimitCalculation, calculator_controller_1.calculateValuation);
exports.default = router;
