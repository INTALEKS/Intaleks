# Implementation Plan

- [x] 1. Set up database schema for videos

  - [x] 1.1 Add Video model and VideoCategory enum to Prisma schema
    - Add VideoCategory enum with TRAINING and EDUCATIONAL values
    - Add Video model with id, title, description, category, videoUrl, thumbnail, createdAt, updatedAt
    - _Requirements: 1.1, 1.4_
  - [x] 1.2 Generate and run Prisma migration
    - Run `npx prisma migrate dev` to create migration
    - Verify migration applies successfully
    - _Requirements: 1.1_

- [x] 2. Implement video validation schemas

  - [x] 2.1 Create video validation file with Joi schemas
    - Create `server/validation/videoValidation.ts`
    - Implement createVideoSchema with required fields (title, description, category, videoUrl)
    - Implement updateVideoSchema with optional fields
    - Implement videoFiltersSchema for pagination and category filter
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 4.3_
  - [ ]\* 2.2 Write property test for validation schemas
    - **Property 2: Validation Rejects Invalid Input**
    - **Validates: Requirements 1.2, 4.3**

- [-] 3. Implement video service layer

  - [x] 3.1 Create video service with CRUD operations
    - Create `server/services/video.ts`
    - Implement create method with database insertion
    - Implement findAll method with filtering and pagination
    - Implement findById method
    - Implement update method
    - Implement delete method with file cleanup
    - Implement getStats method for category counts
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 7.1_
  - [ ]\* 3.2 Write property test for video creation round-trip
    - **Property 1: Video Creation Round-Trip**
    - **Validates: Requirements 1.1, 3.1**
  - [ ]\* 3.3 Write property test for category filtering
    - **Property 3: Category Filter Correctness**
    - **Validates: Requirements 2.2**
  - [ ]\* 3.4 Write property test for pagination
    - **Property 4: Pagination Consistency**
    - **Validates: Requirements 2.3**
  - [ ]\* 3.5 Write property test for update persistence
    - **Property 5: Update Persistence**
    - **Validates: Requirements 4.1**
  - [ ]\* 3.6 Write property test for deletion
    - **Property 6: Deletion Completeness**
    - **Validates: Requirements 5.1**
  - [ ]\* 3.7 Write property test for statistics
    - **Property 8: Statistics Accuracy**
    - **Validates: Requirements 7.1, 7.2**

- [-] 4. Implement video controller

  - [x] 4.1 Create video controller with HTTP handlers
    - Create `server/controllers/video.controller.ts`
    - Implement getVideos handler with filter validation
    - Implement getVideoById handler
    - Implement createVideo handler with validation
    - Implement updateVideo handler with validation
    - Implement deleteVideo handler
    - Implement getVideoStats handler
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1_
  - [ ]\* 4.2 Write unit tests for video controller
    - Test successful CRUD operations
    - Test validation error responses
    - Test not found error responses
    - _Requirements: 1.2, 3.2, 4.2, 5.2_

- [x] 5. Implement file upload endpoints

  - [x] 5.1 Extend storage service for video uploads
    - Add uploadVideo method to storage service
    - Add uploadThumbnail method to storage service
    - Configure multer for video file handling (100MB limit)
    - Configure multer for thumbnail handling (5MB limit)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 5.2 Add upload handlers to video controller
    - Implement uploadVideo handler with file validation
    - Implement uploadThumbnail handler with file validation
    - Return URL references on successful upload
    - _Requirements: 6.1, 6.4_
  - [ ]\* 5.3 Write property test for file upload
    - **Property 7: File Upload Returns Valid URL**
    - **Validates: Requirements 6.1, 6.4**

- [x] 6. Set up video routes

  - [x] 6.1 Create video routes file
    - Create `server/routes/video.routes.ts`
    - Configure authentication and admin authorization middleware
    - Register all video endpoints (GET, POST, PUT, DELETE)
    - Register upload endpoints
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_
  - [x] 6.2 Register video routes in main application
    - Import video routes in `server/index.ts`
    - Mount routes at `/api/admin/videos`
    - _Requirements: 1.1_

- [x] 7. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Wire up frontend API integration

  - [x] 8.1 Create video API service on client
    - Create `client/app/services/videos.ts`
    - Implement fetchVideos with pagination and filters
    - Implement fetchVideoById
    - Implement createVideo
    - Implement updateVideo
    - Implement deleteVideo
    - Implement uploadVideo and uploadThumbnail
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_
  - [x] 8.2 Create useVideos hook for React Query integration
    - Create `client/app/hooks/useVideos.ts`
    - Implement useVideos query hook with filters
    - Implement useVideo query hook for single video
    - Implement useCreateVideo mutation
    - Implement useUpdateVideo mutation
    - Implement useDeleteVideo mutation
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  - [x] 8.3 Update videos page to use real API
    - Replace mock data with useVideos hook
    - Connect AddNewVideo form to createVideo mutation
    - Wire up edit and delete buttons to mutations
    - Add loading and error states
    - _Requirements: 1.1, 2.1, 4.1, 5.1_

- [x] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
