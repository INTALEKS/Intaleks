# Production Dockerfile for Railway deployment
# Updated: 2026-03-10 - Use pnpm for consistency
FROM node:22-alpine

WORKDIR /app

# Install system dependencies for Prisma and pnpm
RUN apk add --no-cache openssl && npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN pnpm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source code and assets
COPY . .

# Build TypeScript
RUN pnpm build

# Keep tsx for seed scripts in production
# Prune dev dependencies except tsx and prisma
RUN pnpm prune --prod && pnpm add tsx prisma

# Expose port
EXPOSE ${PORT:-4545}

# Start command - run migrations, generate client, seed data, then start server
CMD ["pnpm", "run", "start:prod:with-seed"]
