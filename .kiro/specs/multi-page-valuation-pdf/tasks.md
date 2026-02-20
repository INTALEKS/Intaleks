# Implementation Plan: Multi-Page Valuation PDF

## Overview

This implementation extends the existing PDFService to generate professional multi-page valuation documents with a branded cover page, consistent footers, and proper handling of company logos and country flags.

## Tasks

- [x] 1. Extend data interfaces and add configuration constants

  - [x] 1.1 Create ExtendedValuationData interface in pdf.service.ts
    - Add startedYear, employees, stage, logoBase64, logoMimeType fields
    - Export the interface for use by controllers
    - _Requirements: 6.1_
  - [x] 1.2 Add country flag configuration and page constants
    - Define SUPPORTED_COUNTRIES with AU, US, GB, CA, NZ
    - Define PAGE_CONFIG with A4 dimensions and margins
    - Define COLORS constant for consistent styling
    - _Requirements: 5.3, 2.3, 2.4_
  - [ ]\* 1.3 Write property test for currency formatting by locale
    - **Property 7: Currency Formatting by Locale**
    - **Validates: Requirements 6.4**

- [x] 2. Implement cover page renderer

  - [x] 2.1 Add drawCoverPage method to PDFService
    - Render Thebizvaluer branding in top-right
    - Render country name in top-left
    - Render company logo centered (or placeholder)
    - Render company name, startedYear, employees, stage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [x] 2.2 Implement logo handler with placeholder fallback
    - Accept base64 encoded image data
    - Scale to max 150x150 points maintaining aspect ratio
    - Draw placeholder icon when no logo provided
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]\* 2.3 Write property test for company details presence
    - **Property 1: Company Details Presence**
    - **Validates: Requirements 1.5, 1.6, 1.7, 1.8**

- [x] 3. Implement page footer renderer

  - [x] 3.1 Add drawPageFooter method to PDFService
    - Display industry on left
    - Display page number centered
    - Display generation date on right in "Report generated MMM DD, YYYY" format
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 3.2 Integrate footer into all page renders
    - Call drawPageFooter after each page content
    - Track page numbers across document
    - _Requirements: 1.9, 3.1_
  - [ ]\* 3.3 Write property test for footer content presence
    - **Property 4: Footer Content Presence**
    - **Validates: Requirements 1.9, 3.2, 3.3, 3.4**

- [x] 4. Update generateValuationReport to use multi-page structure

  - [x] 4.1 Refactor generateValuationReport method
    - Start with cover page
    - Add new page for financial summary
    - Add new page for valuation method details
    - Add final valuation page
    - _Requirements: 2.1_
  - [x] 4.2 Implement automatic page break handling
    - Check remaining space before drawing sections
    - Add new page when content exceeds available space
    - _Requirements: 2.2_
  - [ ]\* 4.3 Write property test for multi-page document structure
    - **Property 2: Multi-Page Document Structure**
    - **Validates: Requirements 2.1, 2.2**

- [x] 5. Implement validation and default handling

  - [x] 5.1 Add validateValuationData function
    - Check for required fields: companyName, country, industry
    - Return validation result with missing field names
    - _Requirements: 6.2_
  - [x] 5.2 Implement default placeholder values
    - Use "Company Name Not Provided" for missing companyName
    - Use "Australia" for missing country
    - Use "General" for missing industry
    - _Requirements: 6.3_
  - [ ]\* 5.3 Write property test for required field validation
    - **Property 8: Required Field Validation**
    - **Validates: Requirements 6.2, 6.3**

- [x] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update controller and client integration

  - [x] 7.1 Update valuation controller to accept extended data
    - Accept company questionnaire fields in request body
    - Pass extended data to PDF service
    - _Requirements: 6.1_
  - [x] 7.2 Update client calculator to send extended data
    - Include startedYear, employees, stage in PDF generation request
    - Convert logo file to base64 before sending
    - _Requirements: 6.1_
  - [ ]\* 7.3 Write property test for country name presence
    - **Property 5: Country Name Presence**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
