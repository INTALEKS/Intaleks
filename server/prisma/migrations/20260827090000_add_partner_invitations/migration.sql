CREATE TABLE "partner_invitations" (
  "id" TEXT NOT NULL,
  "firm_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "partner_invitations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "partner_invitations_token_key" ON "partner_invitations"("token");
CREATE UNIQUE INDEX "partner_invitations_firm_id_email_key" ON "partner_invitations"("firm_id", "email");
ALTER TABLE "partner_invitations" ADD CONSTRAINT "partner_invitations_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "partner_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
