-- CreateTable
CREATE TABLE "valuation_multiple_ranges" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "min_score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "min_multiple" DOUBLE PRECISION NOT NULL,
    "max_multiple" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valuation_multiple_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_responses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "valuation_document_id" TEXT,
    "owner_dependence" INTEGER NOT NULL,
    "recurring_revenue" INTEGER NOT NULL,
    "customer_concentration" INTEGER NOT NULL,
    "management_depth" INTEGER NOT NULL,
    "growth_rate" INTEGER NOT NULL,
    "competitive_advantage" INTEGER NOT NULL,
    "revenue_diversification" INTEGER NOT NULL,
    "systems_scalability" INTEGER NOT NULL,
    "margin_stability" INTEGER NOT NULL,
    "external_risk" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "calculated_multiple" DOUBLE PRECISION NOT NULL,
    "multiple_category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "valuation_multiple_ranges_country_industry_min_score_max_score_key" ON "valuation_multiple_ranges"("country", "industry", "min_score", "max_score");

-- AddForeignKey
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
