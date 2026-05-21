"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateAdminController = void 0;
const affiliateAdmin_1 = require("../services/affiliateAdmin");
class AffiliateAdminController {
    static async overview(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getOverview();
        return res.json({ success: true, data });
    }
    static async listApplications(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getApplications(req.query.status);
        return res.json({ success: true, data });
    }
    static async updateApplicationStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const data = await affiliateAdmin_1.AffiliateAdminService.updateApplicationStatus(id, status);
        return res.json({ success: true, data });
    }
    static async listAffiliates(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getAffiliates(req.query.search);
        return res.json({ success: true, data });
    }
    static async toggleAffiliateStatus(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.toggleAffiliateStatus(req.params.id);
        return res.json({ success: true, data });
    }
    static async listReferrals(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getReferrals(req.query.status, req.query.search);
        return res.json({ success: true, data });
    }
    static async listWithdrawals(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getWithdrawals(req.query.status);
        return res.json({ success: true, data });
    }
    static async markWithdrawalProcessed(req, res) {
        const { reference } = req.body;
        if (!reference || !String(reference).trim()) {
            return res.status(400).json({ success: false, message: "reference is required" });
        }
        const data = await affiliateAdmin_1.AffiliateAdminService.markWithdrawalProcessed(req.params.id, String(reference).trim());
        return res.json({ success: true, data });
    }
    static async getSettings(req, res) {
        const data = await affiliateAdmin_1.AffiliateAdminService.getProgramSettings();
        return res.json({ success: true, data });
    }
    static async updateSettings(req, res) {
        const { id } = req.params;
        const data = await affiliateAdmin_1.AffiliateAdminService.updateProgramSettings(id, req.body);
        return res.json({ success: true, data });
    }
}
exports.AffiliateAdminController = AffiliateAdminController;
