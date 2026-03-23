#!/bin/bash

# Development Setup Script for Intaleks Server
# This script sets up Docker containers and initializes the database

set -e

echo "🚀 Starting Intaleks Development Setup..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your local development configuration"
    exit 1
fi

# Load environment variables from .env.local
export $(cat .env.local | grep -v '^#' | xargs)

echo "📦 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-thevaluer} > /dev/null 2>&1; do
    sleep 1
done

echo "✅ PostgreSQL is ready!"

echo "🔄 Running database migrations..."
DATABASE_URL="postgresql://${POSTGRES_USER:-thevaluer}:${POSTGRES_PASSWORD:-thevaluer_dev_password}@localhost:5433/${POSTGRES_DB:-thevaluer_dev}" npx prisma migrate deploy

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🌱 Seeding database with base multiples..."
DATABASE_URL="postgresql://${POSTGRES_USER:-thevaluer}:${POSTGRES_PASSWORD:-thevaluer_dev_password}@localhost:5433/${POSTGRES_DB:-thevaluer_dev}" npm run db:seed:base-multiples

echo "✅ Development environment is ready!"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env.local with your actual API keys (Stripe, R2, etc.)"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Run 'npm run db:studio' to open Prisma Studio"
echo ""
echo "🛠️  Useful commands:"
echo "  - docker-compose logs -f postgres  # View PostgreSQL logs"
echo "  - docker-compose down              # Stop containers"
echo "  - docker-compose down -v           # Stop and remove volumes"
