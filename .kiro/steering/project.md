# Project Overview

This is a full-stack TypeScript application with a Next.js client and Express server.

## Tech Stack

### Client (`/client`)

- Next.js 16 with App Router
- React 19
- TanStack Query for data fetching
- Radix UI components with shadcn/ui
- Tailwind CSS 4 for styling
- TypeScript

### Server (`/server`)

- Express.js REST API
- Prisma ORM with PostgreSQL
- JWT authentication with cookies
- Vitest for testing
- TypeScript

## Project Structure

- `client/` - Next.js frontend application
- `server/` - Express backend API
- `scripts/` - Deployment and setup scripts

## Development Commands

### Client

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint

### Server

- `pnpm dev` - Start with nodemon
- `pnpm build` - Compile TypeScript
- `pnpm test` - Run tests once
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:migrate` - Run migrations
