ALTER TABLE "users"
  ADD COLUMN "retail_valuation_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "retail_valuation_credits" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "retail_valuation_document_id" TEXT;

ALTER TABLE "subscription_plans"
  ADD COLUMN "valuation_limit" INTEGER;

ALTER TABLE "valuation_documents"
  ADD COLUMN "input_data" JSONB;

-- Mark the currently active AUD $495 one-time retail plan. Historical users
-- keep retail_valuation_enabled=false and therefore retain their existing access.
UPDATE "subscription_plans"
SET "valuation_limit" = 1
WHERE "active" = true
  AND "billing_period" = 'ONE_TIME'
  AND "price" = 49500;
