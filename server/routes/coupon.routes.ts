import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { authenticateToken, requireSuperAdmin } from "../middleware/authMiddleware";

/**
 * User-facing coupon routes (authenticated users)
 */
export const couponRouter = Router();
couponRouter.use(authenticateToken);
couponRouter.post("/redeem", CouponController.redeem);

/**
 * Admin coupon management routes (Super Admin only)
 */
export const adminCouponRouter = Router();
adminCouponRouter.use(authenticateToken);
adminCouponRouter.use(requireSuperAdmin);
adminCouponRouter.get("/", CouponController.list);
adminCouponRouter.post("/", CouponController.create);
adminCouponRouter.delete("/:id", CouponController.remove);
adminCouponRouter.post("/users/:id/revoke-coupon", CouponController.revokeAccess);

export default couponRouter;
