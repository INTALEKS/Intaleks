"use strict";
/**
 * Stripe Error Classes and Handlers
 * Provides consistent error handling for Stripe payment operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeError = exports.USER_ERROR_MESSAGES = exports.STRIPE_ERROR_CODES = void 0;
exports.createStripeErrorFromApiError = createStripeErrorFromApiError;
exports.isStripeError = isStripeError;
exports.isStripeApiError = isStripeApiError;
const stripe_1 = __importDefault(require("stripe"));
/**
 * Stripe error codes for internal use
 */
exports.STRIPE_ERROR_CODES = {
    CUSTOMER_CREATION_FAILED: "STRIPE_CUSTOMER_CREATION_FAILED",
    CHECKOUT_SESSION_FAILED: "STRIPE_CHECKOUT_SESSION_FAILED",
    SUBSCRIPTION_CANCEL_FAILED: "STRIPE_SUBSCRIPTION_CANCEL_FAILED",
    WEBHOOK_SIGNATURE_INVALID: "STRIPE_WEBHOOK_SIGNATURE_INVALID",
    PRODUCT_SYNC_FAILED: "STRIPE_PRODUCT_SYNC_FAILED",
    PAYMENT_FAILED: "STRIPE_PAYMENT_FAILED",
    CARD_DECLINED: "STRIPE_CARD_DECLINED",
    INSUFFICIENT_FUNDS: "STRIPE_INSUFFICIENT_FUNDS",
    EXPIRED_CARD: "STRIPE_EXPIRED_CARD",
    PROCESSING_ERROR: "STRIPE_PROCESSING_ERROR",
};
/**
 * User-friendly error messages for Stripe decline codes
 */
exports.USER_ERROR_MESSAGES = {
    // Card decline reasons (Requirement 10.2)
    card_declined: "Your card was declined. Please try a different payment method.",
    generic_decline: "Your card was declined. Please try a different payment method.",
    // Insufficient funds (Requirement 10.1)
    insufficient_funds: "Your card has insufficient funds. Please try a different card.",
    // Expired card
    expired_card: "Your card has expired. Please use a different card.",
    // Invalid card details
    incorrect_number: "The card number is incorrect. Please check and try again.",
    incorrect_cvc: "The security code (CVC) is incorrect. Please check and try again.",
    incorrect_zip: "The ZIP/postal code is incorrect. Please check and try again.",
    invalid_expiry_month: "The expiration month is invalid. Please check and try again.",
    invalid_expiry_year: "The expiration year is invalid. Please check and try again.",
    invalid_cvc: "The security code (CVC) is invalid. Please check and try again.",
    invalid_number: "The card number is invalid. Please check and try again.",
    // Processing errors (Requirement 10.3)
    processing_error: "An error occurred processing your payment. Please try again.",
    rate_limit: "Too many requests. Please wait a moment and try again.",
    // Authentication required
    authentication_required: "Your card requires authentication. Please complete the verification.",
    // Card restrictions
    card_not_supported: "This card is not supported. Please try a different card.",
    currency_not_supported: "This currency is not supported by your card. Please try a different card.",
    do_not_honor: "Your card was declined. Please contact your bank or try a different card.",
    // Fraud prevention
    fraudulent: "This transaction was flagged as potentially fraudulent. Please contact your bank.",
    lost_card: "This card has been reported lost. Please use a different card.",
    stolen_card: "This card has been reported stolen. Please use a different card.",
    // Default fallback
    default: "Unable to process payment. Please try again or contact support.",
};
/**
 * StripeError class for payment-related errors
 * Extends Error with Stripe-specific properties
 */
