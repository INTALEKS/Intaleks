import { Router } from "express";
import { ReferralController } from "../controllers/referral.controller";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.post("/apply", ReferralController.submitApplication);
router.get("/profile", ReferralController.getProfileAndApplication);
router.get("/clients", ReferralController.getReferredClients);
router.get("/firm", ReferralController.getPartnerDashboard);
router.post("/firm/members", ReferralController.addPartnerMember);
router.delete("/firm/members/:memberId", ReferralController.removePartnerMember);
router.post("/firm/checkout", ReferralController.createPartnerCheckout);

export default router;
