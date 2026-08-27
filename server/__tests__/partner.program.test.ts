import { describe, expect, it } from "vitest";
import { partnerPlanDetails } from "../services/partner.service";

describe("Partner Program rules", () => {
  it("limits the Partner plan to five valuations", () => {
    expect(partnerPlanDetails.PARTNER.valuationLimit).toBe(5);
  });

  it("does not cap Partner Unlimited", () => {
    expect(partnerPlanDetails.PARTNER_UNLIMITED.valuationLimit).toBeNull();
  });
});
