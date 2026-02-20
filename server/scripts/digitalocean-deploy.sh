#!/bin/bash

# Application Deployment Script
# Run this in your application directory as deploy user

set -e

echo "🚀 Deploying application..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Please create .env file with required variables"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
pnpm db:generate

# Build application
echo -e "${BLUE}🔨 Building application...${NC}"
pnpm build

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
pnpm db:migrate:prod

# Stop existing PM2 process if running
pm2 stop backend 2>/dev/null || true
pm2 delete backend 2>/dev/null || true

# Start application with PM2
echo -e "${BLUE}▶️  Starting application with PM2...${NC}"
pm2 start dist/index.js --name backend --time
pm2 save

# Setup PM2 startup
pm2 startup | tail -n 1 | sudo bash || true

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Application status:"
pm2 status
echo ""
echo "View logs: pm2 logs backend"
echo "Monitor: pm2 monit"
