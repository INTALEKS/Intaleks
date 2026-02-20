# Design Document: Multi-Page Valuation PDF

## Overview

This design extends the existing `PDFService` class to generate professional multi-page valuation documents with a branded cover page. The implementation uses PDFKit for PDF generation and follows the existing patterns in the codebase while adding new capabilities for cover page rendering, country flags, and consistent page footers.

## Architecture

The solution follows a modular approach within the existing PDF service:

```
┌─────────────────────────────────────────────────────────────┐
│                      PDFService                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ CoverPage   │  │ ContentPage │  │ PageFooter          │  │
│  │ Renderer    │  │ Renderer    │  │ Renderer            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ CountryFlag │  │ Logo        │  │ Currency            │  │
│  │ Helper      │  │ Handler     │  │ Formatter           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Extended ValuationData Interface

```typescript
export interface ExtendedValuationData extends ValuationData {
  // Company questionnaire data
  startedYear?: string;
  employees?: string;
  stage?: "startup" | "pre-revenue" | "profitable";
  logoBase64?: string; // Base64 encoded logo image
  logoMimeType?: string; // 'image/png' | 'image/jpeg' | 'image/svg+xml'
}
```

### Country Flag Configuration

```typescript
interface CountryFlagConfig {
  code: string; // ISO country code
  name: string; // Display name
  flagEmoji: string; // Unicode flag emoji
  currency: string; // Currency code for formatting
  locale: string; // Locale for number formatting
}

const SUPPORTED_COUNTRIES: Record<string, CountryFlagConfig> = {
  australia: { code: "AU", name: "Australia", flagEmoji: "🇦🇺", currency: "AUD", locale: "en-AU" },
  "united states": { code: "US", name: "United States", flagEmoji: "🇺🇸", currency: "USD", locale: "en-US" },
  "united kingdom": { code: "GB", name: "United Kingdom", flagEmoji: "🇬🇧", currency: "GBP", locale: "en-GB" },
  canada: { code: "CA", name: "Canada", flagEmoji: "🇨🇦", currency: "CAD", locale: "en-CA" },
  "new zealand": { code: "NZ", name: "New Zealand", flagEmoji: "🇳🇿", currency: "NZD", locale: "en-NZ" },
};
```

### Page Structure Constants

```typescript
const PAGE_CONFIG = {
  width: 595.28, // A4 width in points
  height: 841.89, // A4 height in points
  margin: 50,
  footerHeight: 40,
  footerY: 801.89, // PAGE_HEIGHT - MARGIN
};

