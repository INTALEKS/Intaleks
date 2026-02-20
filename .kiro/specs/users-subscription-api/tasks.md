# Implementation Plan

- [x] 1. Update database schema and generate Prisma client

  - [x] 1.1 Add UserStatus and PlanType enums to Prisma schema
    - Add `enum UserStatus { ACTIVE SUSPENDED }` and `enum PlanType { VISITOR MONTHLY ONE_OFF }`
    - _Requirements: 6.1, 6.2, 2.2_
  - [x] 1.2 Update User model with subscription fields
    - Add status, planType, subscriptionId, subscriptionDate fields to User model
    - Add relation to SubscriptionPlan
    - _Requirements: 3.1, 14.1, 14.3_
  - [x] 1.3 Create SubscriptionPlan model
    - Create model with id, name (unique), price, features (String[]), active, timestamps
    - Add relation to User
    - _Requirements: 9.1, 9.2, 10.1_
  - [x] 1.4 Create and run database migration
    - Run `prisma migrate dev` to create migration
    - _Requirements: All_

- [x] 2. Create validation schemas

  - [x] 2.1 Create user validation schemas
    - Create `server/validation/userValidation.ts` with schemas for create, update, filters
    - Include email format, required fields, enum validations
    - _Requirements: 4.3, 2.1, 2.2, 2.3_
  - [x] 2.2 Create subscription validation schemas
    - Create `server/validation/subscriptionValidation.ts` with schemas for create, update
    - Include name, price, features array validations
    - _Requirements: 10.3_

- [x] 3. Implement User Service

  - [x] 3.1 Create UserService class with findAll method
    - Implement pagination with default limit of 10
    - Implement date, planType, and status filters with AND logic
    - Return paginated response with metadata
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
  - [ ]\* 3.2 Write property tests for user listing and filtering
    - **Property 1: Pagination returns correct page size**
    - **Property 2: Pagination metadata consistency**
    - **Property 3: Date filter correctness**
    - **Property 4: Plan type filter correctness**
    - **Property 5: Status filter correctness**
    - **Property 6: Combined filters use AND logic**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4**
  - [x] 3.3 Implement findById method
    - Return complete user profile with subscription details
    - Throw NotFoundError for non-existent users
    - _Requirements: 3.1, 3.2_
  - [ ]\* 3.4 Write property tests for user retrieval
    - **Property 7: User retrieval completeness**
    - **Property 8: Non-existent resource returns 404**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 3.5 Implement create method
    - Hash password using bcrypt before storing
    - Check for duplicate email and throw ConflictError
    - Return created user
    - _Requirements: 4.1, 4.2, 4.4_
  - [ ]\* 3.6 Write property tests for user creation
    - **Property 9: User creation returns created user**
    - **Property 10: Duplicate email returns 409**
    - **Property 12: Password hashing on create and reset**
    - **Validates: Requirements 4.1, 4.2, 4.4**
  - [x] 3.7 Implement update method
    - Check for duplicate email on update
    - Throw NotFoundError for non-existent users
    - Return updated user
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]\* 3.8 Write property tests for user update
    - **Property 13: User update persistence**
    - **Validates: Requirements 5.1**
  - [x] 3.9 Implement suspend and reactivate methods
    - Set user status to SUSPENDED or ACTIVE
    - Throw NotFoundError for non-existent users
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ]\* 3.10 Write property tests for suspend/reactivate
    - **Property 14: Suspend sets status to SUSPENDED**
    - **Property 15: Reactivate sets status to ACTIVE**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 3.11 Implement delete method
    - Remove user from database (cascade deletes related records via Prisma)
    - Throw NotFoundError for non-existent users
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]\* 3.12 Write property tests for user deletion
    - **Property 16: User deletion removes user**
    - **Property 17: Cascade deletion of related records**
    - **Validates: Requirements 7.1, 7.3**
  - [x] 3.13 Implement resetPassword method
    - Generate random temporary password
    - Hash and store new password
    - Return temporary password to admin
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]\* 3.14 Write property tests for password reset
    - **Property 18: Password reset returns temporary password**
    - **Validates: Requirements 8.1, 8.3**
  - [x] 3.15 Implement getStats method
    - Calculate total users, active users, subscribed users
    - Calculate percentage change from previous period
    - Support optional date range filtering
    - _Requirements: 15.1, 15.2, 15.3_
  - [ ]\* 3.16 Write property tests for statistics
    - **Property 29: Statistics returns required counts**
    - **Property 30: Statistics includes percentage change**
    - **Validates: Requirements 15.1, 15.2**
  - [x] 3.17 Implement assignSubscription method
    - Update user's subscriptionId, planType, and subscriptionDate
    - Throw NotFoundError for non-existent user or plan
    - _Requirements: 14.1, 14.2, 14.3_
  - [ ]\* 3.18 Write property tests for subscription assignment
    - **Property 27: Plan assignment updates user subscription**
    - **Property 28: Plan assignment records subscription date**
    - **Validates: Requirements 14.1, 14.3**

