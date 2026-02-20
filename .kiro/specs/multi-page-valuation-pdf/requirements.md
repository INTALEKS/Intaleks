# Requirements Document

## Introduction

This feature enhances the valuation PDF document generation to produce a professional multi-page report with a branded cover page, structured content sections, and consistent page formatting. The cover page displays company branding, logo, key company details, and report metadata in a clean, professional layout.

## Glossary

- **PDF_Generator**: The service responsible for creating PDF documents from valuation data
- **Cover_Page**: The first page of the valuation document displaying company branding and key information
- **Valuation_Data**: The complete set of financial and company information used to generate the report
- **Page_Footer**: The bottom section of each page containing industry, page number, and generation date
- **Company_Logo**: An uploaded image representing the company being valued
- **Country_Flag**: A visual indicator of the company's country of operation

## Requirements

### Requirement 1: Cover Page Generation

**User Story:** As a user, I want the valuation document to have a professional cover page, so that the report looks polished and includes key company information at a glance.

#### Acceptance Criteria

1. WHEN a valuation PDF is generated, THE PDF_Generator SHALL create a cover page as the first page of the document
2. THE Cover_Page SHALL display the Thebizvaluer branding in the top-right corner with "Thebiz" in black and "valuer" in blue (#3b82f6)
3. THE Cover_Page SHALL display the country name with its corresponding flag icon in the top-left corner
4. THE Cover_Page SHALL display the company logo centered vertically on the page
5. THE Cover_Page SHALL display the company name in blue (#3b82f6) below the logo
6. THE Cover_Page SHALL display "Started in" with the year value below the company name
7. THE Cover_Page SHALL display "Number of employees" with the employee count below the started year
8. THE Cover_Page SHALL display "Stage" with the company stage (Startup, Pre Revenue, Profitable) below the employee count
9. THE Cover_Page SHALL include a page footer with industry on the left, page number centered, and report generation date on the right

### Requirement 2: Multi-Page Document Structure

**User Story:** As a user, I want the valuation document to be organized across multiple pages, so that the information is easy to read and navigate.

#### Acceptance Criteria

1. THE PDF_Generator SHALL structure the document with distinct pages for: cover page, financial summary, valuation method details, and final valuation
2. WHEN content exceeds the available space on a page, THE PDF_Generator SHALL automatically create a new page and continue the content
3. THE PDF_Generator SHALL maintain consistent margins (50 points) across all pages
4. THE PDF_Generator SHALL use A4 page size (595.28 x 841.89 points) for all pages

### Requirement 3: Consistent Page Footer

**User Story:** As a user, I want each page to have a consistent footer, so that I can easily identify the document and navigate through pages.

#### Acceptance Criteria

1. THE Page_Footer SHALL appear at the bottom of every page in the document
2. THE Page_Footer SHALL display the industry type on the left side (e.g., "Industry: Finance")
3. THE Page_Footer SHALL display the current page number centered
4. THE Page_Footer SHALL display the report generation date on the right side in format "Report generated MMM DD, YYYY"
5. THE Page_Footer SHALL use a consistent font size (10pt) and color (#666666)

### Requirement 4: Company Logo Handling

**User Story:** As a user, I want my company logo to appear on the cover page, so that the report is personalized to my business.

#### Acceptance Criteria

1. WHEN a company logo is provided, THE Cover_Page SHALL display the logo centered on the page
2. THE Cover_Page SHALL scale the logo to fit within a maximum dimension of 150x150 points while maintaining aspect ratio
3. IF no company logo is provided, THEN THE Cover_Page SHALL display a default placeholder icon
4. THE PDF_Generator SHALL support PNG, JPG, and SVG logo formats

### Requirement 5: Country Flag Display

**User Story:** As a user, I want my company's country to be visually represented with a flag, so that the report clearly indicates the business location.

#### Acceptance Criteria

1. WHEN a country is specified, THE Cover_Page SHALL display the corresponding country flag icon
2. THE Cover_Page SHALL display the country name next to the flag
3. THE PDF_Generator SHALL support flags for Australia, United States, United Kingdom, Canada, and New Zealand
4. IF the country flag is not available, THEN THE Cover_Page SHALL display only the country name without a flag

### Requirement 6: Valuation Data Serialization

**User Story:** As a developer, I want valuation data to be properly serialized for PDF generation, so that all company and financial information is accurately represented.

#### Acceptance Criteria

1. THE PDF_Generator SHALL accept valuation data including: companyName, country, industry, startedYear, employees, stage, logo, and all financial data
2. WHEN serializing valuation data, THE PDF_Generator SHALL validate that required fields (companyName, country, industry) are present
3. IF required fields are missing, THEN THE PDF_Generator SHALL use default placeholder values
4. THE PDF_Generator SHALL format currency values according to the country's locale (e.g., AUD for Australia)
