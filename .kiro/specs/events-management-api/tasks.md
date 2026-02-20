# Implementation Plan

> **⚠️ IMPORTANT: DO NOT WRITE ANY TESTS. Focus only on implementation code.**

- [x] 1. Set up database schema and migrations

  - [x] 1.1 Add Event and EventParticipant models to Prisma schema
    - Add Event model with all fields (title, shortDescription, description, date, time, category, meetingLink, thumbnail, status)
    - Add EventParticipant model with user relation and cascade delete
    - Add EventCategory, EventStatus, and ParticipantStatus enums
    - Update User model to include EventParticipant relation
    - _Requirements: 1.1, 4.3, 6.1_
  - [x] 1.2 Generate and run Prisma migration
    - Run `prisma migrate dev` to create migration
    - Verify tables are created correctly
    - _Requirements: 1.1_

- [x] 2. Implement validation schemas

  - [x] 2.1 Create event validation schemas using Joi
    - Create createEventSchema with conditional meetingLink validation
    - Create updateEventSchema with partial field validation
    - Create eventFiltersSchema for query parameters
    - Create participantStatusSchema for status updates
    - _Requirements: 1.2, 1.3, 1.4, 2.5, 3.4_

- [x] 3. Implement Event Service layer

  - [x] 3.1 Create event service with CRUD operations
    - Implement create method with validation
    - Implement findAll method with filtering and pagination
    - Implement findById method with participant inclusion
    - Implement update method with category change validation
    - Implement delete method with cascade behavior
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 4. Implement Participant Service methods

  - [x] 4.1 Add participant management methods to event service
    - Implement addParticipant method with duplicate check
    - Implement removeParticipant method
    - Implement updateParticipantStatus method
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. Implement Statistics Service method

  - [x] 5.1 Add getStats method to event service
    - Calculate total events, registrations, and attendants
    - Implement time range filtering
    - Calculate change metrics comparing to previous period
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Implement Event Controller

  - [x] 6.1 Create event controller with all endpoint handlers
    - Implement getEvents handler with filter parsing
    - Implement getEventById handler
    - Implement createEvent handler with validation
    - Implement updateEvent handler with validation
    - Implement deleteEvent handler
    - Implement getEventStats handler
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1_
  - [x] 6.2 Add participant endpoint handlers to controller
    - Implement addParticipant handler
    - Implement removeParticipant handler
    - Implement updateParticipantStatus handler
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 7. Implement Event Routes

  - [x] 7.1 Create event routes with auth middleware
    - Set up router with admin authentication middleware
    - Register all event CRUD routes
    - Register participant management routes
    - Register statistics route
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 7.2 Register event routes in main server
    - Import and mount event routes at /api/admin/events
    - _Requirements: 8.1_

- [x] 8. Implement Error Handling
  - [x] 8.1 Create custom error classes and error handler middleware
    - Create NotFoundError, ValidationError, ConflictError classes
    - Create error handler middleware for consistent error responses
    - _Requirements: 1.2, 3.2, 3.4, 4.2, 5.2, 6.3_
