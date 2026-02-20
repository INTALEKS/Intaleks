# Implementation Plan: Stripe Payment Gateway

## Overview

This implementation plan breaks down the Stripe payment gateway integration into discrete, incremental tasks. Each task builds on previous work, ensuring no orphaned code. The implementation uses TypeScript for both server (Express) and client (Next.js) components.

## Tasks

- [x] 1. Set up Stripe SDK and environment configuration

  - Install Stripe Node.js SDK
  - Add Stripe environment variables to server config
  - Create Stripe client singleton
  - _Requirements: 9.4_

- [x] 2. Extend database schema for payment tracking

  - [x] 2.1 Add Stripe fields to User model
    - Add stripeCustomerId, stripeSubscriptionId, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd fields
    - Create SubscriptionStatus enum
    - _Requirements: 1.1, 4.1_
  - [x] 2.2 Add Stripe fields to SubscriptionPlan model
    - Add stripeProductId and stripePriceId fields
    - _Requirements: 8.3_
  - [x] 2.3 Create Payment model
    - Define Payment table with amount, status, stripePaymentId, stripeInvoiceId
    - Create PaymentStatus enum
    - _Requirements: 5.1, 5.3_
  - [x] 2.4 Create AdminAction model for audit logging
    - Define AdminAction table with adminId, targetUserId, action, details
    - _Requirements: 7.5_
  - [x] 2.5 Run database migration
    - Generate and apply Prisma migration
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Implement Stripe customer management

  - [x] 3.1 Create payment service with getOrCreateStripeCustomer
    - Implement customer lookup by stripeCustomerId
    - Create new Stripe customer if not exists
    - Store customer ID in user record
    - Sync email with Stripe customer
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]\* 3.2 Write property test for customer ID idempotency
    - **Property 1: Customer ID Idempotency**
    - **Validates: Requirements 1.1, 1.2**

- [x] 4. Implement checkout session creation

  - [x] 4.1 Add createCheckoutSession to payment service
    - Create checkout session with correct mode based on billing period
    - Include userId and planId in metadata
    - Set success and cancel URLs
    - Return session URL
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]\* 4.2 Write property test for checkout mode selection
    - **Property 4: Checkout Mode Selection**
    - **Validates: Requirements 2.3, 2.4**
  - [ ]\* 4.3 Write property test for checkout metadata correctness
    - **Property 3: Checkout Session Metadata Correctness**
    - **Validates: Requirements 2.1, 2.2**

- [x] 5. Implement webhook handler

  - [x] 5.1 Create webhook validation and event parsing
    - Verify webhook signature using Stripe signing secret
    - Parse event payload
    - Return 400 for invalid signatures
    - _Requirements: 3.1, 3.6_
  - [x] 5.2 Implement checkout.session.completed handler
    - Extract userId and planId from metadata
    - Update user subscription status to active
    - Create payment record
    - _Requirements: 3.2, 4.2_
  - [x] 5.3 Implement invoice.payment_succeeded handler
    - Update subscription period end date
    - Create payment record for renewal
    - _Requirements: 3.3_
  - [x] 5.4 Implement invoice.payment_failed handler
    - Update subscription status to past_due
    - _Requirements: 3.4, 4.3_
  - [x] 5.5 Implement customer.subscription.deleted handler
    - Update subscription status to canceled
    - Revoke access
    - _Requirements: 3.5, 4.4_
  - [x] 5.6 Add webhook idempotency using event ID tracking
    - Store processed event IDs
    - Skip duplicate events
    - _Requirements: 10.5_
  - [ ]\* 5.7 Write property test for webhook signature validation
    - **Property 5: Webhook Signature Validation**
    - **Validates: Requirements 3.1, 3.6**
  - [ ]\* 5.8 Write property test for webhook idempotency
    - **Property 15: Webhook Idempotency**
    - **Validates: Requirements 10.5**

- [x] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement subscription management

  - [x] 7.1 Add cancelSubscription to payment service
    - Cancel subscription at period end in Stripe
    - Update local record with cancelAtPeriodEnd flag
    - _Requirements: 6.1, 6.2_
  - [x] 7.2 Add getSubscriptionStatus to payment service
    - Return current status, period end, and cancel flag
    - _Requirements: 4.1, 4.5_
  - [x] 7.3 Implement access check based on subscription status
    - Grant access for active subscriptions
    - Grant access for canceled subscriptions until period end
    - _Requirements: 4.5, 6.3, 6.4_
  - [ ]\* 7.4 Write property test for cancellation preserves access
    - **Property 10: Cancellation Preserves Access Until Period End**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  - [ ]\* 7.5 Write property test for subscription status transitions
    - **Property 7: Subscription Status Transitions**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 8. Implement payment history

  - [x] 8.1 Add getPaymentHistory to payment service
    - Query payments for user
    - Order by createdAt descending
    - Include plan details
    - _Requirements: 5.1, 5.2_
  - [ ]\* 8.2 Write property test for payment history ordering
    - **Property 9: Payment History Ordering**
    - **Validates: Requirements 5.2**
  - [ ]\* 8.3 Write property test for payment record completeness
    - **Property 8: Payment Record Completeness**
    - **Validates: Requirements 5.1, 5.3**

