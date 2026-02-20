import { Router, Request, Response } from "express";
import { manualSeedEssential } from "../scripts/manual-seed-essential";

const router = Router();

/**
 * Manual seed endpoint for testing
 * GET /api/manual-seed
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    await manualSeedEssential();
    res.json({ success: true, message: "Essential seeding completed" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
