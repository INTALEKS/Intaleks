-- Add score_range column to valuation_multiples table
ALTER TABLE "valuation_multiples" 
ADD COLUMN IF NOT EXISTS "score_range" TEXT NOT NULL DEFAULT '40-50';

-- Drop the old unique constraint if it exists
ALTER TABLE "valuation_multiples" 
DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_key";

-- Add new unique constraint with score_range
ALTER TABLE "valuation_multiples" 
DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_score_range_key";

ALTER TABLE "valuation_multiples" 
ADD CONSTRAINT "valuation_multiples_country_industry_score_range_key" 
UNIQUE ("country", "industry", "score_range");

-- Clear existing data as it needs to be reseeded with score ranges
TRUNCATE TABLE "valuation_multiples" CASCADE;
