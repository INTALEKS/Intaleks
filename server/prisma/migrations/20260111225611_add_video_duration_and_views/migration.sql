/*
  Warnings:

  - You are about to drop the `inquiries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inquiry_replies` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `forum_reactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "inquiry_replies" DROP CONSTRAINT "inquiry_replies_inquiry_id_fkey";

-- AlterTable
ALTER TABLE "forum_reactions" DROP COLUMN "type",
ADD COLUMN     "type" "ReactionType" NOT NULL;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "inquiries";

-- DropTable
DROP TABLE "inquiry_replies";
