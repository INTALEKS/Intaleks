# Implementation Plan: Forum Client Integration

## Overview

This implementation plan connects the public-facing forum page to the existing server API, replacing mock data with real API calls. The implementation follows a bottom-up approach: fix the service layer first, then update hooks, and finally integrate with the page component.

## Tasks

- [x] 1. Fix Forum Service API Layer

  - [x] 1.1 Update forum service to export ForumApi object

    - Rename `ForumService` to `ForumApi` for consistency with hooks
    - Add `ForumFilters` interface export
    - Add `CreateForumPostInput` interface export
    - Update all methods to match expected interface
    - _Requirements: 7.1, 7.3_

  - [x] 1.2 Add proper error handling to all API methods

    - Throw descriptive errors for non-2xx responses
    - Parse error response body for detailed messages
    - _Requirements: 7.2_

  - [ ]\*1.3 Write property test for API error handling
    - **Property 8: API Error Handling**
    - **Validates: Requirements 7.2**

- [x] 2. Update Forum Hooks

  - [x] 2.1 Fix hook imports to use ForumApi

    - Update import statement to use correct export name
    - Ensure all hook functions work with updated service
    - _Requirements: 7.1_

  - [x] 2.2 Add filter support to useForumPosts hook
    - Support search, page, limit parameters
    - Support authorId filter for "My Posts"
    - _Requirements: 5.1, 6.2_

- [x] 3. Checkpoint - Verify service and hooks work

  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update Forum Page Component

  - [x] 4.1 Replace mock data with API data

    - Remove initialPosts mock data
    - Use useForumPosts hook to fetch posts
    - Transform server response to UI format
    - _Requirements: 1.1, 1.4_

  - [x] 4.2 Implement loading and error states

    - Show loading indicator while fetching
    - Show error message on API failure
    - _Requirements: 1.2, 1.3_

  - [x] 4.3 Implement post detail view with API

    - Fetch single post details when selected
    - Display replies from server
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]\*4.4 Write property test for replies chronological order
    - **Property 2: Replies Display in Chronological Order**
    - **Validates: Requirements 2.2**

- [x] 5. Implement Post Creation

  - [x] 5.1 Add create post dialog/form

    - Create form with title and content fields
    - Add validation for empty fields
    - _Requirements: 3.1, 3.3_

  - [x] 5.2 Connect form to useCreateForumPost mutation

    - Submit form data to API
    - Show success toast on creation
    - Refresh posts list after creation
    - _Requirements: 3.2, 3.4_

  - [ ]\*5.3 Write property test for empty post validation
    - **Property 3: Empty Post Validation**
    - **Validates: Requirements 3.3**

- [x] 6. Implement Reply Functionality

  - [x] 6.1 Connect reply form to useAddForumReply mutation

    - Submit reply to API
    - Show success toast on creation
    - Refresh post details after reply
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Add validation for empty replies

    - Prevent submission of empty/whitespace replies
    - Show validation error message
    - _Requirements: 4.3, 4.4_

  - [ ]\*6.3 Write property test for empty reply validation
    - **Property 4: Empty Reply Validation**
    - **Validates: Requirements 4.3**

- [x] 7. Implement Search and Filtering

  - [x] 7.1 Connect search input to API

    - Debounce search input
    - Pass search term to useForumPosts
    - Show loading state during search
    - _Requirements: 5.1, 5.2_

  - [x] 7.2 Implement filter functionality

    - "All Discussions" - no filter
    - "My Posts" - filter by current user's authorId
    - "Announcements" - filter by admin role
    - Show empty state when no results
    - _Requirements: 5.3, 6.1, 6.2, 6.3_

  - [ ]\*7.3 Write property test for search results matching

    - **Property 5: Search Results Match Query**
    - **Validates: Requirements 5.1**

  - [ ]\*7.4 Write property test for My Posts filter
    - **Property 6: My Posts Filter Shows Only User's Posts**
    - **Validates: Requirements 6.2**

- [x] 8. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
