"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const coupon_1 = require("../services/coupon");
const errors_1 = require("../errors");
const couponValidation_1 = require("../validation/couponValidation");
class CouponController {
    /** POST /api/coupons/redeem */
    static async redeem(req, res) {
        const { error, value } = couponValidation_1.redeemCouponSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error.details[0].message } });
            return;
        }
        try {
            await coupon_1.CouponService.redeem(req.user.id, value.code);
            res.status(200).json({ success: true, message: "Coupon redeemed successfully. You now have calculator access." });
        }
        catch (err) {
            CouponController.handleError(res, err);
        }
    }
    /** GET /api/admin/coupons */
    static async list(req, res) {
        try {
            const used = req.query.used === "true" ? true : req.query.used === "false" ? false : undefined;
            const coupons = await coupon_1.CouponService.findAll({ used });
            res.status(200).json({ success: true, data: coupons });
        }
        catch (err) {
            CouponController.handleError(res, err);
        }
    }
    /** POST /api/admin/coupons */
    static async create(req, res) {
        const { error, value } = couponValidation_1.createCouponSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error.details[0].message } });
            return;
        }
        try {
            const coupons = await coupon_1.CouponService.create({ ...value, createdBy: req.user.id });
            res.status(201).json({ success: true, data: coupons });
        }
        catch (err) {
            CouponController.handleError(res, err);
        }
    }
    /** DELETE /api/admin/coupons/:id */
    static async remove(req, res) {
        try {
            await coupon_1.CouponService.delete(req.params.id);
            res.status(200).json({ success: true, message: "Coupon deleted" });
        }
        catch (err) {
            CouponController.handleError(res, err);
        }
    }
    /** POST /api/admin/users/:id/revoke-coupon */
    static async revokeAccess(req, res) {
        try {
            await coupon_1.CouponService.revokeAccess(req.params.id);
            res.status(200).json({ success: true, message: "Coupon access revoked" });
        }
        catch (err) {
            CouponController.handleError(res, err);
        }
    }
    static handleError(res, err) {
        if (err instanceof errors_1.NotFoundError) {
            res.status(404).json({ success: false, error: { code: err.code, message: err.message } });
            return;
        }
        if (err instanceof errors_1.ValidationError || err instanceof errors_1.ConflictError) {
            res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
            return;
        }
        console.error("Coupon controller error:", err);
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
    }
}
exports.CouponController = CouponController;
