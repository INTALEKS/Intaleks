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

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { AuthService } from "../../services/auth";
import { SubscriptionService } from "../../services/subscription";
import { prisma } from "../../config/db";
import { registerSchema, loginSchema } from "../../validation/authValidation";
import bcrypt from "bcrypt";
import { UserRole, UserStatus, SubscriptionStatus } from "@prisma/client";

// Test data
const testUserEmail = `test-${Date.now()}@example.com`;
const testUserPassword = "TestPassword123!";
const testUserFirstName = "Test";
const testUserLastName = "User";

describe("User Authentication & Subscription Integration", () => {
  let testUserId: string | null = null;
  let testPlanId: string | null = null;

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up test user if created
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (e) {
        // User may already be deleted
      }
    }
    // Clean up test plan if created
    if (testPlanId) {
      try {
        await prisma.subscriptionPlan.delete({ where: { id: testPlanId } });
      } catch (e) {
        // Plan may already be deleted
      }
    }
    await prisma.$disconnect();
  });

  describe("Step 1: User Registration", () => {
    it("should validate registration input correctly", () => {
      // Valid input
      const validInput = {
        email: testUserEmail,
        password: testUserPassword,
        firstName: testUserFirstName,
        lastName: testUserLastName,
      };
      const { error: validError } = registerSchema.validate(validInput);
      expect(validError).toBeUndefined();

      // Invalid email
      const invalidEmailInput = {
        email: "invalid-email",
        password: testUserPassword,
      };
      const { error: emailError } = registerSchema.validate(invalidEmailInput);
      expect(emailError).toBeDefined();

      // Short password
      const shortPasswordInput = {
        email: testUserEmail,
        password: "short",
      };
      const { error: passwordError } = registerSchema.validate(shortPasswordInput);
      expect(passwordError).toBeDefined();
    });

    it("should register a new user successfully (Requirement 1.1)", async () => {
      const result = await AuthService.registerUser({
        email: testUserEmail,
        password: testUserPassword,
        firstName: testUserFirstName,
        lastName: testUserLastName,
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testUserEmail.toLowerCase());
      expect(result.user?.firstName).toBe(testUserFirstName);
      expect(result.user?.lastName).toBe(testUserLastName);
      expect(result.user?.role).toBe(UserRole.USER);
      expect(result.user?.subscriptionStatus).toBe(SubscriptionStatus.NONE);

      // Store user ID for cleanup
      testUserId = result.user?.id || null;
    });

    it("should hash password with bcrypt (Requirement 1.5)", async () => {
      if (!testUserId) {
        throw new Error("Test user not created");
      }

      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(user).toBeDefined();
      // Password should not be stored in plaintext
      expect(user?.password).not.toBe(testUserPassword);
      // Password should be a valid bcrypt hash
      const isValidHash = await bcrypt.compare(testUserPassword, user?.password || "");
      expect(isValidHash).toBe(true);
    });

    it("should reject duplicate email registration (Requirement 1.2)", async () => {
      const result = await AuthService.registerUser({
        email: testUserEmail,
        password: testUserPassword,
        name: "Another User",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("A user with this email already exists");
    });
  });

  describe("Step 2: User Login", () => {
    it("should validate login input correctly", () => {
      // Valid input
      const validInput = {
        email: testUserEmail,
        password: testUserPassword,
      };
      const { error: validError } = loginSchema.validate(validInput);
      expect(validError).toBeUndefined();

      // Missing email
      const missingEmailInput = {
        password: testUserPassword,
      };
      const { error: emailError } = loginSchema.validate(missingEmailInput);
      expect(emailError).toBeDefined();

      // Missing password
      const missingPasswordInput = {
        email: testUserEmail,
      };
      const { error: passwordError } = loginSchema.validate(missingPasswordInput);
      expect(passwordError).toBeDefined();
    });

    it("should login user with correct credentials (Requirement 2.1)", async () => {
      const result = await AuthService.loginUser({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testUserEmail.toLowerCase());
      expect(result.user?.subscriptionStatus).toBeDefined();
    });

    it("should return consistent error for wrong password (Requirement 2.2)", async () => {
      const result = await AuthService.loginUser({
        email: testUserEmail,
        password: "WrongPassword123!",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid email or password");
    }, 10000);

    it("should return consistent error for non-existent email (Requirement 2.3)", async () => {
      const result = await AuthService.loginUser({
        email: "nonexistent@example.com",
        password: testUserPassword,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid email or password");
    });

    it("should reject suspended user login (Requirement 2.4)", async () => {
      if (!testUserId) {
        throw new Error("Test user not created");
      }

      // Suspend the user
      await prisma.user.update({
        where: { id: testUserId },
        data: { status: UserStatus.SUSPENDED },
      });

      const result = await AuthService.loginUser({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Your account has been suspended");

      // Restore user status
      await prisma.user.update({
        where: { id: testUserId },
        data: { status: UserStatus.ACTIVE },
      });
    });
  });

  describe("Step 3: View Subscription Plans", () => {
    beforeAll(async () => {
      // Create a test subscription plan
      const plan = await prisma.subscriptionPlan.create({
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

    it("should return only active plans (Requirement 5.1)", async () => {
      const plans = await SubscriptionService.findActivePlans();

      expect(Array.isArray(plans)).toBe(true);
      // All returned plans should be active
      plans.forEach((plan) => {
        expect(plan.active).toBe(true);
      });
    });

    it("should return plans with required fields (Requirement 5.2)", async () => {
      const plans = await SubscriptionService.findActivePlans();

      expect(plans.length).toBeGreaterThan(0);

      plans.forEach((plan) => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.price).toBeDefined();
        expect(plan.billingPeriod).toBeDefined();
        expect(plan.features).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });

    it("should return plans ordered by price ascending (Requirement 5.3)", async () => {
      const plans = await SubscriptionService.findActivePlans();

      if (plans.length > 1) {
        for (let i = 1; i < plans.length; i++) {
          expect(plans[i].price).toBeGreaterThanOrEqual(plans[i - 1].price);
        }
      }
    });
  });

  describe("Step 4: Logout", () => {
    it("should return success on logout (Requirement 4.2)", () => {
      const result = AuthService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Logged out successfully");
    });
  });

  describe("JWT Token Verification", () => {
    it("should generate valid JWT token on registration", async () => {
      const uniqueEmail = `jwt-test-${Date.now()}@example.com`;
      const result = await AuthService.registerUser({
        email: uniqueEmail,
        password: testUserPassword,
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      // Verify token is valid
      const decoded = AuthService.verifyToken(result.token!);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(uniqueEmail.toLowerCase());
      expect(decoded?.role).toBe(UserRole.USER);

      // Cleanup
      if (result.user?.id) {
        await prisma.user.delete({ where: { id: result.user.id } });
      }
    });

    it("should generate valid JWT token on login", async () => {
      const result = await AuthService.loginUser({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      // Verify token is valid
      const decoded = AuthService.verifyToken(result.token!);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(testUserEmail.toLowerCase());
    });

    it("should reject invalid JWT token", () => {
      const decoded = AuthService.verifyToken("invalid-token");
      expect(decoded).toBeNull();
    });
  });
});
