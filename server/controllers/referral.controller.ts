import { Request, Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { ReferralApplicationStatus } from "@prisma/client";

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
        message: "Application submitted successfully!",
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

      const data = await ReferralService.updateApplicationStatus(id, status, feedback);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
