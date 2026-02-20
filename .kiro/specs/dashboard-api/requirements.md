# Requirements Document

## Introduction

This document defines the requirements for the Dashboard Management API, which provides aggregated statistics and analytics data for the admin dashboard. The API consolidates data from users, subscriptions, inquiries, and revenue sources to power the dashboard visualizations including stat cards, user growth charts, plan popularity charts, and inquiry trend charts.

## Glossary

- **Dashboard_API**: The backend service responsible for aggregating and serving dashboard statistics and analytics data
- **Stat_Card**: A UI component displaying a single metric with its value, change percentage, and trend direction
- **User_Growth_Data**: Time-series data showing user registration trends over a specified period
- **Plan_Popularity_Data**: Aggregated data showing the distribution of users across subscription plans
- **Inquiry_Trend_Data**: Time-series data showing inquiry submission patterns over a specified period
- **Revenue**: The total monetary value calculated from subscription plan prices multiplied by subscriber counts
- **Active_User**: A user with status set to ACTIVE in the system
- **Time_Range**: A date range filter with start and end dates for querying historical data

## Requirements

### Requirement 1

**User Story:** As an admin, I want to view aggregated dashboard statistics, so that I can quickly understand the overall health of the platform.

#### Acceptance Criteria

1. WHEN an admin requests dashboard statistics THEN the Dashboard_API SHALL return total revenue, total users count, and active users count
2. WHEN calculating total revenue THEN the Dashboard_API SHALL sum the prices of all subscription plans multiplied by their respective subscriber counts
3. WHEN returning statistics THEN the Dashboard_API SHALL include percentage change values comparing current period to previous period
4. WHEN returning statistics THEN the Dashboard_API SHALL indicate whether each metric has increased or decreased compared to the previous period
5. IF the database query fails THEN the Dashboard_API SHALL return an appropriate error response with status code 500

### Requirement 2

**User Story:** As an admin, I want to view user growth data over time, so that I can analyze registration trends and plan marketing strategies.

#### Acceptance Criteria

1. WHEN an admin requests user growth data THEN the Dashboard_API SHALL return time-series data with user counts grouped by time period
2. WHERE a time range filter is provided THEN the Dashboard_API SHALL return data only within the specified date range
3. WHEN no time range is specified THEN the Dashboard_API SHALL default to the last 12 months of data
4. WHEN returning user growth data THEN the Dashboard_API SHALL include labels for each time period and corresponding user counts
5. IF the requested time range is invalid THEN the Dashboard_API SHALL return a validation error with status code 400

### Requirement 3

**User Story:** As an admin, I want to view subscription plan popularity data, so that I can understand which plans are most attractive to users.

#### Acceptance Criteria

1. WHEN an admin requests plan popularity data THEN the Dashboard_API SHALL return the count of users subscribed to each plan
2. WHEN returning plan popularity data THEN the Dashboard_API SHALL include the plan name and subscriber count for each plan
3. WHEN returning plan popularity data THEN the Dashboard_API SHALL order results by subscriber count in descending order
4. WHEN a plan has zero subscribers THEN the Dashboard_API SHALL still include that plan in the response with a count of zero
5. IF no subscription plans exist THEN the Dashboard_API SHALL return an empty array

### Requirement 4

**User Story:** As an admin, I want to view inquiry trend data, so that I can monitor customer engagement and support workload.

#### Acceptance Criteria

1. WHEN an admin requests inquiry trend data THEN the Dashboard_API SHALL return time-series data with inquiry counts grouped by time period
2. WHERE a time range filter is provided THEN the Dashboard_API SHALL return data only within the specified date range
3. WHEN no time range is specified THEN the Dashboard_API SHALL default to the last 12 months of data
4. WHEN returning inquiry trend data THEN the Dashboard_API SHALL include labels for each time period and corresponding inquiry counts
5. IF the requested time range is invalid THEN the Dashboard_API SHALL return a validation error with status code 400

### Requirement 5

**User Story:** As an admin, I want a single endpoint to fetch all dashboard data, so that the dashboard can load efficiently with minimal API calls.

#### Acceptance Criteria

1. WHEN an admin requests the combined dashboard endpoint THEN the Dashboard_API SHALL return statistics, user growth, plan popularity, and inquiry trends in a single response
2. WHERE optional time range parameters are provided THEN the Dashboard_API SHALL apply them to user growth and inquiry trend data
3. WHEN returning combined data THEN the Dashboard_API SHALL structure the response with clearly named sections for each data type
4. IF any sub-query fails THEN the Dashboard_API SHALL return partial data with error indicators for failed sections
5. WHEN the combined endpoint is called THEN the Dashboard_API SHALL execute queries in parallel for optimal performance

### Requirement 6

**User Story:** As a developer, I want the dashboard API to validate all input parameters, so that invalid requests are rejected with clear error messages.

#### Acceptance Criteria

1. WHEN a request contains an invalid date format THEN the Dashboard_API SHALL return a 400 status with a descriptive error message
2. WHEN a start date is after the end date THEN the Dashboard_API SHALL return a 400 status with a validation error
3. WHEN optional parameters are omitted THEN the Dashboard_API SHALL use sensible default values
4. WHEN returning validation errors THEN the Dashboard_API SHALL include field-level error details in the response
