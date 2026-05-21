import { Request, Response } from "express";

import { AffiliateAdminService } from "../services/affiliateAdmin";

export class AffiliateAdminController {
  static async overview(req: Request, res: Response) {
    const data = await AffiliateAdminService.getOverview();
    return res.json({ success: true, data });
  }

  static async listApplications(req: Request, res: Response) {
    const data = await AffiliateAdminService.getApplications(req.query.status as string | undefined);
    return res.json({ success: true, data });
  }

  static async updateApplicationStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const data = await AffiliateAdminService.updateApplicationStatus(id, status);
    return res.json({ success: true, data });
  }

  static async listAffiliates(req: Request, res: Response) {
    const data = await AffiliateAdminService.getAffiliates(req.query.search as string | undefined);
    return res.json({ success: true, data });
  }

  static async toggleAffiliateStatus(req: Request, res: Response) {
    const data = await AffiliateAdminService.toggleAffiliateStatus(req.params.id);
    return res.json({ success: true, data });
  }

  static async listReferrals(req: Request, res: Response) {
    const data = await AffiliateAdminService.getReferrals(
      req.query.status as string | undefined,
      req.query.search as string | undefined
    );
    return res.json({ success: true, data });
  }

  static async listWithdrawals(req: Request, res: Response) {
    const data = await AffiliateAdminService.getWithdrawals(req.query.status as string | undefined);
    return res.json({ success: true, data });
  }

  static async markWithdrawalProcessed(req: Request, res: Response) {
    const { reference } = req.body;
    if (!reference || !String(reference).trim()) {
      return res.status(400).json({ success: false, message: "reference is required" });
    }
    const data = await AffiliateAdminService.markWithdrawalProcessed(req.params.id, String(reference).trim());
    return res.json({ success: true, data });
  }

  static async getSettings(req: Request, res: Response) {
    const data = await AffiliateAdminService.getProgramSettings();
    return res.json({ success: true, data });
  }

  static async updateSettings(req: Request, res: Response) {
    const { id } = req.params;
    const data = await AffiliateAdminService.updateProgramSettings(id, req.body);
    return res.json({ success: true, data });
  }
}
