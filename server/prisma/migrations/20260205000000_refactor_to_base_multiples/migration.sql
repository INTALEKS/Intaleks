-- Drop the ValuationMultipleRange table as we no longer need ranges
DROP TABLE IF EXISTS "valuation_multiple_ranges";

-- Add 'other' industry option to existing multiples if not present
-- This migration will be followed by a seed script to populate the new structure

-- No changes needed to ValuationMultiple table structure
-- It already has country, industry, and multiple fields
-- We'll just use 'multiple' as the base multiple

-- Update QuestionnaireResponse to store override multiple
ALTER TABLE "questionnaire_responses" 
ADD COLUMN IF NOT EXISTS "override_multiple" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "base_multiple" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "score_factor" DOUBLE PRECISION;

-- Add comment to clarify the new structure
COMMENT ON COLUMN "questionnaire_responses"."calculated_multiple" IS 'Final multiple = base_multiple * score_factor (or override_multiple if set)';
COMMENT ON COLUMN "questionnaire_responses"."override_multiple" IS 'User-provided override multiple (optional)';
COMMENT ON COLUMN "questionnaire_responses"."base_multiple" IS 'Base multiple from valuation_multiples table';
COMMENT ON COLUMN "questionnaire_responses"."score_factor" IS 'Score-based adjustment factor (1.0, 0.8, or 0.5)';
