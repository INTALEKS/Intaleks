import { Router } from "express";
import { ReferralController } from "../controllers/referral.controller";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/applications", ReferralController.listApplications);
router.patch("/applications/:id", ReferralController.updateApplicationStatus);

export default router;
