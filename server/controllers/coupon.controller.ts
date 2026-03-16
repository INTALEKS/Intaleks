import { Request, Response } from "express";
import { CouponService } from "../services/coupon";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { redeemCouponSchema, createCouponSchema } from "../validation/couponValidation";

export class CouponController {
  /** POST /api/coupons/redeem */
  static async redeem(req: Request, res: Response): Promise<void> {
    const { error, value } = redeemCouponSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error.details[0].message } });
      return;
    }

    try {
      await CouponService.redeem(req.user!.id, value.code);
      res.status(200).json({ success: true, message: "Coupon redeemed successfully. You now have calculator access." });
    } catch (err) {
      CouponController.handleError(res, err);
    }
  }

  /** GET /api/admin/coupons */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const used = req.query.used === "true" ? true : req.query.used === "false" ? false : undefined;
      const coupons = await CouponService.findAll({ used });
      res.status(200).json({ success: true, data: coupons });
    } catch (err) {
      CouponController.handleError(res, err);
    }
  }

  /** POST /api/admin/coupons */
  static async create(req: Request, res: Response): Promise<void> {
    const { error, value } = createCouponSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error.details[0].message } });
      return;
    }

    try {
      const coupons = await CouponService.create({ ...value, createdBy: req.user!.id });
      res.status(201).json({ success: true, data: coupons });
    } catch (err) {
      CouponController.handleError(res, err);
    }
  }

  /** DELETE /api/admin/coupons/:id */
  static async remove(req: Request, res: Response): Promise<void> {
    try {
      await CouponService.delete(req.params.id);
      res.status(200).json({ success: true, message: "Coupon deleted" });
    } catch (err) {
      CouponController.handleError(res, err);
    }
  }

  /** POST /api/admin/users/:id/revoke-coupon */
  static async revokeAccess(req: Request, res: Response): Promise<void> {
    try {
      await CouponService.revokeAccess(req.params.id);
      res.status(200).json({ success: true, message: "Coupon access revoked" });
    } catch (err) {
      CouponController.handleError(res, err);
    }
  }

  private static handleError(res: Response, err: unknown): void {
    if (err instanceof NotFoundError) {
      res.status(404).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }
    if (err instanceof ValidationError || err instanceof ConflictError) {
      res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
      return;
    }
    console.error("Coupon controller error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
  }
}
