"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralController = void 0;
const referral_service_1 = require("../services/referral.service");
const partner_service_1 = require("../services/partner.service");
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
                message: "Partner Program application submitted successfully!",
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
    static async getPartnerDashboard(req, res, next) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            const data = await partner_service_1.PartnerService.getDashboard(req.user.id);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    static async addPartnerMember(req, res, next) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            const member = await partner_service_1.PartnerService.addMember(req.user.id, req.body.email);
            return res.status(201).json({ success: true, data: member });
        }
        catch (error) {
            next(error);
        }
    }
    static async removePartnerMember(req, res, next) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            await partner_service_1.PartnerService.removeMember(req.user.id, req.params.memberId);
            return res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPartnerCheckout(req, res, next) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            const { planType, successUrl, cancelUrl } = req.body;
            if ((planType !== "PARTNER" && planType !== "PARTNER_UNLIMITED") || !successUrl || !cancelUrl) {
                return res.status(400).json({ success: false, message: "A Partner plan and return URLs are required" });
            }
            const data = await partner_service_1.PartnerService.createCheckout(req.user.id, planType, successUrl, cancelUrl);
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
            if (status !== "APPROVED" && status !== "REJECTED") {
                return res.status(400).json({ success: false, message: "Invalid status. Must be APPROVED or REJECTED" });
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
