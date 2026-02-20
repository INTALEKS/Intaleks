#!/bin/bash

# Quick Update Script
# Run this to update your deployed application

set -e

echo "🔄 Updating application..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Pull latest code
echo -e "${BLUE}📥 Pulling latest code...${NC}"
git pull

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
pnpm db:generate

# Build application
echo -e "${BLUE}🔨 Building application...${NC}"
pnpm build

# Run migrations
echo -e "${BLUE}🗄️  Running migrations...${NC}"
pnpm db:migrate:prod

# Restart PM2
echo -e "${BLUE}🔄 Restarting application...${NC}"
pm2 restart backend

echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
pm2 status
