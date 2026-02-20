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
exports.submitQuestionnaire = submitQuestionnaire;
exports.getUserResponses = getUserResponses;
exports.getQuestionnaireResponse = getQuestionnaireResponse;
exports.calculatePreview = calculatePreview;
const questionnaireService = __importStar(require("../services/questionnaire"));
const questionnaireValidation_1 = require("../validation/questionnaireValidation");
/**
 * Submit questionnaire response
 * POST /api/questionnaire
 */
async function submitQuestionnaire(req, res) {
    const { error, value } = questionnaireValidation_1.submitQuestionnaireSchema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const response = await questionnaireService.submitQuestionnaire(userId, value);
    res.json(response);
}
/**
 * Get user's questionnaire responses
 * GET /api/questionnaire
 */
async function getUserResponses(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const responses = await questionnaireService.getUserQuestionnaireResponses(userId);
    res.json(responses);
}
/**
 * Get a specific questionnaire response
 * GET /api/questionnaire/:id
 */
async function getQuestionnaireResponse(req, res) {
    const { id } = req.params;
    const response = await questionnaireService.getQuestionnaireResponse(id);
    res.json(response);
}
/**
 * Calculate preview multiple without saving
 * POST /api/questionnaire/preview
 */
async function calculatePreview(req, res) {
    const { country, industry, overrideMultiple, ...scores } = req.body;
    if (!country || !industry) {
        res.status(400).json({ error: "Country and industry are required" });
        return;
    }
    const result = await questionnaireService.calculatePreviewMultiple(country, industry, scores, overrideMultiple);
    res.json(result);
}
