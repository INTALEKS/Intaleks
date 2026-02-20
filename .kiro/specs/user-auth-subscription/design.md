# Design Document: User Authentication & Subscription

## Overview

This design document outlines the implementation of normal user authentication (login/signup) and Stripe subscription integration for the platform. The system will leverage the existing authentication infrastructure (JWT tokens, bcrypt hashing, HTTP-only cookies) while adding user-facing registration and login capabilities, along with seamless Stripe checkout integration for subscription plans.

## Architecture

The solution follows the existing layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  /auth/login    │  /auth/signup   │  Pricing Section (Home)     │
│  LoginPage      │  SignupPage     │  PricingSection + Checkout  │
└────────┬────────┴────────┬────────┴────────────┬────────────────┘
         │                 │                      │
         ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Client (services/api.ts)                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/auth/*  │  /api/subscriptions/*  │  /api/payments/*│
├─────────────────────────────────────────────────────────────────┤
│  AuthService          │  SubscriptionService   │  PaymentService │
└────────┬──────────────┴────────────┬───────────┴────────┬───────┘
         │                           │                     │
         ▼                           ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL/Prisma)                  │
│                    Stripe API                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Auth Routes (`/api/auth/*`)

New public routes for user authentication:

```typescript
// POST /api/auth/register - User registration
interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus;
  };
}

// POST /api/auth/login - User login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  };
}

// POST /api/auth/logout - User logout
interface LogoutResponse {
  success: boolean;
  message: string;
}

// GET /api/auth/me - Get current user profile
interface ProfileResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    subscription?: {
      id: string;
      name: string;
      features: string[];
    };
  };
}
```

#### 2. Public Subscription Routes (`/api/subscriptions/plans`)

```typescript
// GET /api/subscriptions/plans - List active plans (public)
interface PlansResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    price: number; // in cents
    billingPeriod: BillingPeriod;
    features: string[];
  }[];
}
```

#### 3. AuthService Extensions

Extend the existing `AuthService` with user registration and login:

```typescript
class AuthService {
  // Existing methods...

  static async registerUser(data: RegisterRequest): Promise<RegisterResponse>;
  static async loginUser(credentials: LoginCredentials): Promise<LoginResponse>;
  static async logout(): void;
}
```

### Frontend Components

#### 1. Auth Pages

```
client/app/auth/
├── login/
│   └── page.tsx          # Login page component
├── signup/
│   └── page.tsx          # Signup page component
└── layout.tsx            # Shared auth layout
```

#### 2. Auth Components

```typescript
// LoginForm component
interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

// SignupForm component
interface SignupFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}
```

#### 3. Auth Hooks

```typescript
// useAuth hook for authentication state
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// useAuthState hook (existing) - enhanced with subscription info
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscriptionStatus: SubscriptionStatus;
}
```

#### 4. Pricing Integration

Update the existing `PricingSection` component to:

- Fetch plans from the API
- Show checkout buttons for logged-in users
- Redirect to login for non-authenticated users
- Display current subscription status

## Data Models

The existing Prisma schema already supports the required data model. Key fields used:

```prisma
model User {
  id                   String             @id @default(cuid())
  email                String             @unique
  password             String
  name                 String?
  role                 UserRole           @default(USER)
  status               UserStatus         @default(ACTIVE)

  // Subscription fields
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?
  subscriptionStatus   SubscriptionStatus @default(NONE)
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  subscriptionId       String?
  subscription         SubscriptionPlan?  @relation(...)
}

model SubscriptionPlan {
  id            String        @id @default(cuid())
  name          String        @unique
  price         Int           // Price in cents
  billingPeriod BillingPeriod
  features      String[]
  active        Boolean       @default(true)
  stripePriceId String?       @unique
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Valid Registration Creates User with Correct Role

_For any_ valid registration input (valid email format, password ≥ 8 characters, optional name), registering the user SHALL create a new user record with role set to USER.

**Validates: Requirements 1.1**

### Property 2: Duplicate Email Registration Returns Conflict

_For any_ existing user email, attempting to register with the same email SHALL return a conflict error.

**Validates: Requirements 1.2**

### Property 3: Invalid Email Format Rejected

_For any_ string that is not a valid email format, registration SHALL return a validation error.

**Validates: Requirements 1.3**

### Property 4: Short Password Rejected

_For any_ password with length less than 8 characters, registration SHALL return a validation error.

**Validates: Requirements 1.4**

### Property 5: Password Storage Security

_For any_ successfully registered user, the stored password SHALL be a bcrypt hash (not plaintext) and SHALL NOT equal the original password.

**Validates: Requirements 1.5**

### Property 6: Successful Registration Response

_For any_ valid registration, the response SHALL include a JWT token, user profile data, AND set an HTTP-only cookie with the token.

**Validates: Requirements 1.6, 1.7**

### Property 7: Successful Login Response

_For any_ registered user with correct credentials, login SHALL return a JWT token, user profile with subscription status, AND set an HTTP-only cookie.

**Validates: Requirements 2.1, 2.5, 2.6**

### Property 8: Authentication Error Consistency

_For any_ login attempt with incorrect password OR non-existent email, the Auth_System SHALL return identical error responses (same message and status code).

**Validates: Requirements 2.2, 2.3**

### Property 9: Valid JWT Token Authentication

_For any_ request with a valid (non-expired) JWT token, the Auth_System SHALL authenticate the request and attach user data to the request context.

**Validates: Requirements 3.1**

### Property 10: Invalid JWT Token Rejection

_For any_ request with an invalid or malformed JWT token, the Auth_System SHALL return a 401 unauthorized error.

**Validates: Requirements 3.3**

### Property 11: Logout Clears Cookie

_For any_ logout request, the Auth_System SHALL clear the authentication cookie and return a success response.

**Validates: Requirements 3.5, 4.1, 4.2**

### Property 12: Active Plans Only in Public Listing

_For any_ set of subscription plans (active and inactive), the public plans endpoint SHALL return only plans where active=true.

**Validates: Requirements 5.1**

### Property 13: Plan Response Contains Required Fields

_For any_ plan returned by the public endpoint, the response SHALL include id, name, price, billingPeriod, and features.

**Validates: Requirements 5.2**

### Property 14: Plans Ordered by Price Ascending

_For any_ list of plans returned by the public endpoint, plans SHALL be ordered by price in ascending order.

**Validates: Requirements 5.3**

### Property 15: Checkout Session Creation

_For any_ authenticated user and valid plan ID, creating a checkout session SHALL return a session ID and valid Stripe checkout URL.

**Validates: Requirements 6.1, 6.2**

### Property 16: Unauthenticated Checkout Rejected

_For any_ checkout request without valid authentication, the system SHALL return a 401 unauthorized error.

**Validates: Requirements 6.6**

## Error Handling

### Registration Errors

| Error Condition      | HTTP Status | Error Code       | Message                                |
| -------------------- | ----------- | ---------------- | -------------------------------------- |
| Invalid email format | 400         | VALIDATION_ERROR | Please provide a valid email address   |
| Password too short   | 400         | VALIDATION_ERROR | Password must be at least 8 characters |
| Email already exists | 409         | CONFLICT         | A user with this email already exists  |
| Server error         | 500         | INTERNAL_ERROR   | An error occurred during registration  |

### Login Errors

| Error Condition     | HTTP Status | Error Code     | Message                         |
| ------------------- | ----------- | -------------- | ------------------------------- |
| Invalid credentials | 401         | UNAUTHORIZED   | Invalid email or password       |
| Account suspended   | 403         | FORBIDDEN      | Your account has been suspended |
| Server error        | 500         | INTERNAL_ERROR | An error occurred during login  |

### Session Errors

| Error Condition   | HTTP Status | Error Code   | Message                  |
| ----------------- | ----------- | ------------ | ------------------------ |
| No token provided | 401         | UNAUTHORIZED | Authentication required  |
| Invalid token     | 401         | UNAUTHORIZED | Invalid or expired token |
| Expired token     | 401         | UNAUTHORIZED | Invalid or expired token |

### Checkout Errors

| Error Condition     | HTTP Status | Error Code   | Message                             |
| ------------------- | ----------- | ------------ | ----------------------------------- |
| Not authenticated   | 401         | UNAUTHORIZED | Authentication required             |
| Plan not found      | 404         | NOT_FOUND    | Subscription plan not found         |
| Plan not configured | 400         | STRIPE_ERROR | Plan is not configured for payments |

## Testing Strategy

### Unit Tests

Unit tests will cover:

- Input validation functions (email format, password length)
- Password hashing and comparison
- JWT token generation and verification
- Response formatting

### Property-Based Tests

Property-based tests will use `fast-check` library to validate the correctness properties defined above. Each property test will:

- Run minimum 100 iterations
- Generate random valid/invalid inputs
- Verify the property holds for all generated inputs

**Test Configuration:**

- Framework: Vitest
- PBT Library: fast-check
- Minimum iterations: 100 per property

**Property Test Tags:** Each test will be tagged with: `Feature: user-auth-subscription, Property {N}: {property_text}`

### Integration Tests

Integration tests will cover:

- Full registration flow (API → Database)
- Full login flow (API → JWT → Cookie)
- Checkout session creation with Stripe
- Webhook handling for subscription updates

### Test File Structure

```
server/__tests__/
├── properties/
│   └── auth.properties.test.ts    # Property-based tests for auth
├── unit/
│   └── auth.unit.test.ts          # Unit tests for auth functions
└── integration/
    └── auth.integration.test.ts   # Integration tests for auth flow
```