const COLORS = {
  primary: "#3b82f6", // Blue for branding
  text: "#1a1a1a", // Dark text
  muted: "#666666", // Footer text
  background: "#ffffff", // Page background
};
```

## Data Models

### PDF Generation Request

```typescript
interface PDFGenerationRequest {
  valuationData: ExtendedValuationData;
  includeFinancialDetails: boolean;
  includeMethodDetails: boolean;
}
```

### Page Metadata

```typescript
interface PageMetadata {
  pageNumber: number;
  totalPages: number;
  industry: string;
  generatedDate: string;
}
```

## Component Details

### Cover Page Renderer

The cover page renderer creates the first page with:

1. **Header Section** (top 100pt)

   - Country flag + name (left-aligned, 20pt from top)
   - Thebizvaluer branding (right-aligned, 20pt from top)

2. **Center Section** (middle of page)

   - Company logo (centered, max 150x150pt)
   - Company name in blue (centered, 24pt font)
   - Company details in vertical list:
     - "Started in [year]"
     - "Number of employees [count]"
     - "Stage [stage]"

3. **Footer Section** (bottom 40pt)
   - Industry (left)
   - Page number (center)
   - Generation date (right)

### Page Footer Renderer

Applied to every page:

```typescript
private drawPageFooter(metadata: PageMetadata): void {
  const y = PAGE_CONFIG.footerY;

  // Industry (left)
  this.doc.fontSize(10)
    .fillColor(COLORS.muted)
    .text(`Industry: ${metadata.industry}`, PAGE_CONFIG.margin, y);

  // Page number (center)
  this.doc.text(
    `${metadata.pageNumber}`,
    PAGE_CONFIG.width / 2 - 10,
    y,
    { width: 20, align: 'center' }
  );

  // Date (right)
  this.doc.text(
    `Report generated ${metadata.generatedDate}`,
    PAGE_CONFIG.margin,
    y,
    { width: PAGE_CONFIG.width - PAGE_CONFIG.margin * 2, align: 'right' }
  );
}
```

### Logo Handler

Handles logo processing and rendering:

```typescript
private async renderLogo(logoBase64: string | undefined, mimeType: string | undefined): Promise<void> {
  const centerX = PAGE_CONFIG.width / 2;
  const centerY = PAGE_CONFIG.height / 2 - 50;
  const maxSize = 150;

  if (logoBase64 && mimeType) {
    const buffer = Buffer.from(logoBase64, 'base64');
    this.doc.image(buffer, centerX - maxSize/2, centerY - maxSize/2, {
      fit: [maxSize, maxSize],
      align: 'center',
      valign: 'center'
    });
  } else {
    // Draw placeholder icon
    this.drawPlaceholderLogo(centerX, centerY);
  }
}
```

### Currency Formatter

Formats currency based on country:

```typescript
private formatCurrency(value: number, country: string): string {
  const config = SUPPORTED_COUNTRIES[country.toLowerCase()] || SUPPORTED_COUNTRIES['australia'];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Company Details Presence

_For any_ valuation data with companyName, startedYear, employees, and stage values, the generated PDF buffer should contain text representations of all these values.

**Validates: Requirements 1.5, 1.6, 1.7, 1.8**

### Property 2: Multi-Page Document Structure

_For any_ complete valuation data (with financial data and valuation method details), the generated PDF should have at least 2 pages.

**Validates: Requirements 2.1, 2.2**

### Property 3: A4 Page Size

_For any_ generated PDF, the page dimensions should be A4 size (595.28 x 841.89 points).

**Validates: Requirements 2.4**

### Property 4: Footer Content Presence

_For any_ generated PDF with an industry value, the PDF content should contain the industry name and a date in "Report generated" format.

**Validates: Requirements 1.9, 3.2, 3.3, 3.4**

### Property 5: Country Name Presence

_For any_ valuation data with a country value (supported or unsupported), the generated PDF should contain the country name and generation should succeed without errors.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Logo Format Support

_For any_ valid image data in PNG, JPG, or SVG format provided as base64, the PDF generation should succeed without errors.

**Validates: Requirements 4.1, 4.4**

### Property 7: Currency Formatting by Locale

_For any_ supported country and numeric value, the currency formatter should produce a string containing the correct currency symbol for that country's locale.

**Validates: Requirements 6.4**

### Property 8: Required Field Validation

_For any_ valuation data missing required fields (companyName, country, or industry), the validation function should return false or the generator should use default placeholder values.

**Validates: Requirements 6.2, 6.3**

## Error Handling

### Missing Required Data

When required fields are missing, the PDF generator will:

1. Log a warning with the missing field names
2. Use placeholder values:
   - companyName: "Company Name Not Provided"
   - country: "Australia" (default)
   - industry: "General"

### Invalid Logo Data

When logo data is invalid or corrupted:

1. Log an error with details
2. Fall back to placeholder icon
3. Continue PDF generation without failing

### PDF Generation Failures

If PDFKit encounters an error:

1. Reject the promise with a descriptive error
2. Include the original error for debugging
3. Clean up any partial resources

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. Cover page renders with all company details
2. Cover page renders with missing optional fields
3. Footer appears on each page with correct content
4. Logo placeholder renders when no logo provided
5. Supported countries display correctly
6. Unsupported countries fall back gracefully
7. Currency formats correctly for each locale

### Property-Based Tests

Property-based tests will use fast-check to verify universal properties:

1. **Company Details Property**: Generate random company data, create PDF, verify all values present
2. **Multi-Page Property**: Generate complete valuation data, verify page count >= 2
3. **Country Handling Property**: Generate random country names, verify PDF generation succeeds
4. **Currency Formatting Property**: Generate random countries and values, verify correct currency symbols
5. **Validation Property**: Generate data with random missing fields, verify validation behavior

### Test Configuration

- Testing framework: Vitest
- Property-based testing library: fast-check
- Minimum iterations per property test: 100
- Tag format: **Feature: multi-page-valuation-pdf, Property {number}: {property_text}**
