#!/bin/bash

# Railway Deployment Script
# This script helps deploy the server to Railway

set -e

echo "🚂 Railway Deployment Script"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📦 Install it with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "🔗 No Railway project linked. Initializing..."
    railway init
fi

echo "✅ Railway project linked"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs"
echo "3. Open dashboard: railway open"
echo "4. Set environment variables if not done:"
echo "   - JWT_SECRET"
echo "   - ENCRYPTION_KEY"
echo "   - FRONTEND_URL"
echo "   - ALLOWED_ORIGINS"
echo "   - STRIPE_SECRET_KEY (if using Stripe)"
echo "   - R2 credentials (if using R2 storage)"
echo ""
