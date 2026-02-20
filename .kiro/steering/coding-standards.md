# Coding Standards

## TypeScript

- Use strict TypeScript with proper type annotations
- Prefer interfaces over type aliases for object shapes
- Avoid `any` - use `unknown` when type is truly unknown
- Use const assertions where appropriate

## React/Next.js (Client)

- Use functional components with hooks
- Prefer Server Components by default, use `'use client'` only when needed
- Use TanStack Query for server state management
- Follow the App Router conventions for routing and layouts

## Component Patterns

- Use Radix UI primitives via shadcn/ui components in `client/components/ui/`
- Keep components small and focused
- Extract reusable logic into custom hooks in `client/hooks/`
- Use `cn()` utility from `client/lib/utils` for conditional classes

## Express/Server

- Use async/await with proper error handling
- Validate request data using Joi schemas in `server/validation/`
- Keep controllers thin, business logic in `server/services/`
- Use Prisma for all database operations

## Error Handling

- Server: Use custom error classes from `server/errors/`
- Client: Handle errors gracefully with user-friendly messages
- Always log errors with appropriate context

## Testing

- Write tests using Vitest
- Test files go in `server/__tests__/`
- Use descriptive test names that explain the expected behavior
