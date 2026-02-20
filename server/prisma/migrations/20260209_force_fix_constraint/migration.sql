-- Force fix the constraint issue in production
-- This migration ensures the correct unique constraint exists

-- First, clear all existing data to avoid conflicts
TRUNCATE TABLE "valuation_multiples" CASCADE;

-- Drop any existing constraints
ALTER TABLE "valuation_multiples" 
DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_key";

ALTER TABLE "valuation_multiples" 
DROP CONSTRAINT IF EXISTS "valuation_multiples_country_industry_score_range_key";

-- Add the correct unique constraint
ALTER TABLE "valuation_multiples" 
ADD CONSTRAINT "valuation_multiples_country_industry_score_range_key" 
UNIQUE ("country", "industry", "score_range");