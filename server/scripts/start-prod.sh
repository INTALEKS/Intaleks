#!/bin/bash

# Production startup script with conditional seeding
set -e

echo "🚀 Starting production deployment..."

# Run migrations
echo "📦 Running database migrations..."
npm run db:migrate:prod

# Fix constraints
echo "🔧 Fixing database constraints..."
tsx scripts/fix-constraint.ts

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Conditional seeding
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database with valuation multiples..."
    npm run db:seed:all
    echo "✅ Database seeding completed"
else
    echo "⏭️ Skipping database seeding (SEED_DATABASE not set to true)"
fi

# Start the server
echo "🚀 Starting server..."
npm start