---
inclusion: fileMatch
fileMatchPattern: "**/{routes,controllers,services}/**/*.ts"
---

# API Development Patterns

## Route Structure

Routes are defined in `server/routes/` and should:

- Use Express Router
- Apply appropriate middleware (auth, validation)
- Delegate to controllers

## Controller Pattern

Controllers in `server/controllers/` should:

- Handle HTTP request/response
- Call service methods for business logic
- Return consistent response shapes

## Service Layer

Services in `server/services/` should:

- Contain business logic
- Interact with Prisma for database operations
- Be reusable across controllers

## Validation

- Define Joi schemas in `server/validation/`
- Validate request body, params, and query separately
- Return clear validation error messages

## Authentication

- JWT tokens stored in HTTP-only cookies
- Use auth middleware from `server/middleware/`
- Protect routes that require authentication

## Response Format

```typescript
// Success
res.json({ data: result });

// Error
res.status(code).json({ error: message });
```
