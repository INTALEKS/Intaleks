#!/bin/bash

# Intaleks Development Environment Setup Script
# This script initializes the complete Docker-based development environment

set -e

echo "🚀 Intaleks Development Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please update it with your configuration.${NC}"
fi

# Check if server/.env exists
if [ ! -f server/.env ]; then
    echo -e "${YELLOW}📝 Creating server/.env file...${NC}"
    cat > server/.env << 'EOF'
# Database
DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev"

# JWT
JWT_SECRET="dev_jwt_secret_change_in_production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5001
NODE_ENV="development"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Optional)
EMAIL_USER=""
EMAIL_PASSWORD=""
ADMIN_NOTIFICATION_EMAIL="admin@intaleks.com"

# Stripe (Optional)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
EOF
    echo -e "${GREEN}✅ server/.env file created${NC}"
fi

# Check if client/.env exists
if [ ! -f client/.env.local ]; then
    echo -e "${YELLOW}📝 Creating client/.env.local file...${NC}"
    cat > client/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5001
EOF
    echo -e "${GREEN}✅ client/.env.local file created${NC}"
fi

echo ""
echo -e "${YELLOW}🐳 Building Docker images...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}🚀 Starting Docker containers...${NC}"
docker-compose up -d postgres redis

echo ""
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
until docker-compose exec -T postgres pg_isready -U intaleks > /dev/null 2>&1; do
    printf "."
    sleep 1
done
echo ""
echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"

echo ""
echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    printf "."
    sleep 1
done
echo ""
echo -e "${GREEN}✅ Redis is ready!${NC}"

echo ""
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
cd server && DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev" pnpm prisma migrate deploy && cd ..

echo ""
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
cd server && pnpm prisma generate && cd ..

echo ""
echo -e "${YELLOW}🌱 Seeding database...${NC}"
cd server && DATABASE_URL="postgresql://intaleks:intaleks_dev_2024@localhost:5433/intaleks_dev" pnpm run db:seed:all && cd ..

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"

echo ""
echo -e "${YELLOW}🚀 Starting application services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Intaleks Development Environment Ready!"
echo "==========================================${NC}"
echo ""
echo "📝 Services:"
echo "  🌐 Client:    http://localhost:3000"
echo "  🔧 Server:    http://localhost:5001"
echo "  🗄️  PostgreSQL: localhost:5433"
echo "  🔴 Redis:     localhost:6379"
echo ""
echo "🛠️  Useful Commands:"
echo "  docker-compose logs -f              # View all logs"
echo "  docker-compose logs -f server       # View server logs"
echo "  docker-compose logs -f client       # View client logs"
echo "  docker-compose ps                   # View running containers"
echo "  docker-compose down                 # Stop all services"
echo "  docker-compose down -v              # Stop and remove volumes"
echo "  docker-compose restart server       # Restart server"
echo ""
echo "  cd server && pnpm db:studio         # Open Prisma Studio"
echo "  cd server && pnpm create-admin      # Create admin user"
echo ""
echo -e "${YELLOW}⚠️  Note: Update .env files with your API keys before using external services${NC}"
echo ""
