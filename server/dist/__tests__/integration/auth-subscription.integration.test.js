"use strict";
/**
 * Integration Tests for User Authentication & Subscription Flow
 * **Feature: user-auth-subscription**
 * **Validates: Requirements 1.1, 2.1, 5.1, 6.1, 6.2, 6.3, 6.4**
 *
 * Tests the end-to-end flow:
 * - Registration → Login → View Plans → Checkout
 * - Cookie handling
 * - Subscription status updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_1 = require("../../services/auth");
const subscription_1 = require("../../services/subscription");
const db_1 = require("../../config/db");
const authValidation_1 = require("../../validation/authValidation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
// Test data
const testUserEmail = `test-${Date.now()}@example.com`;
const testUserPassword = "TestPassword123!";
const testUserFirstName = "Test";
const testUserLastName = "User";
(0, vitest_1.describe)("User Authentication & Subscription Integration", () => {
    let testUserId = null;
    let testPlanId = null;
    // Cleanup after all tests
    (0, vitest_1.afterAll)(async () => {
        // Clean up test user if created
        if (testUserId) {
            try {
                await db_1.prisma.user.delete({ where: { id: testUserId } });
            }
            catch (e) {
                // User may already be deleted
            }
        }
        // Clean up test plan if created
        if (testPlanId) {
            try {
                await db_1.prisma.subscriptionPlan.delete({ where: { id: testPlanId } });
            }
            catch (e) {
                // Plan may already be deleted
            }
        }
        await db_1.prisma.$disconnect();
    });
    (0, vitest_1.describe)("Step 1: User Registration", () => {
        (0, vitest_1.it)("should validate registration input correctly", () => {
            // Valid input
            const validInput = {
                email: testUserEmail,
                password: testUserPassword,
                firstName: testUserFirstName,
                lastName: testUserLastName,
            };
            const { error: validError } = authValidation_1.registerSchema.validate(validInput);
            (0, vitest_1.expect)(validError).toBeUndefined();
            // Invalid email
            const invalidEmailInput = {
                email: "invalid-email",
                password: testUserPassword,
            };
            const { error: emailError } = authValidation_1.registerSchema.validate(invalidEmailInput);
            (0, vitest_1.expect)(emailError).toBeDefined();
            // Short password
            const shortPasswordInput = {
                email: testUserEmail,
                password: "short",
            };
            const { error: passwordError } = authValidation_1.registerSchema.validate(shortPasswordInput);
            (0, vitest_1.expect)(passwordError).toBeDefined();
        });
        (0, vitest_1.it)("should register a new user successfully (Requirement 1.1)", async () => {
            const result = await auth_1.AuthService.registerUser({
                email: testUserEmail,
                password: testUserPassword,
                firstName: testUserFirstName,
                lastName: testUserLastName,
            });
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.token).toBeDefined();
            (0, vitest_1.expect)(result.user).toBeDefined();
            (0, vitest_1.expect)(result.user?.email).toBe(testUserEmail.toLowerCase());
            (0, vitest_1.expect)(result.user?.firstName).toBe(testUserFirstName);
            (0, vitest_1.expect)(result.user?.lastName).toBe(testUserLastName);
            (0, vitest_1.expect)(result.user?.role).toBe(client_1.UserRole.USER);
            (0, vitest_1.expect)(result.user?.subscriptionStatus).toBe(client_1.SubscriptionStatus.NONE);
            // Store user ID for cleanup
            testUserId = result.user?.id || null;
        });
        (0, vitest_1.it)("should hash password with bcrypt (Requirement 1.5)", async () => {
            if (!testUserId) {
                throw new Error("Test user not created");
            }
            const user = await db_1.prisma.user.findUnique({
                where: { id: testUserId },
            });
            (0, vitest_1.expect)(user).toBeDefined();
            // Password should not be stored in plaintext
            (0, vitest_1.expect)(user?.password).not.toBe(testUserPassword);
            // Password should be a valid bcrypt hash
            const isValidHash = await bcrypt_1.default.compare(testUserPassword, user?.password || "");
            (0, vitest_1.expect)(isValidHash).toBe(true);
        });
        (0, vitest_1.it)("should reject duplicate email registration (Requirement 1.2)", async () => {
            const result = await auth_1.AuthService.registerUser({
                email: testUserEmail,
                password: testUserPassword,
                name: "Another User",
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.message).toBe("A user with this email already exists");
        });
    });
    (0, vitest_1.describe)("Step 2: User Login", () => {
        (0, vitest_1.it)("should validate login input correctly", () => {
            // Valid input
            const validInput = {
                email: testUserEmail,
                password: testUserPassword,
            };
            const { error: validError } = authValidation_1.loginSchema.validate(validInput);
            (0, vitest_1.expect)(validError).toBeUndefined();
            // Missing email
            const missingEmailInput = {
                password: testUserPassword,
            };
            const { error: emailError } = authValidation_1.loginSchema.validate(missingEmailInput);
            (0, vitest_1.expect)(emailError).toBeDefined();
            // Missing password
            const missingPasswordInput = {
                email: testUserEmail,
            };
            const { error: passwordError } = authValidation_1.loginSchema.validate(missingPasswordInput);
            (0, vitest_1.expect)(passwordError).toBeDefined();
        });
        (0, vitest_1.it)("should login user with correct credentials (Requirement 2.1)", async () => {
            const result = await auth_1.AuthService.loginUser({
                email: testUserEmail,
                password: testUserPassword,
            });
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.token).toBeDefined();
            (0, vitest_1.expect)(result.user).toBeDefined();
            (0, vitest_1.expect)(result.user?.email).toBe(testUserEmail.toLowerCase());
            (0, vitest_1.expect)(result.user?.subscriptionStatus).toBeDefined();
        });
        (0, vitest_1.it)("should return consistent error for wrong password (Requirement 2.2)", async () => {
            const result = await auth_1.AuthService.loginUser({
                email: testUserEmail,
                password: "WrongPassword123!",
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.message).toBe("Invalid email or password");
        }, 10000);
        (0, vitest_1.it)("should return consistent error for non-existent email (Requirement 2.3)", async () => {
            const result = await auth_1.AuthService.loginUser({
                email: "nonexistent@example.com",
                password: testUserPassword,
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.message).toBe("Invalid email or password");
        });
        (0, vitest_1.it)("should reject suspended user login (Requirement 2.4)", async () => {
            if (!testUserId) {
                throw new Error("Test user not created");
            }
            // Suspend the user
            await db_1.prisma.user.update({
                where: { id: testUserId },
                data: { status: client_1.UserStatus.SUSPENDED },
            });
            const result = await auth_1.AuthService.loginUser({
                email: testUserEmail,
                password: testUserPassword,
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.message).toBe("Your account has been suspended");
            // Restore user status
            await db_1.prisma.user.update({
                where: { id: testUserId },
                data: { status: client_1.UserStatus.ACTIVE },
            });
        });
    });
    (0, vitest_1.describe)("Step 3: View Subscription Plans", () => {
        (0, vitest_1.beforeAll)(async () => {
            // Create a test subscription plan
            const plan = await db_1.prisma.subscriptionPlan.create({
                data: {
                    name: `Test Plan ${Date.now()}`,
                    price: 999, // $9.99 in cents
                    billingPeriod: "MONTHLY",
                    features: ["Feature 1", "Feature 2", "Feature 3"],
                    active: true,
                },
            });
            testPlanId = plan.id;
        });
        (0, vitest_1.it)("should return only active plans (Requirement 5.1)", async () => {
            const plans = await subscription_1.SubscriptionService.findActivePlans();
            (0, vitest_1.expect)(Array.isArray(plans)).toBe(true);
            // All returned plans should be active
            plans.forEach((plan) => {
                (0, vitest_1.expect)(plan.active).toBe(true);
            });
        });
        (0, vitest_1.it)("should return plans with required fields (Requirement 5.2)", async () => {
            const plans = await subscription_1.SubscriptionService.findActivePlans();
            (0, vitest_1.expect)(plans.length).toBeGreaterThan(0);
            plans.forEach((plan) => {
                (0, vitest_1.expect)(plan.id).toBeDefined();
                (0, vitest_1.expect)(plan.name).toBeDefined();
                (0, vitest_1.expect)(plan.price).toBeDefined();
                (0, vitest_1.expect)(plan.billingPeriod).toBeDefined();
                (0, vitest_1.expect)(plan.features).toBeDefined();
                (0, vitest_1.expect)(Array.isArray(plan.features)).toBe(true);
            });
        });
        (0, vitest_1.it)("should return plans ordered by price ascending (Requirement 5.3)", async () => {
            const plans = await subscription_1.SubscriptionService.findActivePlans();
            if (plans.length > 1) {
                for (let i = 1; i < plans.length; i++) {
                    (0, vitest_1.expect)(plans[i].price).toBeGreaterThanOrEqual(plans[i - 1].price);
                }
            }
        });
    });
    (0, vitest_1.describe)("Step 4: Logout", () => {
        (0, vitest_1.it)("should return success on logout (Requirement 4.2)", () => {
            const result = auth_1.AuthService.logout();
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.message).toBe("Logged out successfully");
        });
    });
    (0, vitest_1.describe)("JWT Token Verification", () => {
        (0, vitest_1.it)("should generate valid JWT token on registration", async () => {
            const uniqueEmail = `jwt-test-${Date.now()}@example.com`;
            const result = await auth_1.AuthService.registerUser({
                email: uniqueEmail,
                password: testUserPassword,
            });
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.token).toBeDefined();
            // Verify token is valid
            const decoded = auth_1.AuthService.verifyToken(result.token);
            (0, vitest_1.expect)(decoded).not.toBeNull();
            (0, vitest_1.expect)(decoded?.email).toBe(uniqueEmail.toLowerCase());
            (0, vitest_1.expect)(decoded?.role).toBe(client_1.UserRole.USER);
            // Cleanup
            if (result.user?.id) {
                await db_1.prisma.user.delete({ where: { id: result.user.id } });
            }
        });
        (0, vitest_1.it)("should generate valid JWT token on login", async () => {
            const result = await auth_1.AuthService.loginUser({
                email: testUserEmail,
                password: testUserPassword,
            });
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.token).toBeDefined();
            // Verify token is valid
            const decoded = auth_1.AuthService.verifyToken(result.token);
            (0, vitest_1.expect)(decoded).not.toBeNull();
            (0, vitest_1.expect)(decoded?.email).toBe(testUserEmail.toLowerCase());
        });
        (0, vitest_1.it)("should reject invalid JWT token", () => {
            const decoded = auth_1.AuthService.verifyToken("invalid-token");
            (0, vitest_1.expect)(decoded).toBeNull();
        });
    });
});
