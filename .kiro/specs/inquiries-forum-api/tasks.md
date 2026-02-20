# Implementation Plan

- [x] 1. Database schema and migrations

  - [x] 1.1 Add Inquiry and InquiryReply models to Prisma schema
    - Add Inquiry model with id, name, email, subject, message, starred, timestamps
    - Add InquiryReply model with id, inquiryId, message, createdAt
    - Define cascade delete relationship
    - _Requirements: 1.1, 1.2, 2.1, 7.1_
  - [x] 1.2 Add ForumPost and ForumReply models to Prisma schema
    - Add ForumPost model with id, authorId, title, content, starred, timestamps
    - Add ForumReply model with id, postId, message, createdAt
    - Add relation to User model for author
    - Define cascade delete relationships
    - _Requirements: 4.1, 4.2, 5.1, 8.1_
  - [x] 1.3 Update User model to include forumPosts relation
    - Add forumPosts relation field to User model
    - _Requirements: 8.1_
  - [x] 1.4 Generate and run Prisma migration
    - Run `npx prisma migrate dev` to create migration
    - _Requirements: 1.1, 4.1_

- [x] 2. Backend validation schemas

  - [x] 2.1 Create inquiry validation schemas
    - Create `server/validation/inquiryValidation.ts`
    - Add createInquirySchema (name, email, subject, message required)
    - Add createReplySchema (message required, non-whitespace)
    - Add inquiryFiltersSchema (search, page, limit)
    - _Requirements: 2.3, 7.2_
  - [x] 2.2 Create forum validation schemas
    - Create `server/validation/forumValidation.ts`
    - Add createForumPostSchema (title, content required)
    - Add createReplySchema (message required, non-whitespace)
    - Add forumFiltersSchema (search, page, limit)
    - _Requirements: 5.3, 8.2_

- [x] 3. Backend services

  - [x] 3.1 Create inquiry service
    - Create `server/services/inquiry.ts`
    - Implement findAll with pagination and search
    - Implement findById with replies
    - Implement create for new inquiries
    - Implement addReply
    - Implement toggleStar
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 7.1_
  - [ ]\* 3.2 Write property tests for inquiry service
    - **Property 1: List pagination returns items in descending creation order**
    - **Property 2: Search filters return only matching results (inquiry)**
    - **Property 3: Whitespace-only replies are rejected (inquiry)**
    - **Property 4: Star toggle inverts the current state (inquiry)**
    - **Property 6: Created items return complete data (inquiry)**
    - **Property 7: Missing required fields are rejected (inquiry)**
    - **Property 8: Replies are associated with correct parent (inquiry)**
    - **Validates: Requirements 1.1, 1.3, 2.1, 2.3, 3.1, 3.2, 7.1, 7.2, 7.3**
  - [x] 3.3 Create forum service
    - Create `server/services/forum.ts`
    - Implement findAll with pagination and search
    - Implement findById with replies and author
    - Implement create for new posts
    - Implement addReply
    - Implement toggleStar
    - Implement delete
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 6.1, 6.2, 8.1_
  - [ ]\* 3.4 Write property tests for forum service
    - **Property 1: List pagination returns items in descending creation order**
    - **Property 2: Search filters return only matching results (forum)**
    - **Property 3: Whitespace-only replies are rejected (forum)**
    - **Property 4: Star toggle inverts the current state (forum)**
    - **Property 5: Deleted forum posts are not retrievable**
    - **Property 6: Created items return complete data (forum)**
    - **Property 7: Missing required fields are rejected (forum)**
    - **Property 8: Replies are associated with correct parent (forum)**
    - **Validates: Requirements 4.1, 4.3, 5.1, 5.3, 6.1, 6.2, 8.1, 8.2, 8.3**

- [x] 4. Backend controllers

  - [x] 4.1 Create inquiry controller
    - Create `server/controllers/inquiry.controller.ts`
    - Implement getInquiries (GET /api/admin/inquiries)
    - Implement getInquiryById (GET /api/admin/inquiries/:id)
    - Implement createInquiry (POST /api/inquiries)
    - Implement addReply (POST /api/admin/inquiries/:id/replies)
    - Implement toggleStar (PATCH /api/admin/inquiries/:id/star)
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 7.1_
  - [x] 4.2 Create forum controller
    - Create `server/controllers/forum.controller.ts`
    - Implement getForumPosts (GET /api/admin/forum)
    - Implement getForumPostById (GET /api/admin/forum/:id)
    - Implement createForumPost (POST /api/forum)
    - Implement addReply (POST /api/admin/forum/:id/replies)
    - Implement toggleStar (PATCH /api/admin/forum/:id/star)
    - Implement deleteForumPost (DELETE /api/admin/forum/:id)
    - _Requirements: 4.1, 4.2, 5.1, 6.1, 6.2, 8.1_

- [x] 5. Backend routes

  - [x] 5.1 Create inquiry routes
    - Create `server/routes/inquiry.routes.ts`
    - Add public route POST /api/inquiries
    - Add admin routes with auth middleware
    - _Requirements: 1.1, 2.1, 3.1, 7.1_
  - [x] 5.2 Create forum routes
    - Create `server/routes/forum.routes.ts`
    - Add authenticated route POST /api/forum
    - Add admin routes with auth middleware
    - _Requirements: 4.1, 5.1, 6.1, 6.2, 8.1_
  - [x] 5.3 Register routes in server index
    - Import and register inquiry routes
    - Import and register forum routes
    - _Requirements: 1.1, 4.1_

- [x] 6. Checkpoint - Make sure all tests are passing

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Frontend API services

  - [x] 7.1 Create inquiry API service
    - Create `client/app/services/inquiries.ts`
    - Add TypeScript interfaces for Inquiry, InquiryReply
    - Implement getInquiries, getInquiryById, createInquiry, addReply, toggleStar
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 7.1_
  - [x] 7.2 Create forum API service
    - Create `client/app/services/forum.ts`
    - Add TypeScript interfaces for ForumPost, ForumReply
    - Implement getForumPosts, getForumPostById, createForumPost, addReply, toggleStar, deleteForumPost
    - _Requirements: 4.1, 4.2, 5.1, 6.1, 6.2, 8.1_

- [x] 8. Frontend React Query hooks

  - [x] 8.1 Create inquiry hooks
    - Create `client/app/hooks/useInquiries.ts`
    - Add useInquiries, useInquiry, useCreateInquiry, useAddInquiryReply, useToggleInquiryStar
    - Configure query invalidation on mutations
    - _Requirements: 1.1, 1.2, 2.1, 3.1_
  - [x] 8.2 Create forum hooks
    - Create `client/app/hooks/useForumPosts.ts`
    - Add useForumPosts, useForumPost, useCreateForumPost, useAddForumReply, useToggleForumStar, useDeleteForumPost
    - Configure query invalidation on mutations
    - _Requirements: 4.1, 4.2, 5.1, 6.1, 6.2_

- [x] 9. Frontend page integration

  - [x] 9.1 Update inquiries page to use API
    - Update `client/app/admin/inquiries/page.tsx`
    - Replace mock data with useInquiries hook
    - Implement search with debounce
    - Implement star toggle functionality
    - Implement reply submission
    - Add loading and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2_
  - [x] 9.2 Update forum page to use API
    - Update `client/app/admin/forum/page.tsx`
    - Replace mock data with useForumPosts hook
    - Implement search with debounce
    - Implement star toggle functionality
    - Implement reply submission
    - Implement delete functionality
    - Add loading and error states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3_

- [x] 10. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
