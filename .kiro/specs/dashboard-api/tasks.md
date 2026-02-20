# Implementation Plan

- [x] 1. Create validation schemas for dashboard endpoints

  - [x] 1.1 Create dashboardValidation.ts with time range and query schemas
    - Create `server/validation/dashboardValidation.ts`
    - Define `timeRangeSchema` for startDate/endDate validation
    - Define `dashboardQuerySchema` for combined endpoint parameters
    - Ensure date format validation and startDate <= endDate constraint
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]\* 1.2 Write property test for date range validation
    - **Property 11: Date Range Validation**
    - **Validates: Requirements 6.2, 6.4**

- [x] 2. Implement dashboard service with statistics calculation

  - [x] 2.1 Create dashboard service with getStats method
    - Create `server/services/dashboard.ts`
    - Implement `getStats()` to calculate total revenue, total users, active users
    - Calculate percentage changes comparing current to previous period
    - Include increase/decrease indicators for each metric
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]\* 2.2 Write property test for statistics response completeness
    - **Property 1: Statistics Response Completeness**
    - **Validates: Requirements 1.1, 1.3, 1.4**
  - [ ]\* 2.3 Write property test for revenue calculation
    - **Property 2: Revenue Calculation Correctness**
    - **Validates: Requirements 1.2**

- [x] 3. Implement user growth time-series functionality

  - [x] 3.1 Add getUserGrowth method to dashboard service
    - Implement time-series aggregation grouping users by month
    - Support optional time range filtering
    - Default to last 12 months when no range specified
    - Return labels and data arrays
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]\* 3.2 Write property test for user growth time-series structure
    - **Property 3: User Growth Time-Series Structure**
    - **Validates: Requirements 2.1, 2.4**
  - [ ]\* 3.3 Write property test for user growth date filtering
    - **Property 4: User Growth Date Filtering**
    - **Validates: Requirements 2.2**

- [x] 4. Implement plan popularity functionality

  - [x] 4.1 Add getPlanPopularity method to dashboard service
    - Aggregate user counts per subscription plan
    - Include plans with zero subscribers
    - Order results by subscriber count descending
    - Calculate percentage of total subscribers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]\* 4.2 Write property test for plan popularity aggregation
    - **Property 5: Plan Popularity Aggregation**
    - **Validates: Requirements 3.1, 3.2**
  - [ ]\* 4.3 Write property test for plan popularity ordering
    - **Property 6: Plan Popularity Ordering**
    - **Validates: Requirements 3.3**

- [x] 5. Implement inquiry trends functionality

  - [x] 5.1 Add getInquiryTrends method to dashboard service
    - Implement time-series aggregation grouping inquiries by month
    - Support optional time range filtering
    - Default to last 12 months when no range specified
    - Return labels and data arrays
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]\* 5.2 Write property test for inquiry trends time-series structure
    - **Property 7: Inquiry Trends Time-Series Structure**
    - **Validates: Requirements 4.1, 4.4**
  - [ ]\* 5.3 Write property test for inquiry trends date filtering
    - **Property 8: Inquiry Trends Date Filtering**
    - **Validates: Requirements 4.2**

- [x] 6. Implement combined dashboard endpoint

  - [x] 6.1 Add getDashboardData method to dashboard service
    - Execute all queries in parallel using Promise.allSettled
    - Return partial data with error indicators for failed sections
    - Apply time range to userGrowth and inquiryTrends
    - Structure response with clearly named sections
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]\* 6.2 Write property test for combined endpoint completeness
    - **Property 9: Combined Endpoint Completeness**
    - **Validates: Requirements 5.1, 5.3**
  - [ ]\* 6.3 Write property test for combined endpoint time range application
    - **Property 10: Combined Endpoint Time Range Application**
    - **Validates: Requirements 5.2**

- [x] 7. Create dashboard controller

  - [x] 7.1 Create dashboard controller with all endpoint handlers
    - Create `server/controllers/dashboard.controller.ts`
    - Implement `getStats`, `getUserGrowth`, `getPlanPopularity`, `getInquiryTrends`, `getDashboardData`
    - Apply validation schemas to request parameters
    - Handle errors following existing patterns
    - _Requirements: 1.5, 2.5, 4.5, 5.4_

- [x] 8. Create dashboard routes and integrate with server

  - [x] 8.1 Create dashboard routes file
    - Create `server/routes/dashboard.routes.ts`
    - Define routes for all dashboard endpoints
    - Apply authentication middleware
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  - [x] 8.2 Register dashboard routes in server index
    - Add import for dashboard routes in `server/index.ts`
    - Mount routes at `/api/admin/dashboard`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 9. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
