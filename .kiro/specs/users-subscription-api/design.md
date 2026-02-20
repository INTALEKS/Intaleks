# Design Document: Users and Subscription Management API

## Overview

The Users and Subscription Management API provides a comprehensive backend system for administrators to manage user accounts and subscription plans. The API follows RESTful conventions and integrates with the existing Express.js server architecture, using Prisma ORM for database operations and Joi for request validation.

## Architecture

The system follows a layered architecture pattern consistent with the existing codebase:

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  (user.routes.ts, subscription.routes.ts)                   │
├─────────────────────────────────────────────────────────────┤
│                    Controller Layer                          │
│  (user.controller.ts, subscription.controller.ts)           │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                            │
│  (user.ts, subscription.ts)                                 │
├─────────────────────────────────────────────────────────────┤
│                   Validation Layer                           │
│  (userValidation.ts, subscriptionValidation.ts)             │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
│  (Prisma Client - PostgreSQL)                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### API Endpoints

#### User Management Endpoints

| Method | Endpoint                              | Description                            |
| ------ | ------------------------------------- | -------------------------------------- |
| GET    | `/api/admin/users`                    | List users with pagination and filters |
| GET    | `/api/admin/users/:id`                | Get user by ID                         |
| POST   | `/api/admin/users`                    | Create new user                        |
| PUT    | `/api/admin/users/:id`                | Update user                            |
| DELETE | `/api/admin/users/:id`                | Delete user                            |
| PATCH  | `/api/admin/users/:id/suspend`        | Suspend user                           |
| PATCH  | `/api/admin/users/:id/reactivate`     | Reactivate user                        |
| POST   | `/api/admin/users/:id/reset-password` | Reset user password                    |
| GET    | `/api/admin/users/stats`              | Get user statistics                    |

#### Subscription Plan Endpoints

| Method | Endpoint                                  | Description                 |
| ------ | ----------------------------------------- | --------------------------- |
| GET    | `/api/admin/subscriptions`                | List all subscription plans |
| GET    | `/api/admin/subscriptions/:id`            | Get plan by ID              |
| POST   | `/api/admin/subscriptions`                | Create new plan             |
| PUT    | `/api/admin/subscriptions/:id`            | Update plan                 |
| DELETE | `/api/admin/subscriptions/:id`            | Delete plan                 |
| PATCH  | `/api/admin/subscriptions/:id/activate`   | Activate plan               |
| PATCH  | `/api/admin/subscriptions/:id/deactivate` | Deactivate plan             |
| POST   | `/api/admin/users/:userId/subscription`   | Assign plan to user         |

### Controller Interfaces

```typescript
// UserController
class UserController {
  static getUsers(req: Request, res: Response): Promise<void>;
  static getUserById(req: Request, res: Response): Promise<void>;
  static createUser(req: Request, res: Response): Promise<void>;
  static updateUser(req: Request, res: Response): Promise<void>;
  static deleteUser(req: Request, res: Response): Promise<void>;
  static suspendUser(req: Request, res: Response): Promise<void>;
  static reactivateUser(req: Request, res: Response): Promise<void>;
  static resetPassword(req: Request, res: Response): Promise<void>;
  static getUserStats(req: Request, res: Response): Promise<void>;
  static assignSubscription(req: Request, res: Response): Promise<void>;
}

// SubscriptionController
class SubscriptionController {
  static getPlans(req: Request, res: Response): Promise<void>;
  static getPlanById(req: Request, res: Response): Promise<void>;
  static createPlan(req: Request, res: Response): Promise<void>;
  static updatePlan(req: Request, res: Response): Promise<void>;
  static deletePlan(req: Request, res: Response): Promise<void>;
  static activatePlan(req: Request, res: Response): Promise<void>;
  static deactivatePlan(req: Request, res: Response): Promise<void>;
}
```

### Service Interfaces

```typescript
// UserService
interface UserFilters {
  month?: number;
  day?: number;
  year?: number;
  planType?: PlanType;
  status?: UserStatus;
  page: number;
  limit: number;
}

interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  subscribedUsers: number;
  userChange: number;
  activeChange: number;
  subscribedChange: number;
}

class UserService {
  static findAll(filters: UserFilters): Promise<PaginatedUsers>;
  static findById(id: string): Promise<User>;
  static create(data: CreateUserInput): Promise<User>;
  static update(id: string, data: UpdateUserInput): Promise<User>;
  static delete(id: string): Promise<void>;
  static suspend(id: string): Promise<User>;
  static reactivate(id: string): Promise<User>;
  static resetPassword(id: string): Promise<{ user: User; temporaryPassword: string }>;
  static getStats(timeRange?: TimeRange): Promise<UserStats>;
  static assignSubscription(userId: string, planId: string): Promise<User>;
}

// SubscriptionService
class SubscriptionService {
  static findAll(): Promise<SubscriptionPlan[]>;
  static findById(id: string): Promise<SubscriptionPlan>;
  static create(data: CreatePlanInput): Promise<SubscriptionPlan>;
  static update(id: string, data: UpdatePlanInput): Promise<SubscriptionPlan>;
  static delete(id: string): Promise<void>;
  static activate(id: string): Promise<SubscriptionPlan>;
  static deactivate(id: string): Promise<SubscriptionPlan>;
}
```