- [x] 9. Implement payment controller and routes

  - [x] 9.1 Create payment controller with user endpoints
    - POST /api/payments/checkout - Create checkout session
    - GET /api/payments/history - Get payment history
    - GET /api/payments/subscription - Get subscription status
    - POST /api/payments/cancel - Cancel subscription
    - _Requirements: 2.1, 5.2, 6.1_
  - [x] 9.2 Create webhook endpoint
    - POST /api/webhooks/stripe - Handle Stripe webhooks
    - Use raw body parser for signature verification
    - _Requirements: 3.1, 3.7_
  - [x] 9.3 Add payment validation schemas
    - Validate checkout request body
    - _Requirements: 2.1_

- [x] 10. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Stripe product synchronization

  - [x] 11.1 Create Stripe sync service
    - Implement createProductAndPrice for new plans
    - Store Stripe product and price IDs
    - _Requirements: 8.1, 8.3_
  - [x] 11.2 Add price update handling
    - Create new Stripe price on price change
    - Archive old price
    - _Requirements: 8.2_
  - [x] 11.3 Add product archival on plan deactivation
    - Archive Stripe product when plan is deactivated
    - _Requirements: 8.4_
  - [x] 11.4 Integrate sync service with subscription service
    - Call sync on plan create/update/deactivate
    - Handle sync failures with rollback
    - _Requirements: 8.5_
  - [ ]\* 11.5 Write property test for Stripe product sync
    - **Property 13: Stripe Product Sync on Plan Creation**
    - **Validates: Requirements 8.1, 8.3**
  - [ ]\* 11.6 Write property test for Stripe price immutability
    - **Property 14: Stripe Price Immutability**
    - **Validates: Requirements 8.2**

- [x] 12. Implement admin payment management

  - [x] 12.1 Add admin payment endpoints
    - GET /api/admin/payments - List all payments with filtering
    - GET /api/admin/payments/stats - Get payment statistics
    - _Requirements: 7.1, 7.2_
  - [x] 12.2 Implement payment statistics service
    - Calculate total revenue
    - Count active subscriptions
    - Get recent transactions
    - _Requirements: 7.1_
  - [x] 12.3 Add manual subscription grant/revoke
    - POST /api/admin/users/:id/grant-subscription
    - POST /api/admin/users/:id/revoke-subscription
    - Log admin actions
    - _Requirements: 7.4, 7.5_
  - [ ]\* 12.4 Write property test for admin stats completeness
    - **Property 11: Admin Stats Completeness**
    - **Validates: Requirements 7.1**
  - [ ]\* 12.5 Write property test for admin action audit logging
    - **Property 12: Admin Action Audit Logging**
    - **Validates: Requirements 7.5**

- [x] 13. Implement error handling

  - [x] 13.1 Create Stripe error classes and handlers
    - Define StripeError class
    - Map Stripe error codes to user-friendly messages
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 13.2 Add webhook error logging
    - Log failed webhook processing for manual review
    - _Requirements: 10.4_

- [x] 14. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement client-side payment service

  - [x] 15.1 Create payment API service
    - Add createCheckout, getPaymentHistory, getSubscriptionStatus, cancelSubscription methods
    - _Requirements: 2.1, 5.2, 6.1_
  - [x] 15.2 Create usePayments hook
    - Wrap payment API with React Query
    - Handle loading and error states
    - _Requirements: 2.1, 5.2_

- [x] 16. Implement user payment UI components

  - [x] 16.1 Create checkout button component
    - Handle checkout session creation
    - Redirect to Stripe checkout
    - _Requirements: 2.5_
  - [x] 16.2 Create subscription status component
    - Display current subscription status
    - Show renewal/cancellation info
    - _Requirements: 4.5, 4.6_
  - [x] 16.3 Create payment history component
    - Display payments in table format
    - Format amounts as currency
    - _Requirements: 5.2, 5.4_
  - [x] 16.4 Create subscription cancellation component
    - Confirm cancellation dialog
    - Show access end date
    - _Requirements: 6.1_

- [x] 17. Implement admin payment UI components

  - [x] 17.1 Create admin payments page
    - Display payment list with filtering
    - Show payment statistics
    - _Requirements: 7.1, 7.2_
  - [x] 17.2 Add subscription management to user detail
    - Display user subscription status
    - Add grant/revoke buttons
    - _Requirements: 7.3, 7.4_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses Stripe's test mode for development
- Webhook testing requires Stripe CLI for local development
