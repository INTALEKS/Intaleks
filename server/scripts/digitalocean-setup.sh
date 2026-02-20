#!/bin/bash

# DigitalOcean Server Setup Script
# Run this on your fresh Ubuntu droplet as root user

set -e

echo "🚀 Starting DigitalOcean server setup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${BLUE}📦 Installing essential packages...${NC}"
apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Node.js 20
echo -e "${BLUE}📦 Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
echo -e "${BLUE}📦 Installing pnpm...${NC}"
npm install -g pnpm pm2

# Install PostgreSQL
echo -e "${BLUE}🐘 Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create deploy user
echo -e "${BLUE}👤 Creating deploy user...${NC}"
if id "deploy" &>/dev/null; then
    echo "User 'deploy' already exists"
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
fi

# Setup firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Create app directory
echo -e "${BLUE}📁 Creating application directory...${NC}"
mkdir -p /var/www/backend
chown -R deploy:deploy /var/www/backend

echo -e "${GREEN}✅ Server setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: sudo -u deploy bash"
echo "2. Run the database setup script: bash /path/to/digitalocean-db-setup.sh"
echo "3. Clone your repository to /var/www/backend"
echo "4. Run the app deployment script"
