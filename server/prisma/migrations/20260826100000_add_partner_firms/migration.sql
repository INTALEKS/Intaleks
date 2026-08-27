-- CreateEnum
CREATE TYPE "PartnerPlanType" AS ENUM ('PARTNER', 'PARTNER_UNLIMITED');

-- CreateEnum
CREATE TYPE "PartnerFirmStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PartnerMembershipRole" AS ENUM ('FIRM_ADMIN', 'ADVISER');

-- CreateTable
CREATE TABLE "partner_firms" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "professional_type" TEXT NOT NULL,
  "website" TEXT,
  "status" "PartnerFirmStatus" NOT NULL DEFAULT 'ONBOARDING',
  "plan_type" "PartnerPlanType",
  "access_starts_at" TIMESTAMP(3),
  "access_ends_at" TIMESTAMP(3),
  "valuation_limit" INTEGER,
  "valuations_used" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_memberships" (
  "id" TEXT NOT NULL,
  "firm_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" "PartnerMembershipRole" NOT NULL DEFAULT 'ADVISER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "partner_memberships_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "valuation_documents" ADD COLUMN "partner_firm_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "partner_memberships_firm_id_user_id_key" ON "partner_memberships"("firm_id", "user_id");
CREATE INDEX "partner_memberships_user_id_idx" ON "partner_memberships"("user_id");
CREATE INDEX "valuation_documents_partner_firm_id_idx" ON "valuation_documents"("partner_firm_id");

-- AddForeignKey
ALTER TABLE "partner_memberships" ADD CONSTRAINT "partner_memberships_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "partner_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_memberships" ADD CONSTRAINT "partner_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "valuation_documents" ADD CONSTRAINT "valuation_documents_partner_firm_id_fkey" FOREIGN KEY ("partner_firm_id") REFERENCES "partner_firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
