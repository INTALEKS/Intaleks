"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCouponRouter = exports.couponRouter = void 0;
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
/**
 * User-facing coupon routes (authenticated users)
 */
exports.couponRouter = (0, express_1.Router)();
exports.couponRouter.use(authMiddleware_1.authenticateToken);
exports.couponRouter.post("/redeem", coupon_controller_1.CouponController.redeem);
/**
 * Admin coupon management routes (Super Admin only)
 */
exports.adminCouponRouter = (0, express_1.Router)();
exports.adminCouponRouter.use(authMiddleware_1.authenticateToken);
exports.adminCouponRouter.use(authMiddleware_1.requireSuperAdmin);
exports.adminCouponRouter.get("/", coupon_controller_1.CouponController.list);
exports.adminCouponRouter.post("/", coupon_controller_1.CouponController.create);
exports.adminCouponRouter.delete("/:id", coupon_controller_1.CouponController.remove);
exports.adminCouponRouter.post("/users/:id/revoke-coupon", coupon_controller_1.CouponController.revokeAccess);
exports.default = exports.couponRouter;
