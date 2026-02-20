#!/bin/bash
set -e

echo "🔧 Installing dependencies with npm..."
npm ci || npm install

echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"