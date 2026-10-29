ALTER TABLE "valuation_documents"
  ADD COLUMN "retail_paid" BOOLEAN NOT NULL DEFAULT false;

-- Preserve access to the most recent retail valuation created before this
-- field existed. Future retail purchases are marked on each document.
UPDATE "valuation_documents" AS document
SET "retail_paid" = true
FROM "users" AS account
WHERE account."retail_valuation_enabled" = true
  AND account."retail_valuation_document_id" = document."id"
  AND account."id" = document."user_id";
