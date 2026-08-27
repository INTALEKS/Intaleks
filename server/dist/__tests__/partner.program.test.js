"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const partner_service_1 = require("../services/partner.service");
(0, vitest_1.describe)("Partner Program rules", () => {
    (0, vitest_1.it)("limits the Partner plan to five valuations", () => {
        (0, vitest_1.expect)(partner_service_1.partnerPlanDetails.PARTNER.valuationLimit).toBe(5);
    });
    (0, vitest_1.it)("does not cap Partner Unlimited", () => {
        (0, vitest_1.expect)(partner_service_1.partnerPlanDetails.PARTNER_UNLIMITED.valuationLimit).toBeNull();
    });
});