class StripeError extends Error {
    code;
    statusCode;
    stripeError;
    userMessage;
    declineCode;
    constructor(message, code, statusCode, stripeError) {
        super(message);
        this.name = "StripeError";
        this.code = code;
        this.statusCode = statusCode;
        this.stripeError = stripeError;
        this.declineCode = this.extractDeclineCode(stripeError);
        this.userMessage = this.getUserFriendlyMessage();
        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * Extract decline code from Stripe error
     */
    extractDeclineCode(stripeError) {
        if (!stripeError)
            return undefined;
        // Check for decline_code in the error
        const err = stripeError;
        return err.decline_code || err.code;
    }
    /**
     * Get user-friendly error message based on Stripe error
     * Requirements: 10.1, 10.2
     */
    getUserFriendlyMessage() {
        // If we have a decline code, use the mapped message
        if (this.declineCode && exports.USER_ERROR_MESSAGES[this.declineCode]) {
            return exports.USER_ERROR_MESSAGES[this.declineCode];
        }
        // Map internal error codes to user messages
        switch (this.code) {
            case exports.STRIPE_ERROR_CODES.CARD_DECLINED:
                return exports.USER_ERROR_MESSAGES.card_declined;
            case exports.STRIPE_ERROR_CODES.INSUFFICIENT_FUNDS:
                return exports.USER_ERROR_MESSAGES.insufficient_funds;
            case exports.STRIPE_ERROR_CODES.EXPIRED_CARD:
                return exports.USER_ERROR_MESSAGES.expired_card;
            case exports.STRIPE_ERROR_CODES.PROCESSING_ERROR:
                return exports.USER_ERROR_MESSAGES.processing_error;
            case exports.STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID:
                return "Payment verification failed. Please try again.";
            case exports.STRIPE_ERROR_CODES.CHECKOUT_SESSION_FAILED:
                return "Unable to start checkout. Please try again.";
            case exports.STRIPE_ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED:
                return "Unable to cancel subscription. Please try again or contact support.";
            default:
                return exports.USER_ERROR_MESSAGES.default;
        }
    }
    /**
     * Check if this is a card error that the user can fix
     */
    isUserFixable() {
        const userFixableCodes = ["card_declined", "generic_decline", "insufficient_funds", "expired_card", "incorrect_number", "incorrect_cvc", "incorrect_zip", "invalid_expiry_month", "invalid_expiry_year", "invalid_cvc", "invalid_number", "authentication_required"];
        return this.declineCode ? userFixableCodes.includes(this.declineCode) : false;
    }
}
exports.StripeError = StripeError;
/**
 * Create a StripeError from a Stripe API error
 * Maps Stripe error types to appropriate error codes
 * Requirements: 10.1, 10.2, 10.3
 */
function createStripeErrorFromApiError(error, fallbackCode = exports.STRIPE_ERROR_CODES.PAYMENT_FAILED) {
    let code = fallbackCode;
    let statusCode = 500;
    // Map Stripe error types to our error codes
    switch (error.type) {
        case "StripeCardError":
            code = mapCardErrorCode(error);
            statusCode = 400;
            break;
        case "StripeRateLimitError":
            code = exports.STRIPE_ERROR_CODES.PROCESSING_ERROR;
            statusCode = 429;
            break;
        case "StripeInvalidRequestError":
            code = exports.STRIPE_ERROR_CODES.PAYMENT_FAILED;
            statusCode = 400;
            break;
        case "StripeAPIError":
            code = exports.STRIPE_ERROR_CODES.PROCESSING_ERROR;
            statusCode = 500;
            break;
        case "StripeConnectionError":
            code = exports.STRIPE_ERROR_CODES.PROCESSING_ERROR;
            statusCode = 503;
            break;
        case "StripeAuthenticationError":
            code = exports.STRIPE_ERROR_CODES.PAYMENT_FAILED;
            statusCode = 401;
            break;
        case "StripeSignatureVerificationError":
            code = exports.STRIPE_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID;
            statusCode = 400;
            break;
    }
    return new StripeError(error.message, code, statusCode, error);
}
/**
 * Map card error decline codes to our error codes
 */
function mapCardErrorCode(error) {
    const err = error;
    const declineCode = err.decline_code || err.code;
    switch (declineCode) {
        case "insufficient_funds":
            return exports.STRIPE_ERROR_CODES.INSUFFICIENT_FUNDS;
        case "expired_card":
            return exports.STRIPE_ERROR_CODES.EXPIRED_CARD;
        case "card_declined":
        case "generic_decline":
        case "do_not_honor":
        case "lost_card":
        case "stolen_card":
        case "fraudulent":
            return exports.STRIPE_ERROR_CODES.CARD_DECLINED;
        default:
            return exports.STRIPE_ERROR_CODES.PAYMENT_FAILED;
    }
}
/**
 * Check if an error is a Stripe error
 */
function isStripeError(error) {
    return error instanceof StripeError;
}
/**
 * Check if an error is a Stripe API error
 */
function isStripeApiError(error) {
    return error instanceof stripe_1.default.errors.StripeError;
}
