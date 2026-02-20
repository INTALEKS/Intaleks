# Design Document: Admin Forum Management

## Overview

This design document describes the implementation of the admin forum management feature for theBizValuer platform. The feature enables administrators to create, view, manage, and moderate forum posts through a dedicated admin interface at `/admin/forum`. The implementation extends the existing forum page to include a post creation panel with a rich text editor.

## Architecture

The feature follows the existing Next.js client architecture with React Query for state management:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Forum Page                             │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐   │
│  │   Post List     │  │        Detail/Creation Panel        │   │
│  │   - Search      │  │  ┌─────────────────────────────┐    │   │
│  │   - Post Cards  │  │  │  Post Detail View           │    │   │
│  │   - Star/Delete │  │  │  - Author info              │    │   │
│  │                 │  │  │  - Full content             │    │   │
│  │                 │  │  │  - Actions (star/delete)    │    │   │
│  │                 │  │  └─────────────────────────────┘    │   │
│  │                 │  │  ┌─────────────────────────────┐    │   │
│  │                 │  │  │  Post Creation Panel        │    │   │
│  │                 │  │  │  - Admin info               │    │   │
│  │                 │  │  │  - Title input              │    │   │
│  │                 │  │  │  - Rich text editor         │    │   │
│  │                 │  │  │  - Submit button            │    │   │
│  │                 │  │  └─────────────────────────────┘    │   │
│  └─────────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

The page has two main states for the right panel:

1. **View Mode**: Shows selected post details (existing functionality)
2. **Create Mode**: Shows post creation form with rich text editor (new functionality)

## Components and Interfaces

### New Components

#### PostCreationPanel

A panel component for creating new forum posts with rich text editing capabilities.

```typescript
interface PostCreationPanelProps {
  adminUser: {
    name: string | null;
    email: string;
    avatar?: string;
  };
  onSubmit: (data: CreateForumPostInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}
```

#### RichTextEditor

A rich text editor component supporting formatting options.

```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Toolbar options
interface EditorToolbar {
  fontFamily: string[]; // Arial, Times New Roman, etc.
  fontSize: string[]; // 12px, 14px, 16px, etc.
  formatting: ("bold" | "italic" | "underline")[];
  insertions: ("image" | "attachment" | "link")[];
}
```

#### SubscriptionBadge

A badge component displaying user subscription status.

```typescript
interface SubscriptionBadgeProps {
  status: "subscribed" | "registered";
}
```

### Modified Components

#### ForumPage (client/app/admin/forum/page.tsx)

Extended to support:

- Toggle between view and create modes
- "Create a Post" button in header
- Integration with PostCreationPanel

### State Management

```typescript
// Page state
interface ForumPageState {
  mode: "view" | "create";
  selectedPostId: string | null;
  searchQuery: string;
}

// Form state for post creation
interface PostCreationState {
  title: string;
  content: string;
  errors: {
    title?: string;
    content?: string;
  };
}
```

## Data Models

### Existing Models (No Changes Required)

The existing Prisma schema already supports all required functionality:

```prisma
model ForumPost {
  id        String       @id @default(cuid())
  authorId  String       @map("author_id")
  title     String
  content   String       @db.Text
  starred   Boolean      @default(false)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  author    User         @relation(...)
  replies   ForumReply[]
}

model User {
  // Subscription status derived from:
  subscriptionStatus   SubscriptionStatus  // NONE, ACTIVE, PAST_DUE, etc.
}
```

### Subscription Status Derivation

```typescript
function getUserSubscriptionBadge(user: User): "subscribed" | "registered" {
  return user.subscriptionStatus === "ACTIVE" ? "subscribed" : "registered";
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Post List Display Completeness

_For any_ forum post displayed in the Post_List, the rendered output SHALL contain the author name, a subscription badge, post title, content preview (truncated), and a relative timestamp.

**Validates: Requirements 1.2**

### Property 2: Post Detail Display Completeness

_For any_ forum post displayed in the Post_Detail_Panel, the rendered output SHALL contain the author avatar, author name, author email, subscription badge, post title, full content, delete button, and star button.

**Validates: Requirements 3.2**

### Property 3: Search Results Relevance

_For any_ search query and any post in the filtered results, the post's title, content, or author name SHALL contain the search query (case-insensitive match).

**Validates: Requirements 2.1**

### Property 4: Empty Input Validation

_For any_ string composed entirely of whitespace characters (including empty string), submitting a post with that string as title OR content SHALL be rejected with a validation error, and no API request SHALL be made.

**Validates: Requirements 4.8, 4.9**

### Property 5: Star Toggle Round-Trip

_For any_ forum post, toggling the star status twice SHALL return the post to its original starred state.

**Validates: Requirements 6.1**

### Property 6: Subscription Badge Correctness

_For any_ user with subscriptionStatus === 'ACTIVE', the badge SHALL display "Subscribed" with blue styling. _For any_ user with subscriptionStatus !== 'ACTIVE', the badge SHALL display "Registered" with gray styling.

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Client-Side Validation Errors

| Error Condition         | User Feedback                                       |
| ----------------------- | --------------------------------------------------- |
| Empty title             | "Title is required" displayed below title input     |
| Empty content           | "Content is required" displayed below editor        |
| Whitespace-only title   | "Title cannot be empty" displayed below title input |
| Whitespace-only content | "Content cannot be empty" displayed below editor    |

### API Errors

| Error Type       | HTTP Status | User Feedback                                |
| ---------------- | ----------- | -------------------------------------------- |
| Validation error | 400         | Display specific field errors from response  |
| Unauthorized     | 401         | Redirect to login page                       |
| Not found        | 404         | "Post not found" toast message               |
| Server error     | 500         | "An error occurred. Please try again." toast |

### Error State UI

- Loading states: Skeleton components for list and detail views
- Error states: Error message with retry option
- Empty states: Contextual message ("No posts yet" or "No posts match your search")

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **Component rendering tests**

   - PostCreationPanel renders with admin info
   - RichTextEditor renders toolbar options
   - SubscriptionBadge renders correct variant

2. **Validation tests**

   - Empty title rejection
   - Empty content rejection
   - Valid input acceptance

3. **Edge cases**
   - Very long titles (truncation)
   - Special characters in content
   - Missing author name (fallback to email)

### Property-Based Tests

Property-based tests use fast-check to verify universal properties across many generated inputs.

**Testing Framework**: Vitest with fast-check

**Configuration**: Minimum 100 iterations per property test

Each property test must be tagged with:

- **Feature: admin-forum-management**
- **Property {number}: {property_text}**

**Properties to implement**:

1. Post list display completeness
2. Post detail display completeness
3. Search results relevance
4. Empty input validation
5. Star toggle round-trip
6. Subscription badge correctness

### Integration Tests

1. **Post creation flow**

   - Open creation panel → Fill form → Submit → Verify post in list

2. **Post management flow**

   - Select post → Star → Verify starred state → Delete → Verify removed

3. **Search flow**
   - Enter search term → Verify filtered results → Clear search → Verify all posts
