# Requirements Document

## Introduction

This document specifies the requirements for implementing backend APIs and frontend integration for two admin features: Inquiries Management and Forum Management. Both features allow administrators to view, search, reply to, and manage user-submitted content. Inquiries are direct support messages from users, while Forum posts are community discussions.

## Glossary

- **Inquiry**: A direct support message submitted by a user to the admin team containing a subject and message body
- **Forum_Post**: A community discussion post created by a user with a title and content
- **Reply**: An admin response to an inquiry or forum post
- **Starred**: A boolean flag indicating if an item has been marked as important by an admin
- **User_Status**: The subscription status of a user (Subscribed or Registered)

## Requirements

### Requirement 1

**User Story:** As an admin, I want to view all inquiries submitted by users, so that I can provide support and respond to their questions.

#### Acceptance Criteria

1. WHEN an admin navigates to the inquiries page THEN the Inquiry_System SHALL display a paginated list of all inquiries sorted by creation date descending
2. WHEN an admin selects an inquiry from the list THEN the Inquiry_System SHALL display the full inquiry details including sender name, email, subject, message, and timestamp
3. WHEN an admin searches for inquiries THEN the Inquiry_System SHALL filter results by sender name, email, or subject containing the search term
4. WHEN the inquiries list is loading THEN the Inquiry_System SHALL display a loading indicator

### Requirement 2

**User Story:** As an admin, I want to reply to user inquiries, so that I can provide support and resolve their issues.

#### Acceptance Criteria

1. WHEN an admin submits a reply to an inquiry THEN the Inquiry_System SHALL create a reply record associated with that inquiry
2. WHEN a reply is successfully created THEN the Inquiry_System SHALL display the reply in the inquiry detail view
3. IF the reply message is empty or contains only whitespace THEN the Inquiry_System SHALL reject the submission and display a validation error

### Requirement 3

**User Story:** As an admin, I want to star important inquiries, so that I can prioritize and track them easily.

#### Acceptance Criteria

1. WHEN an admin clicks the star icon on an inquiry THEN the Inquiry_System SHALL toggle the starred status of that inquiry
2. WHEN the starred status changes THEN the Inquiry_System SHALL persist the change and update the UI immediately

### Requirement 4

**User Story:** As an admin, I want to view all forum posts, so that I can moderate community discussions.

#### Acceptance Criteria

1. WHEN an admin navigates to the forum page THEN the Forum_System SHALL display a paginated list of all forum posts sorted by creation date descending
2. WHEN an admin selects a forum post from the list THEN the Forum_System SHALL display the full post details including author name, email, title, content, user status, and timestamp
3. WHEN an admin searches for forum posts THEN the Forum_System SHALL filter results by author name, title, or content containing the search term
4. WHEN the forum posts list is loading THEN the Forum_System SHALL display a loading indicator

### Requirement 5

**User Story:** As an admin, I want to reply to forum posts, so that I can engage with the community and provide official responses.

#### Acceptance Criteria

1. WHEN an admin submits a reply to a forum post THEN the Forum_System SHALL create a reply record associated with that post
2. WHEN a reply is successfully created THEN the Forum_System SHALL display the reply in the post detail view
3. IF the reply message is empty or contains only whitespace THEN the Forum_System SHALL reject the submission and display a validation error

### Requirement 6

**User Story:** As an admin, I want to star and delete forum posts, so that I can moderate content and highlight important discussions.

#### Acceptance Criteria

1. WHEN an admin clicks the star icon on a forum post THEN the Forum_System SHALL toggle the starred status of that post
2. WHEN an admin clicks the delete button on a forum post THEN the Forum_System SHALL remove the post from the database
3. WHEN a forum post is deleted THEN the Forum_System SHALL remove it from the list and clear the detail view if it was selected

### Requirement 7

**User Story:** As a user, I want to submit inquiries through a contact form, so that I can get support from the admin team.

#### Acceptance Criteria

1. WHEN a user submits an inquiry with valid name, email, subject, and message THEN the Inquiry_System SHALL create a new inquiry record
2. IF any required field is missing or invalid THEN the Inquiry_System SHALL reject the submission and return validation errors
3. WHEN an inquiry is successfully created THEN the Inquiry_System SHALL return the created inquiry data

### Requirement 8

**User Story:** As a user, I want to create forum posts, so that I can participate in community discussions.

#### Acceptance Criteria

1. WHEN an authenticated user submits a forum post with valid title and content THEN the Forum_System SHALL create a new post associated with that user
2. IF the title or content is missing or invalid THEN the Forum_System SHALL reject the submission and return validation errors
3. WHEN a forum post is successfully created THEN the Forum_System SHALL return the created post data
