"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createPasswordResetTable() {
    console.log("🔧 Creating password_reset_tokens table...\n");
    try {
        // Create the table using raw SQL
        await prisma.$executeRaw `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
        await prisma.$executeRaw `
      CREATE INDEX IF NOT EXISTS password_reset_tokens_email_idx ON password_reset_tokens(email);
    `;
        await prisma.$executeRaw `
      CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
    `;
        console.log("✅ Table created successfully!");
    }
    catch (error) {
        console.error("❌ Error creating table:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
createPasswordResetTable();
