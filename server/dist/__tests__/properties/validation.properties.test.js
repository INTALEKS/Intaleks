"use strict";
/**
 * Property-Based Tests for Validation Errors
 * **Feature: users-subscription-api, Property 11: Invalid data returns 400 with details**
 * **Validates: Requirements 4.3, 10.3**
 *
 * This test verifies that for any request with invalid data (missing required fields,
 * invalid format), the System SHALL return a 400 status code with validation details.
 */
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
const vitest_1 = require("vitest");
const fc = __importStar(require("fast-check"));
const userValidation_1 = require("../../validation/userValidation");
const subscriptionValidation_1 = require("../../validation/subscriptionValidation");
/**
 * Helper function to validate and check for 400 response structure
 * Returns true if validation fails with proper error details
 */
function validateAndCheckError(schema, data) {
    const { error } = schema;
    if (!error) {
        return { isValid: true, hasDetails: false, statusCode: 200 };
    }
    // Check that error has details array
    const hasDetails = Array.isArray(error.details) && error.details.length > 0;
    return { isValid: false, hasDetails, statusCode: 400 };
}
(0, vitest_1.describe)("Property 11: Invalid data returns 400 with details", () => {
    (0, vitest_1.describe)("User Creation Validation", () => {
        /**
         * Property: For any user creation request missing required email field,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject user creation with missing email", () => {
            fc.assert(fc.property(fc.record({
                password: fc.string({ minLength: 8 }),
                name: fc.option(fc.string(), { nil: undefined }),
            }), (userData) => {
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error
                (0, vitest_1.expect)(error).toBeDefined();
                (0, vitest_1.expect)(error.details.length).toBeGreaterThan(0);
                // Should mention email in error details
                const emailError = error.details.find((d) => d.path.includes("email") || d.message.includes("email"));
                (0, vitest_1.expect)(emailError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user creation request missing required password field,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject user creation with missing password", () => {
            fc.assert(fc.property(fc.emailAddress(), (email) => {
                const userData = { email };
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error
                (0, vitest_1.expect)(error).toBeDefined();
                (0, vitest_1.expect)(error.details.length).toBeGreaterThan(0);
                // Should mention password in error details
                const passwordError = error.details.find((d) => d.path.includes("password") || d.message.includes("password"));
                (0, vitest_1.expect)(passwordError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user creation request with invalid email format,
         * validation SHALL fail with details about the invalid format.
         */
        (0, vitest_1.it)("should reject user creation with invalid email format", () => {
            // Generate strings that are NOT valid emails
            const invalidEmailArb = fc.string({ minLength: 1 }).filter((s) => !s.includes("@") || !s.includes("."));
            fc.assert(fc.property(invalidEmailArb, fc.string({ minLength: 8 }), (invalidEmail, password) => {
                const userData = { email: invalidEmail, password };
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error for email
                (0, vitest_1.expect)(error).toBeDefined();
                const emailError = error.details.find((d) => d.path.includes("email"));
                (0, vitest_1.expect)(emailError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user creation request with password shorter than 8 characters,
         * validation SHALL fail with details about the password length.
         */
        (0, vitest_1.it)("should reject user creation with short password", () => {
            fc.assert(fc.property(fc.emailAddress(), fc.string({ minLength: 1, maxLength: 7 }), (email, shortPassword) => {
                const userData = { email, password: shortPassword };
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error for password
                (0, vitest_1.expect)(error).toBeDefined();
                const passwordError = error.details.find((d) => d.path.includes("password"));
                (0, vitest_1.expect)(passwordError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user creation request with invalid status value,
         * validation SHALL fail with details about the invalid enum value.
         */
        (0, vitest_1.it)("should reject user creation with invalid status", () => {
            const invalidStatusArb = fc.string({ minLength: 1 }).filter((s) => s !== "ACTIVE" && s !== "SUSPENDED");
            fc.assert(fc.property(fc.emailAddress(), fc.string({ minLength: 8 }), invalidStatusArb, (email, password, invalidStatus) => {
                const userData = { email, password, status: invalidStatus };
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error for status
                (0, vitest_1.expect)(error).toBeDefined();
                const statusError = error.details.find((d) => d.path.includes("status"));
                (0, vitest_1.expect)(statusError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user creation request with invalid planType value,
         * validation SHALL fail with details about the invalid enum value.
         */
        (0, vitest_1.it)("should reject user creation with invalid planType", () => {
            const invalidPlanTypeArb = fc.string({ minLength: 1 }).filter((s) => s !== "VISITOR" && s !== "MONTHLY" && s !== "ONE_OFF" && s !== "");
            fc.assert(fc.property(fc.emailAddress(), fc.string({ minLength: 8 }), invalidPlanTypeArb, (email, password, invalidPlanType) => {
                const userData = { email, password, planType: invalidPlanType };
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                // Should have validation error for planType
                (0, vitest_1.expect)(error).toBeDefined();
                const planTypeError = error.details.find((d) => d.path.includes("planType"));
                (0, vitest_1.expect)(planTypeError).toBeDefined();
            }), { numRuns: 100 });
        });
    });
    (0, vitest_1.describe)("User Update Validation", () => {
        /**
         * Property: For any user update request with empty body,
         * validation SHALL fail requiring at least one field.
         */
        (0, vitest_1.it)("should reject user update with empty body", () => {
            const { error } = userValidation_1.updateUserSchema.validate({}, { abortEarly: false });
            (0, vitest_1.expect)(error).toBeDefined();
            (0, vitest_1.expect)(error.details.length).toBeGreaterThan(0);
        });
        /**
         * Property: For any user update request with invalid email format,
         * validation SHALL fail with details about the invalid format.
         */
        (0, vitest_1.it)("should reject user update with invalid email format", () => {
            const invalidEmailArb = fc.string({ minLength: 1 }).filter((s) => !s.includes("@") || !s.includes("."));
            fc.assert(fc.property(invalidEmailArb, (invalidEmail) => {
                const { error } = userValidation_1.updateUserSchema.validate({ email: invalidEmail }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const emailError = error.details.find((d) => d.path.includes("email"));
                (0, vitest_1.expect)(emailError).toBeDefined();
            }), { numRuns: 100 });
        });
    });
    (0, vitest_1.describe)("Subscription Plan Creation Validation", () => {
        /**
         * Property: For any subscription plan creation request missing required name,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject plan creation with missing name", () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 50 }), fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (price, features) => {
                const planData = { price, features };
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeDefined();
                const nameError = error.details.find((d) => d.path.includes("name") || d.message.includes("name"));
                (0, vitest_1.expect)(nameError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any subscription plan creation request missing required price,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject plan creation with missing price", () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 100 }), fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (name, features) => {
                const planData = { name, features };
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeDefined();
                const priceError = error.details.find((d) => d.path.includes("price") || d.message.includes("price"));
                (0, vitest_1.expect)(priceError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any subscription plan creation request missing required features,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject plan creation with missing features", () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 100 }), fc.string({ minLength: 1, maxLength: 50 }), (name, price) => {
                const planData = { name, price };
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeDefined();
                const featuresError = error.details.find((d) => d.path.includes("features") || d.message.includes("features"));
                (0, vitest_1.expect)(featuresError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any subscription plan creation request with empty features array,
         * validation SHALL fail with details about the minimum requirement.
         */
        (0, vitest_1.it)("should reject plan creation with empty features array", () => {
            fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 100 }), fc.string({ minLength: 1, maxLength: 50 }), (name, price) => {
                const planData = { name, price, features: [] };
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeDefined();
                const featuresError = error.details.find((d) => d.path.includes("features"));
                (0, vitest_1.expect)(featuresError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any subscription plan creation request with name exceeding max length,
         * validation SHALL fail with details about the length constraint.
         */
        (0, vitest_1.it)("should reject plan creation with name exceeding max length", () => {
            fc.assert(fc.property(fc.string({ minLength: 101, maxLength: 200 }), fc.string({ minLength: 1, maxLength: 50 }), fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), (longName, price, features) => {
                const planData = { name: longName, price, features };
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeDefined();
                const nameError = error.details.find((d) => d.path.includes("name"));
                (0, vitest_1.expect)(nameError).toBeDefined();
            }), { numRuns: 100 });
        });
    });
    (0, vitest_1.describe)("Subscription Plan Update Validation", () => {
        /**
         * Property: For any subscription plan update request with empty body,
         * validation SHALL fail requiring at least one field.
         */
        (0, vitest_1.it)("should reject plan update with empty body", () => {
            const { error } = subscriptionValidation_1.updateSubscriptionSchema.validate({}, { abortEarly: false });
            (0, vitest_1.expect)(error).toBeDefined();
            (0, vitest_1.expect)(error.details.length).toBeGreaterThan(0);
        });
        /**
         * Property: For any subscription plan update request with empty features array,
         * validation SHALL fail with details about the minimum requirement.
         */
        (0, vitest_1.it)("should reject plan update with empty features array", () => {
            const { error } = subscriptionValidation_1.updateSubscriptionSchema.validate({ features: [] }, { abortEarly: false });
            (0, vitest_1.expect)(error).toBeDefined();
            const featuresError = error.details.find((d) => d.path.includes("features"));
            (0, vitest_1.expect)(featuresError).toBeDefined();
        });
    });
    (0, vitest_1.describe)("User Filters Validation", () => {
        /**
         * Property: For any user filter request with month outside valid range (1-12),
         * validation SHALL fail with details about the range constraint.
         */
        (0, vitest_1.it)("should reject filters with invalid month", () => {
            const invalidMonthArb = fc.oneof(fc.integer({ min: -100, max: 0 }), fc.integer({ min: 13, max: 100 }));
            fc.assert(fc.property(invalidMonthArb, (invalidMonth) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ month: invalidMonth }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const monthError = error.details.find((d) => d.path.includes("month"));
                (0, vitest_1.expect)(monthError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user filter request with day outside valid range (1-31),
         * validation SHALL fail with details about the range constraint.
         */
        (0, vitest_1.it)("should reject filters with invalid day", () => {
            const invalidDayArb = fc.oneof(fc.integer({ min: -100, max: 0 }), fc.integer({ min: 32, max: 100 }));
            fc.assert(fc.property(invalidDayArb, (invalidDay) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ day: invalidDay }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const dayError = error.details.find((d) => d.path.includes("day"));
                (0, vitest_1.expect)(dayError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user filter request with invalid planType,
         * validation SHALL fail with details about the invalid enum value.
         */
        (0, vitest_1.it)("should reject filters with invalid planType", () => {
            const invalidPlanTypeArb = fc.string({ minLength: 1 }).filter((s) => s !== "VISITOR" && s !== "MONTHLY" && s !== "ONE_OFF");
            fc.assert(fc.property(invalidPlanTypeArb, (invalidPlanType) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ planType: invalidPlanType }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const planTypeError = error.details.find((d) => d.path.includes("planType"));
                (0, vitest_1.expect)(planTypeError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user filter request with invalid status,
         * validation SHALL fail with details about the invalid enum value.
         */
        (0, vitest_1.it)("should reject filters with invalid status", () => {
            const invalidStatusArb = fc.string({ minLength: 1 }).filter((s) => s !== "ACTIVE" && s !== "SUSPENDED");
            fc.assert(fc.property(invalidStatusArb, (invalidStatus) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ status: invalidStatus }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const statusError = error.details.find((d) => d.path.includes("status"));
                (0, vitest_1.expect)(statusError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user filter request with page less than 1,
         * validation SHALL fail with details about the minimum constraint.
         */
        (0, vitest_1.it)("should reject filters with invalid page number", () => {
            fc.assert(fc.property(fc.integer({ min: -100, max: 0 }), (invalidPage) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ page: invalidPage }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const pageError = error.details.find((d) => d.path.includes("page"));
                (0, vitest_1.expect)(pageError).toBeDefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any user filter request with limit exceeding 100,
         * validation SHALL fail with details about the maximum constraint.
         */
        (0, vitest_1.it)("should reject filters with limit exceeding maximum", () => {
            fc.assert(fc.property(fc.integer({ min: 101, max: 1000 }), (invalidLimit) => {
                const { error } = userValidation_1.userFiltersSchema.validate({ limit: invalidLimit }, { abortEarly: false });
                (0, vitest_1.expect)(error).toBeDefined();
                const limitError = error.details.find((d) => d.path.includes("limit"));
                (0, vitest_1.expect)(limitError).toBeDefined();
            }), { numRuns: 100 });
        });
    });
    (0, vitest_1.describe)("Assign Subscription Validation", () => {
        /**
         * Property: For any assign subscription request missing required planId,
         * validation SHALL fail with details about the missing field.
         */
        (0, vitest_1.it)("should reject assign subscription with missing planId", () => {
            const { error } = userValidation_1.assignSubscriptionSchema.validate({}, { abortEarly: false });
            (0, vitest_1.expect)(error).toBeDefined();
            const planIdError = error.details.find((d) => d.path.includes("planId") || d.message.includes("Plan ID"));
            (0, vitest_1.expect)(planIdError).toBeDefined();
        });
        /**
         * Property: For any assign subscription request with empty planId,
         * validation SHALL fail with details about the empty field.
         */
        (0, vitest_1.it)("should reject assign subscription with empty planId", () => {
            const { error } = userValidation_1.assignSubscriptionSchema.validate({ planId: "" }, { abortEarly: false });
            (0, vitest_1.expect)(error).toBeDefined();
            const planIdError = error.details.find((d) => d.path.includes("planId"));
            (0, vitest_1.expect)(planIdError).toBeDefined();
        });
    });
    (0, vitest_1.describe)("Valid Data Acceptance", () => {
        /**
         * Property: For any valid user creation data, validation SHALL pass.
         * This ensures we're not over-rejecting valid inputs.
         *
         * Note: We use a custom email generator that produces emails Joi will accept,
         * since Joi's email validation is stricter than RFC 5322 (requires valid TLDs).
         */
        (0, vitest_1.it)("should accept valid user creation data", () => {
            const validStatusArb = fc.constantFrom("ACTIVE", "SUSPENDED");
            const validPlanTypeArb = fc.constantFrom("VISITOR", "MONTHLY", "ONE_OFF");
            const validRoleArb = fc.constantFrom("USER", "ADMIN");
            // Custom email generator that produces emails Joi will accept
            // Joi requires valid-looking TLDs (at least 2 chars) and proper format
            const validEmailArb = fc
                .tuple(fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/), // local part
            fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/), // domain
            fc.constantFrom("com", "org", "net", "io", "dev") // valid TLD
            )
                .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);
            // Password must be at least 8 chars and not all whitespace
            const validPasswordArb = fc.tuple(fc.stringMatching(/^[a-zA-Z0-9]{8,20}$/)).map(([pwd]) => pwd);
            fc.assert(fc.property(validEmailArb, validPasswordArb, fc.string({ minLength: 1, maxLength: 255 }), fc.string({ minLength: 1, maxLength: 255 }), fc.option(validStatusArb, { nil: undefined }), fc.option(validPlanTypeArb, { nil: undefined }), fc.option(validRoleArb, { nil: undefined }), (email, password, firstName, lastName, status, planType, role) => {
                const userData = {
                    email,
                    password,
                    firstName,
                    lastName
                };
                if (status !== undefined)
                    userData.status = status;
                if (planType !== undefined)
                    userData.planType = planType;
                if (role !== undefined)
                    userData.role = role;
                const { error } = userValidation_1.createUserSchema.validate(userData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeUndefined();
            }), { numRuns: 100 });
        });
        /**
         * Property: For any valid subscription plan creation data, validation SHALL pass.
         * This ensures we're not over-rejecting valid inputs.
         */
        (0, vitest_1.it)("should accept valid subscription plan creation data", () => {
            // Generate valid non-whitespace strings for name
            const validNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,99}$/).filter((s) => s.trim().length > 0);
            // Generate valid non-whitespace strings for features
            const validFeatureArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,499}$/).filter((s) => s.trim().length > 0);
            fc.assert(fc.property(validNameArb, fc.integer({ min: 0, max: 1000000 }), // Price in cents (integer >= 0)
            fc.array(validFeatureArb, {
                minLength: 1,
                maxLength: 10,
            }), fc.option(fc.boolean(), { nil: undefined }), (name, price, features, active) => {
                const planData = { name, price, features };
                if (active !== undefined)
                    planData.active = active;
                const { error } = subscriptionValidation_1.createSubscriptionSchema.validate(planData, {
                    abortEarly: false,
                });
                (0, vitest_1.expect)(error).toBeUndefined();
            }), { numRuns: 100 });
        });
    });
});