- [x] 4. Checkpoint - Ensure all User Service tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Subscription Service

  - [x] 5.1 Create SubscriptionService class with findAll method
    - Return all plans with id, name, price, features, active status
    - _Requirements: 9.1, 9.2_
  - [ ]\* 5.2 Write property tests for plan listing
    - **Property 19: Plan list returns all plans with required fields**
    - **Validates: Requirements 9.1, 9.2**
  - [x] 5.3 Implement findById method
    - Return plan details
    - Throw NotFoundError for non-existent plans
    - _Requirements: 9.1_
  - [x] 5.4 Implement create method
    - Check for duplicate name and throw ConflictError
    - Return created plan
    - _Requirements: 10.1, 10.2_
  - [ ]\* 5.5 Write property tests for plan creation
    - **Property 20: Plan creation returns created plan**
    - **Property 21: Duplicate plan name returns 409**
    - **Validates: Requirements 10.1, 10.2**
  - [x] 5.6 Implement update method
    - Check for duplicate name on update
    - Throw NotFoundError for non-existent plans
    - Return updated plan
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ]\* 5.7 Write property tests for plan update
    - **Property 22: Plan update persistence**
    - **Validates: Requirements 11.1**
  - [x] 5.8 Implement activate and deactivate methods
    - Set plan active status to true or false
    - Throw NotFoundError for non-existent plans
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ]\* 5.9 Write property tests for activate/deactivate
    - **Property 23: Activate sets active to true**
    - **Property 24: Deactivate sets active to false**
    - **Validates: Requirements 12.1, 12.2**
  - [x] 5.10 Implement delete method
    - Check for subscribed users and throw ConflictError if any exist
    - Remove plan from database
    - Throw NotFoundError for non-existent plans
    - _Requirements: 13.1, 13.2, 13.3_
  - [ ]\* 5.11 Write property tests for plan deletion
    - **Property 25: Plan deletion removes plan**
    - **Property 26: Delete plan with subscribers returns 409**
    - **Validates: Requirements 13.1, 13.3**

- [x] 6. Checkpoint - Ensure all Subscription Service tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement User Controller

  - [x] 7.1 Create UserController class with all endpoint handlers
    - Implement getUsers, getUserById, createUser, updateUser, deleteUser
    - Implement suspendUser, reactivateUser, resetPassword, getUserStats
    - Implement assignSubscription
    - Use Joi validation and return consistent API responses
    - _Requirements: 1.1-8.4, 14.1-14.3, 15.1-15.3_
  - [ ]\* 7.2 Write unit tests for UserController
    - Test validation error responses
    - Test success responses format
    - _Requirements: 4.3, 10.3_

- [x] 8. Implement Subscription Controller

  - [x] 8.1 Create SubscriptionController class with all endpoint handlers
    - Implement getPlans, getPlanById, createPlan, updatePlan, deletePlan
    - Implement activatePlan, deactivatePlan
    - Use Joi validation and return consistent API responses
    - _Requirements: 9.1-13.3_
  - [ ]\* 8.2 Write unit tests for SubscriptionController
    - Test validation error responses
    - Test success responses format

- [x] 9. Create API Routes

  - [x] 9.1 Create user routes file
    - Create `server/routes/user.routes.ts`
    - Define all user management routes with auth middleware
    - _Requirements: All user requirements_
  - [x] 9.2 Create subscription routes file
    - Create `server/routes/subscription.routes.ts`
    - Define all subscription plan routes with auth middleware
    - _Requirements: All subscription requirements_
  - [x] 9.3 Register routes in main server file
    - Add user and subscription routes to `server/index.ts`
    - _Requirements: All_

- [x] 10. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Write property test for validation errors

  - [x]\* 11.1 Write property test for invalid data validation
    - **Property 11: Invalid data returns 400 with details**
    - **Validates: Requirements 4.3, 10.3**

- [x] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
