-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY', 'ONE_TIME');

-- AlterTable: Convert price from string to integer (cents)
-- First add new columns
ALTER TABLE "subscription_plans" ADD COLUMN "price_new" INTEGER DEFAULT 0;
ALTER TABLE "subscription_plans" ADD COLUMN "billing_period" "BillingPeriod" DEFAULT 'MONTHLY';

-- Convert existing string prices to cents (assuming format like "9.99" or "$9.99")
UPDATE "subscription_plans" 
SET "price_new" = CASE 
    WHEN "price" ~ '^[0-9]+\.?[0-9]*$' THEN ROUND(CAST("price" AS DECIMAL) * 100)::INTEGER
    WHEN "price" ~ '^\$?[0-9]+\.?[0-9]*' THEN ROUND(CAST(REGEXP_REPLACE("price", '[^0-9.]', '', 'g') AS DECIMAL) * 100)::INTEGER
    ELSE 0
END;

-- Drop old column and rename new one
ALTER TABLE "subscription_plans" DROP COLUMN "price";
ALTER TABLE "subscription_plans" RENAME COLUMN "price_new" TO "price";

-- Set NOT NULL and default
ALTER TABLE "subscription_plans" ALTER COLUMN "price" SET NOT NULL;
ALTER TABLE "subscription_plans" ALTER COLUMN "price" SET DEFAULT 0;
ALTER TABLE "subscription_plans" ALTER COLUMN "billing_period" SET NOT NULL;
