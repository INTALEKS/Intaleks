"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeConfig = exports.stripe = void 0;
exports.getStripe = getStripe;
const stripe_1 = __importDefault(require("stripe"));
const environment_1 = require("./environment");
/**
 * Stripe client singleton
 * Uses HTTPS for all API communications (handled by Stripe SDK)
 * Validates: Requirements 9.4
 */
let stripe = null;
exports.stripe = stripe;
if (environment_1.config.stripe.secretKey) {
    exports.stripe = stripe = new stripe_1.default(environment_1.config.stripe.secretKey, {
        apiVersion: "2026-02-25.clover",
        typescript: true,
    });
}
else {
    console.warn("Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work.");
}
exports.stripeConfig = {
    webhookSecret: environment_1.config.stripe.webhookSecret,
    publishableKey: environment_1.config.stripe.publishableKey,
};
/**
 * Helper to get stripe instance with null check
 * Throws if stripe is not configured
 */
function getStripe() {
    if (!stripe) {
        throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
    }
    return stripe;
}