## Data Models

### Database Schema Updates (Prisma)

```prisma
enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum PlanType {
  VISITOR
  MONTHLY
  ONE_OFF
}

model User {
  id                String             @id @default(cuid())
  email             String             @unique
  password          String
  name              String?
  role              UserRole           @default(USER)
  status            UserStatus         @default(ACTIVE)
  planType          PlanType?          @map("plan_type")
  subscriptionId    String?            @map("subscription_id")
  subscriptionDate  DateTime?          @map("subscription_date")
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  subscription      SubscriptionPlan?  @relation(fields: [subscriptionId], references: [id])
  eventParticipants EventParticipant[]
  forumPosts        ForumPost[]

  @@map("users")
}

model SubscriptionPlan {
  id        String   @id @default(cuid())
  name      String   @unique
  price     String
  features  String[]
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users     User[]

  @@map("subscription_plans")
}
```

### API Response Types

```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// User Response
interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  planType: "VISITOR" | "MONTHLY" | "ONE_OFF" | null;
  subscriptionDate: string | null;
  subscription: SubscriptionPlanResponse | null;
  createdAt: string;
  updatedAt: string;
}

// Subscription Plan Response
interface SubscriptionPlanResponse {
  id: string;
  name: string;
  price: string;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Based on the prework analysis, the following correctness properties have been identified. After reflection to eliminate redundancy, properties testing similar behaviors have been consolidated.

### Property 1: Pagination returns correct page size

_For any_ user list request without explicit limit parameter, the System SHALL return at most 10 users (the default page size). **Validates: Requirements 1.1**

### Property 2: Pagination metadata consistency

_For any_ paginated user list response, the totalPages value SHALL equal ceil(total / limit), and the current page SHALL match the requested page. **Validates: Requirements 1.2, 1.3**

### Property 3: Date filter correctness

_For any_ user list filtered by date criteria, all returned users SHALL have a subscription date matching the specified month, day, and/or year. **Validates: Requirements 2.1**

### Property 4: Plan type filter correctness

_For any_ user list filtered by plan type, all returned users SHALL have the specified plan type. **Validates: Requirements 2.2**

### Property 5: Status filter correctness

_For any_ user list filtered by status, all returned users SHALL have the specified status. **Validates: Requirements 2.3**

### Property 6: Combined filters use AND logic

_For any_ user list with multiple filters applied, all returned users SHALL satisfy ALL filter conditions simultaneously. **Validates: Requirements 2.4**

### Property 7: User retrieval completeness

_For any_ existing user ID, the System SHALL return a user object containing all required fields (id, email, name, role, status, planType, subscriptionDate, subscription). **Validates: Requirements 3.1**

### Property 8: Non-existent resource returns 404

_For any_ request targeting a non-existent user or plan ID, the System SHALL return a 404 status code. **Validates: Requirements 3.2, 5.2, 7.2, 8.4, 11.2, 13.2**

### Property 9: User creation returns created user

_For any_ valid user creation request, the System SHALL return the created user with all submitted fields persisted. **Validates: Requirements 4.1**

### Property 10: Duplicate email returns 409

_For any_ user creation or update request with an email that already exists for another user, the System SHALL return a 409 status code. **Validates: Requirements 4.2, 5.3**

### Property 11: Invalid data returns 400 with details

_For any_ request with invalid data (missing required fields, invalid format), the System SHALL return a 400 status code with validation details. **Validates: Requirements 4.3, 10.3**

### Property 12: Password hashing on create and reset

_For any_ user creation or password reset, the stored password SHALL differ from the input password (indicating hashing). **Validates: Requirements 4.4, 8.2**

### Property 13: User update persistence

_For any_ valid user update request, the System SHALL persist all provided fields and return the updated user. **Validates: Requirements 5.1**

### Property 14: Suspend sets status to SUSPENDED

_For any_ suspend request on an active user, the System SHALL set the user status to SUSPENDED. **Validates: Requirements 6.1**

### Property 15: Reactivate sets status to ACTIVE

_For any_ reactivate request on a suspended user, the System SHALL set the user status to ACTIVE. **Validates: Requirements 6.2**

### Property 16: User deletion removes user

_For any_ delete request on an existing user, the System SHALL remove the user such that subsequent retrieval returns 404. **Validates: Requirements 7.1**

### Property 17: Cascade deletion of related records

_For any_ user deletion, all related event participations and forum posts SHALL also be deleted. **Validates: Requirements 7.3**

### Property 18: Password reset returns temporary password

_For any_ password reset request, the System SHALL return a non-empty temporary password string. **Validates: Requirements 8.1, 8.3**

### Property 19: Plan list returns all plans with required fields

_For any_ plan list request, all returned plans SHALL contain id, name, price, features, and active fields. **Validates: Requirements 9.1, 9.2**

### Property 20: Plan creation returns created plan

_For any_ valid plan creation request, the System SHALL return the created plan with all submitted fields persisted. **Validates: Requirements 10.1**

### Property 21: Duplicate plan name returns 409

_For any_ plan creation or update request with a name that already exists for another plan, the System SHALL return a 409 status code. **Validates: Requirements 10.2, 11.3**

### Property 22: Plan update persistence

_For any_ valid plan update request, the System SHALL persist all provided fields and return the updated plan. **Validates: Requirements 11.1**

### Property 23: Activate sets active to true

_For any_ activate request on an inactive plan, the System SHALL set the plan active status to true. **Validates: Requirements 12.1**

### Property 24: Deactivate sets active to false

_For any_ deactivate request on an active plan, the System SHALL set the plan active status to false. **Validates: Requirements 12.2**

### Property 25: Plan deletion removes plan

_For any_ delete request on an existing plan with no subscribers, the System SHALL remove the plan. **Validates: Requirements 13.1**

### Property 26: Delete plan with subscribers returns 409

_For any_ delete request on a plan with subscribed users, the System SHALL return a 409 status code. **Validates: Requirements 13.3**

### Property 27: Plan assignment updates user subscription

_For any_ valid plan assignment, the System SHALL update the user's subscriptionId and planType to match the assigned plan. **Validates: Requirements 14.1**

### Property 28: Plan assignment records subscription date

_For any_ plan assignment, the System SHALL set the user's subscriptionDate to the current timestamp. **Validates: Requirements 14.3**

### Property 29: Statistics returns required counts

_For any_ statistics request, the System SHALL return totalUsers, activeUsers, and subscribedUsers as non-negative integers. **Validates: Requirements 15.1**

### Property 30: Statistics includes percentage change

_For any_ statistics response, the System SHALL include userChange, activeChange, and subscribedChange as percentage values. **Validates: Requirements 15.2**

## Error Handling

The API uses a consistent error response format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR";
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Error Codes

| Code             | HTTP Status | Description                                |
| ---------------- | ----------- | ------------------------------------------ |
| VALIDATION_ERROR | 400         | Invalid request data                       |
| NOT_FOUND        | 404         | Resource not found                         |
| CONFLICT         | 409         | Duplicate resource or constraint violation |
| INTERNAL_ERROR   | 500         | Unexpected server error                    |

### Custom Error Classes

```typescript
class NotFoundError extends Error {
  constructor(message: string);
}

