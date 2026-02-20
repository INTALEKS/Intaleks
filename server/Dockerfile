# Production Dockerfile for Railway deployment
# Updated: 2026-02-08 - Run from server directory context
FROM node:22-alpine

WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci || npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and assets
COPY . .

# Build TypeScript
RUN npm run build

# Keep tsx for seed scripts in production
# Prune dev dependencies except tsx and prisma
RUN npm prune --omit=dev && npm install tsx prisma

# Expose port
EXPOSE ${PORT:-4545}

# Start command - run migrations, generate client, seed data, then start server
CMD ["npm", "run", "start:prod:with-seed"]
