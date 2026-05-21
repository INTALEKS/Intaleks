-- CreateEnum
CREATE TYPE "AffiliateApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AffiliateReferralStatus" AS ENUM ('CONVERTED', 'PENDING', 'LEAD');

-- CreateEnum
CREATE TYPE "AffiliateWithdrawalStatus" AS ENUM ('REQUESTED', 'PROCESSED');

-- CreateTable
CREATE TABLE "affiliate_applications" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "paypal" TEXT NOT NULL,
  "status" "AffiliateApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_profiles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "referrals" INTEGER NOT NULL DEFAULT 0,
  "converted" INTEGER NOT NULL DEFAULT 0,
  "earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" "AffiliateStatus" NOT NULL DEFAULT 'ACTIVE',
  "joined_at_label" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_referrals" (
  "id" TEXT NOT NULL,
  "affiliate_name" TEXT NOT NULL,
  "client_masked" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "conversion_date" TIMESTAMP(3) NOT NULL,
  "status" "AffiliateReferralStatus" NOT NULL DEFAULT 'LEAD',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_withdrawals" (
  "id" TEXT NOT NULL,
  "affiliate_name" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "method" TEXT NOT NULL,
  "payout_account" TEXT NOT NULL,
  "requested_at" TIMESTAMP(3) NOT NULL,
  "status" "AffiliateWithdrawalStatus" NOT NULL DEFAULT 'REQUESTED',
  "reference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_program_settings" (
  "id" TEXT NOT NULL,
  "commission_rate" INTEGER NOT NULL,
  "min_withdrawal" INTEGER NOT NULL,
  "holding_days" INTEGER NOT NULL,
  "attribution_days" INTEGER NOT NULL,
  "admin_email" TEXT NOT NULL,
  "notifications" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_program_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_profiles_user_id_key" ON "affiliate_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_profiles_code_key" ON "affiliate_profiles"("code");

-- AddForeignKey
ALTER TABLE "affiliate_profiles"
ADD CONSTRAINT "affiliate_profiles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
