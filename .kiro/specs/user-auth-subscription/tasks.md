# Implementation Plan: User Authentication & Subscription

## Overview

This implementation plan covers the development of normal user authentication (login/signup) and Stripe subscription integration. The tasks are organized to build incrementally, starting with backend services, then API routes, followed by frontend components.

## Tasks

- [x] 1. Extend AuthService with User Registration and Login

  - [x] 1.1 Add registerUser method to AuthService
    - Implement email validation, password hashing with bcrypt
    - Create user with USER role and ACTIVE status
    - Generate JWT token and return user profile
    - _Requirements: 1.1, 1.5, 1.6_
  - [x] 1.2 Add loginUser method to AuthService
    - Validate credentials against database
    - Check user status (reject SUSPENDED users)
    - Return consistent error messages for security
    - Include subscription status in response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  - [x] 1.3 Add logout method to AuthService
    - Clear authentication cookie
    - _Requirements: 4.1, 4.2_
  - [ ]\* 1.4 Write property tests for registration validation
    - **Property 3: Invalid Email Format Rejected**
    - **Property 4: Short Password Rejected**
    - **Validates: Requirements 1.3, 1.4**
  - [ ]\* 1.5 Write property test for password security
    - **Property 5: Password Storage Security**
    - **Validates: Requirements 1.5**

- [x] 2. Create Auth Validation Schemas

  - [x] 2.1 Create registration validation schema
    - Email: required, valid format, lowercase, trimmed
    - Password: required, minimum 8 characters
    - Name: optional string
    - _Requirements: 1.3, 1.4_
  - [x] 2.2 Update login validation schema
    - Ensure consistent with existing admin login
    - _Requirements: 2.1_

- [x] 3. Create Public Auth Routes

  - [x] 3.1 Create auth routes file with public endpoints
    - POST /api/auth/register - User registration
    - POST /api/auth/login - User login
    - POST /api/auth/logout - User logout
    - GET /api/auth/me - Get current user profile (protected)
    - _Requirements: 1.1, 2.1, 3.4, 4.1_
  - [x] 3.2 Implement cookie setting for JWT tokens
    - Set HTTP-only, secure, sameSite cookies
    - _Requirements: 1.7, 2.5_
  - [ ]\* 3.3 Write property tests for auth response format
    - **Property 6: Successful Registration Response**
    - **Property 7: Successful Login Response**
    - **Validates: Requirements 1.6, 1.7, 2.1, 2.5, 2.6**
  - [ ]\* 3.4 Write property test for error consistency
    - **Property 8: Authentication Error Consistency**
    - **Validates: Requirements 2.2, 2.3**

- [x] 4. Create Public Subscription Plans Endpoint

  - [x] 4.1 Add findActivePlans method to SubscriptionService (if not exists)
    - Return only active plans
    - Order by price ascending
    - _Requirements: 5.1, 5.3_
  - [x] 4.2 Create public route GET /api/subscriptions/plans
    - No authentication required
    - Return plan id, name, price, billingPeriod, features
    - _Requirements: 5.1, 5.2_
  - [ ]\* 4.3 Write property tests for plans listing
    - **Property 12: Active Plans Only in Public Listing**
    - **Property 13: Plan Response Contains Required Fields**
    - **Property 14: Plans Ordered by Price Ascending**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 5. Checkpoint - Backend API Complete

  - Ensure all backend tests pass
  - Verify API endpoints work with manual testing
  - Ask the user if questions arise

- [x] 6. Create Frontend Auth Service

  - [x] 6.1 Add auth methods to ApiClient
    - register(email, password, name?)
    - login(email, password)
    - logout()
    - getProfile()
    - _Requirements: 1.1, 2.1, 3.4, 4.1_
  - [x] 6.2 Add subscription plans method to ApiClient
    - getPublicPlans() - fetch active plans
    - _Requirements: 5.1_

- [x] 7. Create Auth Hooks

  - [x] 7.1 Create useAuth hook
    - Manage authentication state
    - Provide login, register, logout functions
    - Handle loading and error states
    - _Requirements: 2.1, 3.1, 4.1_
  - [x] 7.2 Enhance useAuthState hook
    - Include subscription status
    - Auto-fetch profile on mount
    - _Requirements: 3.4_

- [x] 8. Create Auth Pages

  - [x] 8.1 Create auth layout component
    - Shared layout for login/signup pages
    - Redirect logged-in users to home
    - _Requirements: 7.7_
  - [x] 8.2 Create signup page at /auth/signup
    - Form with email, password, confirm password, name fields
    - Client-side validation
    - Display inline errors
    - Link to login page
    - _Requirements: 7.1, 7.3, 7.6_
  - [x] 8.3 Create login page at /auth/login
    - Form with email and password fields
    - Display authentication errors
    - Link to signup page
    - Redirect on success
    - _Requirements: 7.2, 7.4, 7.5, 7.6_

- [x] 9. Integrate Pricing with Auth

  - [x] 9.1 Update PricingSection to fetch plans from API
    - Use getPublicPlans() to fetch active plans
    - Display plan details dynamically
    - _Requirements: 8.1_
  - [x] 9.2 Add auth-aware checkout flow
    - Show checkout button for logged-in users
    - Redirect to login for non-authenticated users with return URL
    - Show current subscription status for subscribed users
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 10. Checkpoint - Frontend Complete

  - Ensure all pages render correctly
  - Test full registration → login → checkout flow
  - Ask the user if questions arise

- [x] 11. Wire Up Routes and Test Integration

  - [x] 11.1 Register auth routes in Express app
    - Mount /api/auth routes
    - Mount /api/subscriptions/plans route
    - _Requirements: 1.1, 2.1, 5.1_
  - [x] 11.2 Test end-to-end flow
    - Registration → Login → View Plans → Checkout
    - Verify cookies are set correctly
    - Verify subscription status updates after payment
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. Update Navbar with Auth State

  - [x] 12.1 Add auth-aware UI to Navbar
    - Use useAuthState hook to get authentication status
    - Show "Sign in" / "Sign up" buttons when not logged in
    - Show user name/email and logout button when logged in
    - Handle loading state while checking auth
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 13. Final Checkpoint
  - Ensure all tests pass
  - Verify complete user journey works
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The existing Stripe webhook handling will update subscription status after successful payments
