import { Request, Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { ReferralApplicationStatus } from "@prisma/client";
import { PartnerService } from "../services/partner.service";

export class ReferralController {
  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { professionalType, companyName, website } = req.body;
      const application = await ReferralService.submitApplication(userId, {
        professionalType,
        companyName,
        website,
      });

      return res.status(201).json({
        success: true,
        message: "Partner Program application submitted successfully!",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfileAndApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const data = await ReferralService.getProfileAndApplication(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getReferredClients(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const data = await ReferralService.getReferredClients(userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getPartnerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
      const data = await PartnerService.getDashboard(req.user.id);
      return res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async addPartnerMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
      const member = await PartnerService.addMember(req.user.id, req.body.email);
      return res.status(201).json({ success: true, data: member });
    } catch (error) { next(error); }
  }

  static async removePartnerMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
      await PartnerService.removeMember(req.user.id, req.params.memberId);
      return res.status(200).json({ success: true });
    } catch (error) { next(error); }
  }

  static async createPartnerCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
      const { planType, successUrl, cancelUrl } = req.body;
      if ((planType !== "PARTNER" && planType !== "PARTNER_UNLIMITED") || !successUrl || !cancelUrl) {
        return res.status(400).json({ success: false, message: "A Partner plan and return URLs are required" });
      }
      const data = await PartnerService.createCheckout(req.user.id, planType, successUrl, cancelUrl);
      return res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async acceptPartnerInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
      await PartnerService.acceptInvitation(req.user.id, req.body.token);
      return res.status(200).json({ success: true });
    } catch (error) { next(error); }
  }

  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as ReferralApplicationStatus | undefined;
      const data = await ReferralService.listApplications(status);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, feedback } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      if (status !== "APPROVED" && status !== "REJECTED") {
        return res.status(400).json({ success: false, message: "Invalid status. Must be APPROVED or REJECTED" });
      }

      const data = await ReferralService.updateApplicationStatus(id, status, feedback);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
