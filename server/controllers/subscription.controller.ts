import { Request, Response } from "express";
import { SubscriptionService } from "../services/subscription";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { createSubscriptionSchema, updateSubscriptionSchema } from "../validation/subscriptionValidation";

/**
 * Subscription Controller
 * Handles all HTTP request/response logic for subscription plan management endpoints
 * Requirements: 9.1-13.3
 */
export class SubscriptionController {
  /**
   * Get all subscription plans
   * GET /api/admin/subscriptions
   * Requirements: 9.1, 9.2
   */
  static async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await SubscriptionService.findAll();

      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving subscription plans",
        },
      });
    }
  }

  /**
   * Get a single subscription plan by ID
   * GET /api/admin/subscriptions/:id
   * Requirements: 9.1
   */
  static async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const plan = await SubscriptionService.findById(id);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Get plan by ID error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving the subscription plan",
        },
      });
    }
  }

  /**
   * Create a new subscription plan
   * POST /api/admin/subscriptions
   */
  static async createPlan(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createSubscriptionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid plan data",
            details,
          },
        });
        return;
      }

      const plan = await SubscriptionService.create(value);

      res.status(201).json({
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      console.error("Create plan error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while creating the subscription plan",
        },
      });
    }
  }

  /**
   * Update an existing subscription plan
   * PUT /api/admin/subscriptions/:id
   */
  static async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateSubscriptionSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details: Record<string, string[]> = {};
        error.details.forEach((detail) => {
          const field = detail.path.join(".");
          if (!details[field]) {
            details[field] = [];
          }
          details[field].push(detail.message);
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details,
          },
        });
        return;
      }

      const plan = await SubscriptionService.update(id, value);

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: plan,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      console.error("Update plan error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while updating the subscription plan",
        },
      });
    }
  }

  /**
   * Delete a subscription plan
   * DELETE /api/admin/subscriptions/:id
   */
  static async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await SubscriptionService.delete(id);

      res.status(200).json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        });
        return;
      }

      console.error("Delete plan error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while deleting the subscription plan",
        },
      });
    }
  }

  /**
   * Activate a subscription plan
   * PATCH /api/admin/subscriptions/:id/activate
   */
  static async activatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const plan = await SubscriptionService.activate(id);

      res.status(200).json({
        success: true,
        message: "Subscription plan activated successfully",
        data: plan,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Activate plan error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while activating the subscription plan",
        },
      });
    }
  }

  /**
   * Deactivate a subscription plan
   * PATCH /api/admin/subscriptions/:id/deactivate
   */
  static async deactivatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const plan = await SubscriptionService.deactivate(id);

      res.status(200).json({
        success: true,
        message: "Subscription plan deactivated successfully",
        data: plan,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
        return;
      }

      console.error("Deactivate plan error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while deactivating the subscription plan",
        },
      });
    }
  }

  /**
   * Get all active subscription plans (public endpoint)
   * GET /api/subscriptions/plans
   * Requirements: 5.1, 5.2, 5.3
   */
  static async getActivePlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await SubscriptionService.findActivePlans();

      // Return only required fields per Requirements 5.2
      const publicPlans = plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        billingPeriod: plan.billingPeriod,
        features: plan.features,
      }));

      res.status(200).json({
        success: true,
        data: publicPlans,
      });
    } catch (error) {
      console.error("Get active plans error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while retrieving subscription plans",
        },
      });
    }
  }
}
