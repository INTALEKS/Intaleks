"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manual_seed_essential_1 = require("../scripts/manual-seed-essential");
const router = (0, express_1.Router)();
/**
 * Manual seed endpoint for testing
 * GET /api/manual-seed
 */
router.get("/", async (req, res) => {
    try {
        await (0, manual_seed_essential_1.manualSeedEssential)();
        res.json({ success: true, message: "Essential seeding completed" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
