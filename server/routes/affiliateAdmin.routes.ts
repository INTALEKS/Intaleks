import { Router } from "express";

import { AffiliateAdminController } from "../controllers/affiliateAdmin.controller";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/overview", AffiliateAdminController.overview);

router.get("/applications", AffiliateAdminController.listApplications);
router.patch("/applications/:id/status", AffiliateAdminController.updateApplicationStatus);

router.get("/affiliates", AffiliateAdminController.listAffiliates);
router.patch("/affiliates/:id/toggle-status", AffiliateAdminController.toggleAffiliateStatus);

router.get("/referrals", AffiliateAdminController.listReferrals);

router.get("/withdrawals", AffiliateAdminController.listWithdrawals);
router.patch("/withdrawals/:id/process", AffiliateAdminController.markWithdrawalProcessed);

router.get("/settings", AffiliateAdminController.getSettings);
router.put("/settings/:id", AffiliateAdminController.updateSettings);

export default router;
