"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralController = void 0;
const referral_service_1 = require("../services/referral.service");
class ReferralController {
    static async submitApplication(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { professionalType, companyName, website } = req.body;
            const application = await referral_service_1.ReferralService.submitApplication(userId, {
                professionalType,
                companyName,
                website,
            });
            return res.status(201).json({
                success: true,
                message: "Application submitted successfully!",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfileAndApplication(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const data = await referral_service_1.ReferralService.getProfileAndApplication(userId);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async getReferredClients(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const data = await referral_service_1.ReferralService.getReferredClients(userId);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async listApplications(req, res, next) {
        try {
            const status = req.query.status;
            const data = await referral_service_1.ReferralService.listApplications(status);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateApplicationStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, feedback } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, message: "Status is required" });
            }
            const data = await referral_service_1.ReferralService.updateApplicationStatus(id, status, feedback);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReferralController = ReferralController;
