-- AlterTable: Add missing columns to forum_posts
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "attachments" JSONB DEFAULT '[]';
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "is_announcement" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add author_id to forum_replies if missing
ALTER TABLE "forum_replies" ADD COLUMN IF NOT EXISTS "author_id" TEXT;

-- AddForeignKey for forum_replies author (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_replies_author_id_fkey'
    ) THEN
        ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_author_id_fkey" 
        FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: forum_reactions (if not exists)
CREATE TABLE IF NOT EXISTS "forum_reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT,
    "reply_id" TEXT,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'forum_reactions_user_id_post_id_key'
    ) THEN
        CREATE UNIQUE INDEX "forum_reactions_user_id_post_id_key" ON "forum_reactions"("user_id", "post_id");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'forum_reactions_user_id_reply_id_key'
    ) THEN
        CREATE UNIQUE INDEX "forum_reactions_user_id_reply_id_key" ON "forum_reactions"("user_id", "reply_id");
    END IF;
END $$;

-- AddForeignKeys for forum_reactions (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_reactions_user_id_fkey'
    ) THEN
        ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_reactions_post_id_fkey'
    ) THEN
        ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_fkey" 
        FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_reactions_reply_id_fkey'
    ) THEN
        ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_reply_id_fkey" 
        FOREIGN KEY ("reply_id") REFERENCES "forum_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: contact_messages (if not exists)
CREATE TABLE IF NOT EXISTS "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Create ReactionType enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReactionType') THEN
        CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');
    END IF;
END $$;