class ValidationError extends Error {
  details: Record<string, string[]>;
  constructor(message: string, details?: Record<string, string[]>);
}

class ConflictError extends Error {
  constructor(message: string);
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

1. **Unit Tests**: Verify specific examples, edge cases, and error conditions
2. **Property-Based Tests**: Verify universal properties that should hold across all inputs

### Property-Based Testing Framework

The project will use **fast-check** for property-based testing in TypeScript/JavaScript. Each property-based test will:

- Run a minimum of 100 iterations
- Be tagged with a comment referencing the correctness property from the design document
- Use the format: `**Feature: users-subscription-api, Property {number}: {property_text}**`

### Test Categories

#### Unit Tests

- Validation schema tests (valid/invalid inputs)
- Service method tests with mocked database
- Controller response format tests
- Error handling tests

#### Property-Based Tests

- Pagination behavior (Properties 1-2)
- Filter correctness (Properties 3-6)
- CRUD operations (Properties 9, 13, 20, 22)
- Status transitions (Properties 14-15, 23-24)
- Constraint enforcement (Properties 10, 21, 26)
- Data integrity (Properties 12, 17, 28)

### Test File Structure

```
server/
├── __tests__/
│   ├── services/
│   │   ├── user.service.test.ts
│   │   └── subscription.service.test.ts
│   ├── controllers/
│   │   ├── user.controller.test.ts
│   │   └── subscription.controller.test.ts
│   └── properties/
│       ├── user.properties.test.ts
│       └── subscription.properties.test.ts
```
