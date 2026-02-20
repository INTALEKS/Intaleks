"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionnaireRouter = void 0;
const express_1 = require("express");
const questionnaireController = __importStar(require("../controllers/questionnaire.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
/**
 * Admin authorization middleware
 * Ensures the authenticated user has ADMIN role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (req.user.role !== "ADMIN") {
        res.status(403).json({
            error: "Access denied",
            message: "Admin privileges required",
        });
        return;
    }
    next();
};
const router = (0, express_1.Router)();
exports.questionnaireRouter = router;
// Public routes (authenticated users)
router.post("/", authMiddleware_1.authenticateToken, questionnaireController.submitQuestionnaire);
router.get("/", authMiddleware_1.authenticateToken, questionnaireController.getUserResponses);
router.get("/:id", authMiddleware_1.authenticateToken, questionnaireController.getQuestionnaireResponse);
router.post("/preview", questionnaireController.calculatePreview); // No auth for preview
