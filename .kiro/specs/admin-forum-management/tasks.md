# Implementation Plan: Admin Forum Management

## Overview

This plan implements the admin forum management feature, adding post creation capabilities with a rich text editor to the existing admin forum page. The implementation builds on the existing forum infrastructure and follows an incremental approach.

## Tasks

- [x] 1. Create SubscriptionBadge component

  - Create `client/components/general-ui/admin-components/forum-components/SubscriptionBadge.tsx`
  - Implement badge with "Subscribed" (blue) and "Registered" (gray) variants
  - Accept `subscriptionStatus` prop and derive display text/color
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]\* 1.1 Write property test for SubscriptionBadge

  - **Property 6: Subscription Badge Correctness**
  - Test that ACTIVE status renders "Subscribed" with blue styling
  - Test that non-ACTIVE status renders "Registered" with gray styling
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 2. Create RichTextEditor component

  - Create `client/components/general-ui/admin-components/forum-components/RichTextEditor.tsx`
  - Implement toolbar with font family selector, font size selector
  - Add bold, italic, underline formatting buttons
  - Add image, attachment, and link insertion buttons
  - Use contentEditable div or integrate a lightweight editor library (e.g., react-quill or tiptap)
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 3. Create PostCreationPanel component

  - Create `client/components/general-ui/admin-components/forum-components/PostCreationPanel.tsx`
  - Display admin avatar, name, and email at top
  - Add title input field with validation
  - Integrate RichTextEditor for content
  - Add "Make a Post" submit button
  - Add close/cancel button (X icon)
  - Implement client-side validation for empty title/content
  - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ]\* 3.1 Write property test for empty input validation

  - **Property 4: Empty Input Validation**
  - Generate whitespace-only strings and verify submission is blocked
  - Verify validation errors are displayed
  - **Validates: Requirements 4.8, 4.9**

- [x] 4. Update admin forum page with create mode

  - Modify `client/app/admin/forum/page.tsx`
  - Add "Create a Post" button in the header area
  - Add state for `mode: 'view' | 'create'`
  - Conditionally render PostCreationPanel or post detail based on mode
  - Wire up `useCreateForumPost` hook to PostCreationPanel
  - Reset to view mode after successful post creation
  - _Requirements: 4.1, 4.6, 4.7, 4.10_

- [x] 5. Integrate SubscriptionBadge in post list and detail

  - Update post list items to use SubscriptionBadge component
  - Update post detail panel to use SubscriptionBadge component
  - Derive subscription status from user's `subscriptionStatus` field
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]\* 5.1 Write property test for post list display completeness

  - **Property 1: Post List Display Completeness**
  - Generate random posts and verify rendered output contains all required fields
  - **Validates: Requirements 1.2**

- [ ]\* 5.2 Write property test for post detail display completeness

  - **Property 2: Post Detail Display Completeness**
  - Generate random posts and verify detail panel contains all required elements
  - **Validates: Requirements 3.2**

- [x] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update search functionality with property test

  - Verify existing search filters posts by title, content, or author name
  - Ensure case-insensitive matching
  - _Requirements: 2.1, 2.2_

- [ ]\* 7.1 Write property test for search results relevance

  - **Property 3: Search Results Relevance**
  - Generate random posts and search queries
  - Verify all results contain the search term in title, content, or author name
  - **Validates: Requirements 2.1**

- [x] 8. Verify star toggle functionality

  - Ensure existing star toggle works correctly
  - Verify UI updates (filled vs outlined star icon)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 8.1 Write property test for star toggle round-trip

  - **Property 5: Star Toggle Round-Trip**
  - Generate random posts with random starred state
  - Toggle twice and verify return to original state
  - **Validates: Requirements 6.1**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The existing forum API and hooks already support all required operations
- RichTextEditor can use a simple contentEditable implementation or integrate react-quill/tiptap
- Property tests use fast-check with minimum 100 iterations
- Subscription status is derived from user's `subscriptionStatus` field in the database
