---
inclusion: fileMatch
fileMatchPattern: "client/**/*.{ts,tsx}"
---

# Client Development Patterns

## Data Fetching

Use TanStack Query for all API calls:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["resource", id],
  queryFn: () => fetchResource(id),
});
```

## API Client

- Define API functions in `client/lib/`
- Use fetch with proper error handling
- Include credentials for cookie-based auth

## Components

- UI primitives: `client/components/ui/`
- Feature components: `client/components/`
- Use composition over prop drilling

## Styling

- Use Tailwind CSS utility classes
- Use `cn()` for conditional classes
- Follow mobile-first responsive design

## Forms

- Use controlled components
- Validate on submit
- Show loading states during submission
- Display errors clearly to users

## State Management

- Server state: TanStack Query
- UI state: React useState/useReducer
- Avoid unnecessary global state
