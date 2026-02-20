-- CreateTable
CREATE TABLE "valuation_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "valuation" DOUBLE PRECISION NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valuation_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "valuation_documents" ADD CONSTRAINT "valuation_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
