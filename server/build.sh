#!/bin/bash
set -e

echo "🔧 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "🗄️ Generating Prisma client..."
pnpm run db:generate

echo "🏗️ Building TypeScript..."
pnpm run build

echo "✅ Build completed successfully!"
