"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = exports.DEFAULT_VALUES = exports.COLORS = exports.PAGE_CONFIG = exports.SUPPORTED_COUNTRIES = void 0;
exports.validateValuationData = validateValuationData;
exports.applyDefaultValues = applyDefaultValues;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Logo path for Intaleks branding
const LOGO_PATH = path_1.default.join(__dirname, "../assets/intaleks.jpg");
/**
 * Maps addback reason codes to human-readable labels
 */
const ADDBACK_REASON_LABELS = {
    // Owner-Related Adjustments
    "owner-salary-adjustment": "Owner salary above/below market",
    "owner-superannuation": "Owner superannuation adjustment",
    "owner-bonuses": "Owner bonuses or drawings",
    "owner-insurance": "Owner personal insurance",
    "owner-subscriptions": "Owner personal subscriptions/memberships",
    // Family & Related Party
    "family-non-working": "Family members on payroll (non-working)",
    "family-wages-adjustment": "Family wages above/below market",
    "related-party-rent": "Above-market related-party rent",
    "related-party-management": "Related-party management fees",
    "related-party-charges": "Intercompany charges (non-market)",
    "related-party-loan": "Related-party loan interest",
    // Personal Expenses
    "personal-expenses": "Personal expenses through business",
    "personal-use-assets": "Personal use of company assets",
    "luxury-vehicles": "Luxury vehicle expenses",
    "excessive-travel": "Excessive travel or entertainment",
    "non-essential-events": "Non-essential conferences or events",
    // One-Off Expenses
    "one-off-legal": "One-off legal fees",
    "one-off-consulting": "One-off consulting fees",
    "abnormal-repairs": "Abnormal repairs and maintenance",
    "one-time-marketing": "One-time marketing campaigns",
    "relocation-costs": "Relocation costs",
    "restructuring-costs": "Restructuring costs",
    "covid-related": "COVID-related items",
    "one-off-bad-debts": "One-off bad debts",
    "redundancy-payments": "Redundancy payments",
    // Financial Adjustments
    "interest-expense": "Interest expense (financing)",
    "interest-income": "Interest income (non-operational)",
    "asset-sale-gain-loss": "Gain/loss on sale of assets",
    "unrealised-fx": "Unrealised FX gains/losses",
    "investment-income": "Investment income (non-core)",
    // Discretionary Expenses
    "donations-sponsorships": "Donations or sponsorships",
    "fines-penalties": "Fines or penalties",
    "charitable-contributions": "Charitable contributions",
    // Accounting Adjustments
    depreciation: "Depreciation",
    amortisation: "Amortisation",
    "abnormal-provisions": "Abnormal provisions",
    "inventory-writedowns": "Inventory write-downs (abnormal)",
    impairments: "Impairments",
    "accounting-policy-changes": "Changes in accounting policy",
    // Normalisation Adjustments
    "rent-normalisation": "Related-party rent normalisation",
    "vacant-role-adjustment": "Vacant role salary adjustment",
    "underpaid-staff": "Underpaid key staff adjustment",
    "temporary-labour": "Temporary labour (non-recurring)",
    "owner-multiple-roles": "Owner performing multiple roles",
};
/**
 * Formats addback reason for display in PDF
 */
function formatAddbackReason(reason) {
    return ADDBACK_REASON_LABELS[reason] || reason;
}
/**
 * Supported countries with their flag and currency configurations
 */
exports.SUPPORTED_COUNTRIES = {
    australia: {
        code: "AU",
        name: "Australia",
        flagEmoji: "🇦🇺",
        currency: "AUD",
        locale: "en-AU",
    },
    "united states": {
        code: "US",
        name: "United States",
        flagEmoji: "🇺🇸",
        currency: "USD",
        locale: "en-US",
    },
    "united kingdom": {
        code: "GB",
        name: "United Kingdom",
        flagEmoji: "🇬🇧",
        currency: "GBP",
        locale: "en-GB",
    },
    canada: {
        code: "CA",
        name: "Canada",
        flagEmoji: "🇨🇦",
        currency: "CAD",
        locale: "en-CA",
    },
    "new zealand": {
        code: "NZ",
        name: "New Zealand",
        flagEmoji: "🇳🇿",
        currency: "NZD",
        locale: "en-NZ",
    },
};
/**
 * Page configuration constants for A4 PDF generation
 */
exports.PAGE_CONFIG = {
    width: 595.28, // A4 width in points
    height: 841.89, // A4 height in points
    margin: 50,
    footerHeight: 40,
    footerY: 780, // Position footer with enough space for text (height - margin - footerHeight)
};
/**
 * Color constants for consistent PDF styling
 */
exports.COLORS = {
    primary: "#3b82f6", // Blue for branding
    text: "#1a1a1a", // Dark text
    muted: "#666666", // Footer text
    background: "#ffffff", // Page background
};
/**
 * Default placeholder values for missing required fields
 * Requirements: 6.3
 */
exports.DEFAULT_VALUES = {
    companyName: "Company Name Not Provided",
    country: "Australia",
    industry: "General",
};
/**
 * Validates valuation data for required fields
 * Requirements: 6.2 - Check for required fields: companyName, country, industry
 * @param data - Valuation data to validate
 * @returns ValidationResult with isValid flag and list of missing field names
 */
function validateValuationData(data) {
    const missingFields = [];
    if (!data) {
        return {
            isValid: false,
            missingFields: ["companyName", "country", "industry"],
        };
    }
    if (!data.companyName || data.companyName.trim() === "") {
        missingFields.push("companyName");
    }
    if (!data.country || data.country.trim() === "") {
        missingFields.push("country");
    }
    if (!data.industry || data.industry.trim() === "") {
        missingFields.push("industry");
    }
    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
}
/**
 * Applies default placeholder values for missing required fields
 * Requirements: 6.3 - Use default placeholder values for missing fields
 * @param data - Valuation data that may have missing fields
 * @returns Valuation data with defaults applied for missing required fields
 */
function applyDefaultValues(data) {
    return {
        ...data,
        companyName: data.companyName && data.companyName.trim() !== "" ? data.companyName : exports.DEFAULT_VALUES.companyName,
        country: data.country && data.country.trim() !== "" ? data.country : exports.DEFAULT_VALUES.country,
        industry: data.industry && data.industry.trim() !== "" ? data.industry : exports.DEFAULT_VALUES.industry,
    };
}
class PDFService {
    doc;
    pageWidth = 595.28; // A4 width in points
    pageHeight = 841.89; // A4 height in points
    margin = 50;
    contentWidth;
    currentY = 50;
    currentPage = 1;
    industry = "General";
    generatedDate = "";
    constructor() {
        this.doc = new pdfkit_1.default({
            size: "A4",
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        this.contentWidth = this.pageWidth - this.margin * 2;
    }
    /**
     * Renders the Intaleks logo from JPG file
     * @param x - X position
     * @param y - Y position
     * @param width - Logo width (height auto-calculated to maintain aspect ratio)
     */
    drawLogo(x, y, width = 120) {
        try {
            if (fs_1.default.existsSync(LOGO_PATH)) {
                this.doc.image(LOGO_PATH, x, y, { width });
            }
            else {
                // Fallback to text if logo file not found
                this.drawTextLogo(x, y, width > 100 ? 18 : 16);
            }
        }
        catch (error) {
            console.error("Error rendering logo:", error);
            this.drawTextLogo(x, y, width > 100 ? 18 : 16);
        }
    }
    /**
     * Fallback text-based logo rendering
     */
    drawTextLogo(x, y, fontSize = 16) {
        this.doc.fontSize(fontSize).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Thebiz", x, y, { continued: true }).fillColor(exports.COLORS.primary).text("valuer");
    }
    /**
     * Draws the page footer with industry, page number, and generation date
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     * @param metadata - Page metadata containing industry, page number, and date
     */
    drawPageFooter(metadata) {
        const footerY = exports.PAGE_CONFIG.footerY;
        // Save current font state
        const savedFontSize = 10;
        // Industry on left (Requirement 3.2)
        this.doc.fontSize(savedFontSize).font("Helvetica").fillColor(exports.COLORS.muted).text(`Industry: ${metadata.industry}`, this.margin, footerY);
        // Page number centered (Requirement 3.3)
        this.doc.fontSize(savedFontSize).font("Helvetica").fillColor(exports.COLORS.muted).text(`${metadata.pageNumber}`, 0, footerY, {
            width: this.pageWidth,
            align: "center",
        });
        // Generation date on right in "Report generated MMM DD, YYYY" format (Requirement 3.4)
        this.doc.fontSize(savedFontSize).font("Helvetica").fillColor(exports.COLORS.muted).text(`Report generated ${metadata.generatedDate}`, this.margin, footerY, {
            width: this.contentWidth,
            align: "right",
        });
    }
    /**
     * Formats a date string to "MMM DD, YYYY" format
     * @param dateString - Date string to format
     * @returns Formatted date string
     */
    formatDateForFooter(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // If invalid date, use current date
                return new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            }
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
        catch {
            return new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
    }
    /**
     * Adds a footer to the current page
     * Called after each page content is rendered
     */
    addFooterToCurrentPage() {
        const metadata = {
            pageNumber: this.currentPage,
            totalPages: 0, // Will be updated if needed
            industry: this.industry,
            generatedDate: this.generatedDate,
        };
        this.drawPageFooter(metadata);
    }
    /**
     * Draws the cover page with branding, country, logo, and company details
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
     */
    drawCoverPage(data) {
        // Header section - Country name in top-left (Requirement 1.3)
        const countryConfig = exports.SUPPORTED_COUNTRIES[data.country?.toLowerCase()] || null;
        const countryName = countryConfig?.name || this.capitalizeFirst(data.country || "Australia");
        const countryCode = countryConfig?.code || "";
        // Display country code in brackets instead of emoji (PDFKit doesn't support emoji well)
        const countryDisplay = countryCode ? `[${countryCode}] ${countryName}` : countryName;
        this.doc.fontSize(14).font("Helvetica").fillColor(exports.COLORS.text).text(countryDisplay, this.margin, this.margin);
        // Intaleks branding in top-right (Requirement 1.2)
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        // Center section - Logo (Requirement 1.4)
        const centerY = this.pageHeight / 2 - 100;
        this.renderLogo(data.logoBase64, data.logoMimeType, centerY);
        // Company name in blue below logo (Requirement 1.5)
        const companyNameY = centerY + 170;
        this.doc
            .fontSize(28)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.primary)
            .text(data.companyName || "Company Name Not Provided", this.margin, companyNameY, {
            align: "center",
            width: this.contentWidth,
        });
        // Company details below company name (Requirements 1.6, 1.7, 1.8)
        // Only show details if at least one field has a value
        const hasDetails = data.startedYear || data.employees || data.stage;
        if (hasDetails) {
            let detailsY = companyNameY + 50;
            // Started year (Requirement 1.6)
            if (data.startedYear) {
                this.doc.fontSize(14).font("Helvetica").fillColor(exports.COLORS.text).text(`Started in ${data.startedYear}`, this.margin, detailsY, {
                    align: "center",
                    width: this.contentWidth,
                });
                detailsY += 25;
            }
            // Number of employees (Requirement 1.7)
            if (data.employees) {
                this.doc.fontSize(14).font("Helvetica").fillColor(exports.COLORS.text).text(`Number of employees ${data.employees}`, this.margin, detailsY, {
                    align: "center",
                    width: this.contentWidth,
                });
                detailsY += 25;
            }
            // Stage (Requirement 1.8)
            if (data.stage) {
                const stageDisplay = this.formatStage(data.stage);
                this.doc.fontSize(14).font("Helvetica").fillColor(exports.COLORS.text).text(`Stage ${stageDisplay}`, this.margin, detailsY, {
                    align: "center",
                    width: this.contentWidth,
                });
            }
        }
    }
    /**
     * Formats the stage value for display
     */
    formatStage(stage) {
        const stageMap = {
            startup: "Start up",
            "1-2-years": "1-2 years in business",
            "3-5-years": "3-5 years in business",
            "5-10-years": "5-10 years in business",
            "10-plus-years": "10 years in business or more",
        };
        return stageMap[stage] || this.capitalizeFirst(stage);
    }
    /**
     * Renders the company logo or a placeholder if not provided
     * Requirements: 4.1, 4.2, 4.3, 4.4
     */
    renderLogo(logoBase64, mimeType, centerY) {
        const centerX = this.pageWidth / 2;
        const maxSize = 150;
        if (logoBase64 && mimeType) {
            try {
                const buffer = Buffer.from(logoBase64, "base64");
                // PDFKit handles aspect ratio with fit option
                this.doc.image(buffer, centerX - maxSize / 2, centerY, {
                    fit: [maxSize, maxSize],
                    align: "center",
                    valign: "center",
                });
            }
            catch (error) {
                // Fall back to placeholder on error
                console.error("Error rendering logo:", error);
                this.drawPlaceholderLogo(centerX, centerY + maxSize / 2);
            }
        }
        else {
            // Draw placeholder icon when no logo provided (Requirement 4.3)
            this.drawPlaceholderLogo(centerX, centerY + maxSize / 2);
        }
    }
    /**
     * Draws a placeholder icon when no company logo is provided
     */
    drawPlaceholderLogo(centerX, centerY) {
        const size = 80;
        const halfSize = size / 2;
        // Draw a rounded rectangle as placeholder
        this.doc.roundedRect(centerX - halfSize, centerY - halfSize, size, size, 10).fillAndStroke("#f1f5f9", "#e2e8f0");
        // Draw a simple building icon inside
        const iconSize = 40;
        const iconX = centerX - iconSize / 2;
        const iconY = centerY - iconSize / 2;
        // Building base
        this.doc.rect(iconX + 5, iconY + 10, iconSize - 10, iconSize - 10).fill("#94a3b8");
        // Building windows (2x2 grid)
        this.doc.fill("#f1f5f9");
        const windowSize = 8;
        const windowGap = 4;
        const startX = iconX + 10;
        const startY = iconY + 15;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                this.doc.rect(startX + col * (windowSize + windowGap), startY + row * (windowSize + windowGap), windowSize, windowSize);
            }
        }
        this.doc.fill("#f1f5f9");
    }
    formatCurrency(value) {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
    /**
     * Checks remaining space and adds a new page if content exceeds available space
     * Requirements: 2.2 - Automatic page break handling
     * @param requiredSpace - Space needed in points (default 100)
     * @returns true if a new page was added
     */
    checkPageBreak(requiredSpace = 100) {
        // Calculate available space accounting for footer
        const availableSpace = exports.PAGE_CONFIG.footerY - this.currentY;
        if (requiredSpace > availableSpace) {
            // Add footer to current page before breaking
            this.addFooterToCurrentPage();
            this.doc.addPage();
            this.currentPage++;
            this.currentY = this.margin;
            return true;
        }
        return false;
    }
    /**
     * Calculates the height needed for a table with given number of rows
     * @param headerHeight - Height of table header
     * @param rowHeight - Height of each row
     * @param rowCount - Number of rows
     * @returns Total height needed
     */
    calculateTableHeight(headerHeight, rowHeight, rowCount) {
        return headerHeight + rowHeight * rowCount;
    }
    drawHeader(data) {
        // Logo/Brand
        this.drawLogo(this.margin, this.currentY, 150);
        this.currentY += 40;
        // Title
        this.doc.fontSize(28).font("Helvetica-Bold").fillColor("#1a1a1a").text("Business Valuation Report", this.margin, this.currentY, {
            align: "center",
            width: this.contentWidth,
        });
        this.currentY += 50;
        // Company Info Box
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 80).fillAndStroke("#f8fafc", "#e2e8f0");
        this.currentY += 15;
        this.doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Company:", this.margin + 20, this.currentY)
            .font("Helvetica-Bold")
            .fillColor("#1a1a1a")
            .text(data.companyName || "Not Specified", this.margin + 100, this.currentY);
        this.currentY += 20;
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Industry:", this.margin + 20, this.currentY)
            .font("Helvetica-Bold")
            .fillColor("#1a1a1a")
            .text(this.capitalizeFirst(data.industry), this.margin + 100, this.currentY);
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Country:", this.margin + 250, this.currentY)
            .font("Helvetica-Bold")
            .fillColor("#1a1a1a")
            .text(this.capitalizeFirst(data.country), this.margin + 320, this.currentY);
        this.currentY += 20;
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Report Date:", this.margin + 20, this.currentY)
            .font("Helvetica-Bold")
            .fillColor("#1a1a1a")
            .text(data.generatedDate, this.margin + 100, this.currentY);
        this.currentY += 50;
    }
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    drawSectionHeader(title) {
        this.checkPageBreak(60);
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 30).fill("#3b82f6");
        this.doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text(title.toUpperCase(), this.margin + 15, this.currentY + 9);
        this.currentY += 40;
    }
    drawFinancialTable(data) {
        // Calculate total height needed for the table
        const headerHeight = 25;
        const rowHeight = 22;
        const metrics = [
            { key: "sales", label: "Sales/Revenue" },
            { key: "cogs", label: "Cost of Goods Sold" },
            { key: "grossProfit", label: "Gross Profit", highlight: true },
            { key: "operatingExpenses", label: "Operating Expenses" },
            { key: "ebit", label: "EBIT", highlight: true },
            { key: "interestExpense", label: "Interest Expense" },
            { key: "interestIncome", label: "Interest Income" },
            { key: "taxExpense", label: "Tax Expense" },
            { key: "netProfit", label: "Net Profit", highlight: true },
        ];
        // Check if we need a page break before starting the section
        const totalTableHeight = this.calculateTableHeight(headerHeight, rowHeight, metrics.length) + 60; // +60 for section header and padding
        this.checkPageBreak(Math.min(totalTableHeight, 200)); // At least fit header + a few rows
        this.drawSectionHeader("Financial Summary (3-Year Analysis)");
        const years = data.financialYears;
        const colWidth = (this.contentWidth - 150) / years.length;
        // Table Header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 25).fill("#f1f5f9");
        this.doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor("#475569")
            .text("METRIC", this.margin + 10, this.currentY + 8);
        years.forEach((year, i) => {
            this.doc.text(year, this.margin + 150 + i * colWidth, this.currentY + 8, {
                width: colWidth,
                align: "right",
            });
        });
        this.currentY += 25;
        // Table Rows with automatic page break handling (Requirement 2.2)
        metrics.forEach((metric, rowIndex) => {
            // Check if we need a page break before drawing this row
            if (this.checkPageBreak(rowHeight + 10)) {
                // Redraw table header on new page
                this.doc.rect(this.margin, this.currentY, this.contentWidth, 25).fill("#f1f5f9");
                this.doc
                    .fontSize(9)
                    .font("Helvetica-Bold")
                    .fillColor("#475569")
                    .text("METRIC (continued)", this.margin + 10, this.currentY + 8);
                years.forEach((year, i) => {
                    this.doc.text(year, this.margin + 150 + i * colWidth, this.currentY + 8, {
                        width: colWidth,
                        align: "right",
                    });
                });
                this.currentY += 25;
            }
            const bgColor = metric.highlight ? "#eff6ff" : rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc";
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 22).fill(bgColor);
            this.doc
                .fontSize(9)
                .font(metric.highlight ? "Helvetica-Bold" : "Helvetica")
                .fillColor(metric.highlight ? "#1e40af" : "#374151")
                .text(metric.label, this.margin + 10, this.currentY + 6);
            years.forEach((year, i) => {
                const value = data.financialData[year]?.[metric.key] || 0;
                this.doc.text(this.formatCurrency(value), this.margin + 150 + i * colWidth, this.currentY + 6, { width: colWidth - 10, align: "right" });
            });
            this.currentY += 22;
        });
        this.currentY += 20;
    }
    drawAddbacksTable(data) {
        // Filter out addbacks with no reason or value
        const validAddbacks = data.addbacks.filter((a) => {
            // Must have a reason that's not empty or placeholder
            const hasValidReason = a.reason && a.reason.trim() !== "" && a.reason !== "Enter reason";
            // Must have at least one year with a value > 0
            const hasValidValue = Object.values(a.values || {}).some((val) => val > 0);
            return hasValidReason && hasValidValue;
        });
        // Don't show addbacks section if no valid addbacks
        if (validAddbacks.length === 0)
            return;
        // Calculate height needed for addbacks table
        const headerHeight = 25;
        const rowHeight = 22;
        const totalRowHeight = 25;
        const totalHeight = headerHeight + rowHeight * validAddbacks.length + totalRowHeight + 60;
        // Check if we need a page break before starting (Requirement 2.2)
        this.checkPageBreak(Math.min(totalHeight, 150));
        this.drawSectionHeader("Addbacks / Adjustments");
        const years = data.financialYears || [];
        const colWidth = years.length > 0 ? (this.contentWidth - 200) / years.length : 100;
        // Table Header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 25).fill("#f1f5f9");
        this.doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor("#475569")
            .text("ADDBACK REASON", this.margin + 10, this.currentY + 8);
        years.forEach((year, i) => {
            this.doc.text(year, this.margin + 200 + i * colWidth, this.currentY + 8, {
                width: colWidth - 5,
                align: "center",
            });
        });
        this.currentY += 25;
        // Addback Rows with automatic page break handling (Requirement 2.2)
        validAddbacks.forEach((addback, i) => {
            // Check if we need a page break before drawing this row
            if (this.checkPageBreak(rowHeight + 10)) {
                // Redraw table header on new page
                this.doc.rect(this.margin, this.currentY, this.contentWidth, 25).fill("#f1f5f9");
                this.doc
                    .fontSize(9)
                    .font("Helvetica-Bold")
                    .fillColor("#475569")
                    .text("ADDBACK REASON (continued)", this.margin + 10, this.currentY + 8);
                years.forEach((year, idx) => {
                    this.doc.text(year, this.margin + 200 + idx * colWidth, this.currentY + 8, {
                        width: colWidth - 5,
                        align: "center",
                    });
                });
                this.currentY += 25;
            }
            const bgColor = i % 2 === 0 ? "#ffffff" : "#f8fafc";
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 22).fill(bgColor);
            // Format the reason using the label mapping
            const formattedReason = formatAddbackReason(addback.reason);
            this.doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#374151")
                .text(formattedReason, this.margin + 10, this.currentY + 6, {
                width: 180,
            });
            years.forEach((year, yearIdx) => {
                const value = addback.values?.[year] || 0;
                if (value > 0) {
                    this.doc.text(this.formatCurrency(value), this.margin + 200 + yearIdx * colWidth, this.currentY + 6, {
                        width: colWidth - 5,
                        align: "center",
                    });
                }
            });
            this.currentY += 22;
        });
        // Check page break before total row (Requirement 2.2)
        this.checkPageBreak(totalRowHeight + 20);
        // Total Row
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 25).fill("#1e40af");
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("TOTAL ADDBACKS", this.margin + 10, this.currentY + 7)
            .text(this.formatCurrency(data.totalAddbacks), this.margin + this.contentWidth - 110, this.currentY + 7, {
            width: 100,
            align: "right",
        });
        this.currentY += 40;
    }
    drawEbitSummary(data) {
        this.checkPageBreak(120);
        this.drawSectionHeader("EBIT Analysis");
        const summaryItems = [
            { label: "Average EBIT (3 Years)", value: data.averageEbit },
            { label: "Total Addbacks", value: data.totalAddbacks },
            { label: "Adjusted EBIT", value: data.adjustedEbit, highlight: true },
        ];
        summaryItems.forEach((item, i) => {
            const bgColor = item.highlight ? "#dbeafe" : i % 2 === 0 ? "#ffffff" : "#f8fafc";
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 30).fill(bgColor);
            this.doc
                .fontSize(11)
                .font(item.highlight ? "Helvetica-Bold" : "Helvetica")
                .fillColor(item.highlight ? "#1e40af" : "#374151")
                .text(item.label, this.margin + 15, this.currentY + 9)
                .text(this.formatCurrency(item.value), this.margin + this.contentWidth - 150, this.currentY + 9, {
                width: 140,
                align: "right",
            });
            this.currentY += 30;
        });
        this.currentY += 20;
    }
    drawValuationMethod(data) {
        this.checkPageBreak(200);
        const methodNames = {
            asset: "Asset-Based Valuation",
            profit: "Profit-Based Valuation (Capitalization of Earnings)",
        };
        this.drawSectionHeader(methodNames[data.valuationMethod]);
        if (data.valuationMethod === "asset") {
            this.drawAssetMethod(data);
        }
        else if (data.valuationMethod === "profit") {
            this.drawProfitMethod(data);
        }
    }
    drawAssetMethod(data) {
        // Check page break before assets section (Requirement 2.2)
        this.checkPageBreak(150);
        // Assets
        this.doc.fontSize(11).font("Helvetica-Bold").fillColor("#374151").text("ASSETS (Fair Market Value)", this.margin, this.currentY);
        this.currentY += 20;
        const assetItems = [
            { label: "Plant & Equipment", value: data.assets?.plantEquipment || 0 },
            { label: "Inventory", value: data.assets?.inventory || 0 },
            { label: "Vehicles", value: data.assets?.vehicles || 0 },
            { label: "Goodwill", value: data.assets?.goodwill || 0 },
            { label: "Other Intangible Assets", value: data.assets?.otherIntangible || 0 },
        ].filter((item) => item.value > 0); // Only show items with values
        // Only show assets if there are any
        if (assetItems.length > 0) {
            assetItems.forEach((item) => {
                // Check page break before each row (Requirement 2.2)
                this.checkPageBreak(25);
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor("#6b7280")
                    .text(item.label, this.margin + 20, this.currentY)
                    .text(this.formatCurrency(item.value), this.margin + this.contentWidth - 150, this.currentY, {
                    width: 140,
                    align: "right",
                });
                this.currentY += 18;
            });
        }
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#374151")
            .text("Total Assets", this.margin + 20, this.currentY)
            .text(this.formatCurrency(data.totalAssets || 0), this.margin + this.contentWidth - 150, this.currentY, {
            width: 140,
            align: "right",
        });
        this.currentY += 30;
        // Check page break before liabilities section (Requirement 2.2)
        this.checkPageBreak(120);
        // Liabilities
        this.doc.fontSize(11).font("Helvetica-Bold").fillColor("#374151").text("LIABILITIES", this.margin, this.currentY);
        this.currentY += 20;
        const liabilityItems = [
            { label: "Loans", value: data.liabilities?.loans || 0 },
            { label: "Annual Leave Provision", value: data.liabilities?.annualLeave || 0 },
            { label: "Long Service Leave", value: data.liabilities?.longServiceLeave || 0 },
            { label: "Other Liabilities", value: data.liabilities?.otherLiabilities || 0 },
        ].filter((item) => item.value > 0); // Only show items with values
        // Only show liabilities if there are any
        if (liabilityItems.length > 0) {
            liabilityItems.forEach((item) => {
                // Check page break before each row (Requirement 2.2)
                this.checkPageBreak(25);
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor("#6b7280")
                    .text(item.label, this.margin + 20, this.currentY)
                    .text(this.formatCurrency(item.value), this.margin + this.contentWidth - 150, this.currentY, {
                    width: 140,
                    align: "right",
                });
                this.currentY += 18;
            });
        }
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#374151")
            .text("Total Liabilities", this.margin + 20, this.currentY)
            .text(this.formatCurrency(data.totalLiabilities || 0), this.margin + this.contentWidth - 150, this.currentY, {
            width: 140,
            align: "right",
        });
        this.currentY += 30;
    }
    drawProfitMethod(data) {
        // Check page break before profit method content (Requirement 2.2)
        this.checkPageBreak(120);
        const items = [
            { label: "Adjusted EBIT", value: this.formatCurrency(data.adjustedEbit) },
            { label: "Capitalization Rate", value: `${data.capitalizationRate}%` },
            { label: "Equivalent Multiple", value: `${(100 / (data.capitalizationRate || 25)).toFixed(2)}x` },
        ];
        items.forEach((item) => {
            // Check page break before each row (Requirement 2.2)
            this.checkPageBreak(30);
            this.doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor("#6b7280")
                .text(item.label, this.margin + 20, this.currentY)
                .font("Helvetica-Bold")
                .fillColor("#374151")
                .text(item.value, this.margin + this.contentWidth - 150, this.currentY, {
                width: 140,
                align: "right",
            });
            this.currentY += 22;
        });
        this.currentY += 10;
        // Check page break before formula (Requirement 2.2)
        this.checkPageBreak(50);
        // Formula
        this.doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text(`Valuation = Adjusted EBIT ÷ Capitalization Rate × 100`, this.margin + 20, this.currentY);
        this.currentY += 15;
        this.doc.text(`Valuation = ${this.formatCurrency(data.adjustedEbit)} ÷ ${data.capitalizationRate}% × 100 = ${this.formatCurrency(data.profitValuation || 0)}`, this.margin + 20, this.currentY);
        this.currentY += 30;
    }
    // DCF Method removed - no longer supported
    drawFinalValuation(data) {
        // Check page break before final valuation box (Requirement 2.2)
        this.checkPageBreak(150);
        // Final Valuation Box
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 100).fill("#1e40af");
        this.doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("NET BUSINESS VALUATION", this.margin, this.currentY + 25, {
            align: "center",
            width: this.contentWidth,
        });
        this.doc
            .fontSize(36)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text(this.formatCurrency(data.finalValuation), this.margin, this.currentY + 50, {
            align: "center",
            width: this.contentWidth,
        });
        this.currentY += 120;
    }
    drawDisclaimer() {
        this.checkPageBreak(100);
        this.doc.fontSize(8).font("Helvetica").fillColor("#9ca3af").text("DISCLAIMER: This valuation report is provided for informational purposes only and should not be considered as financial, legal, or investment advice. The valuation is based on the data provided and standard valuation methodologies. Actual business value may vary based on market conditions, negotiations, and other factors. We recommend consulting with qualified professionals before making any business decisions based on this report.", this.margin, this.currentY, { width: this.contentWidth, align: "justify" });
        this.currentY += 60;
        // Footer
        this.doc.fontSize(9).font("Helvetica").fillColor("#6b7280").text(`Generated by Intaleks | ${new Date().toLocaleDateString()}`, this.margin, this.currentY, {
            align: "center",
            width: this.contentWidth,
        });
    }
    /**
     * Generates a single-page valuation report (legacy method)
     * @param data - Valuation data
     * @returns PDFKit document
     */
    generateValuationReport(data) {
        // Initialize page tracking data for footers (Requirements 1.9, 3.1)
        this.industry = this.capitalizeFirst(data.industry || "General");
        this.generatedDate = this.formatDateForFooter(data.generatedDate);
        this.currentPage = 1;
        this.drawHeader(data);
        this.drawFinancialTable(data);
        this.drawAddbacksTable(data);
        this.drawEbitSummary(data);
        this.drawValuationMethod(data);
        this.drawFinalValuation(data);
        this.drawDisclaimer();
        // Add footer to the final page
        this.addFooterToCurrentPage();
        return this.doc;
    }
    /**
     * Generates a multi-page valuation report with cover page
     * Requirements: 2.1 - Structure document with distinct pages
     * @param data - Extended valuation data including company questionnaire fields
     * @returns PDFKit document
     */
    generateMultiPageValuationReport(data) {
        // Initialize page tracking data for footers (Requirements 1.9, 3.1)
        this.industry = this.capitalizeFirst(data.industry || "General");
        this.generatedDate = this.formatDateForFooter(data.generatedDate);
        this.currentPage = 1;
        // Page 1: Cover Page (Requirement 2.1)
        this.drawCoverPage(data);
        this.addFooterToCurrentPage();
        // Page 2: Table of Contents
        this.addNewPage();
        this.drawTableOfContentsPage(data);
        this.addFooterToCurrentPage();
        // Page 3: Financial Data Tables (only for profit method)
        if (data.valuationMethod === "profit") {
            this.addNewPage();
            this.drawFinancialDataTablesPage(data);
            this.addFooterToCurrentPage();
        }
        // Page 4: Asset Method Valuation (only if asset method selected)
        if (data.valuationMethod === "asset") {
            this.addNewPage();
            this.drawAssetMethodPage(data);
            this.addFooterToCurrentPage();
        }
        // Page 5: Profit Method Valuation (only if profit method selected)
        if (data.valuationMethod === "profit") {
            this.addNewPage();
            this.drawProfitMethodPage(data);
            this.addFooterToCurrentPage();
        }
        // Page 6: Summary - Valuation Comparison
        this.addNewPage();
        this.drawSummaryPage(data);
        this.addFooterToCurrentPage();
        // Page 7: Outro - Intaleks branding
        this.addNewPage();
        this.drawOutroPage(data);
        this.addFooterToCurrentPage();
        return this.doc;
    }
    /**
     * Adds a new page and resets the Y position
     * Increments page counter for footer tracking
     */
    addNewPage() {
        this.doc.addPage();
        this.currentPage++;
        this.currentY = this.margin;
    }
    /**
     * Draws the Table of Contents page
     * Lists all sections with their page numbers
     */
    drawTableOfContentsPage(data) {
        // Intaleks branding in top-right
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        this.currentY = this.margin + 60;
        // Table of Content title
        this.doc.fontSize(18).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Table of Content", this.margin, this.currentY);
        this.currentY += 40;
        // Define TOC entries with page numbers based on selected method
        const tocEntries = [];
        tocEntries.push({ title: "Intro", page: 1, indent: 0, bold: true });
        if (data.valuationMethod === "profit") {
            tocEntries.push({ title: "Financial Data tables", page: 3, indent: 0, bold: true }, { title: "Accounting profit and loss", page: 3, indent: 1, bold: false }, { title: "Addbacks/Adjustments", page: 3, indent: 1, bold: false }, { title: "Profit method table", page: 4, indent: 0, bold: true }, { title: "Summary(TL;DR)", page: 5, indent: 0, bold: true }, { title: "Thebizevaluer", page: 6, indent: 0, bold: true });
        }
        else if (data.valuationMethod === "asset") {
            tocEntries.push({ title: "Asset method table", page: 3, indent: 0, bold: true }, { title: "Summary(TL;DR)", page: 4, indent: 0, bold: true }, { title: "Thebizevaluer", page: 5, indent: 0, bold: true });
        }
        const pageNumX = this.pageWidth - this.margin - 30;
        tocEntries.forEach((entry) => {
            const indentX = this.margin + entry.indent * 20;
            const fontSize = entry.bold ? 12 : 11;
            const fontStyle = entry.bold ? "Helvetica-Bold" : "Helvetica";
            const textColor = entry.bold ? exports.COLORS.text : exports.COLORS.muted;
            // Entry title
            this.doc.fontSize(fontSize).font(fontStyle).fillColor(textColor).text(entry.title, indentX, this.currentY);
            // Page number (right-aligned)
            this.doc.fontSize(fontSize).font(fontStyle).fillColor(textColor).text(String(entry.page), pageNumX, this.currentY, {
                width: 30,
                align: "right",
            });
            this.currentY += entry.bold ? 28 : 22;
        });
    }
    /**
     * Draws the Financial Data Tables page with accounting profit/loss and addbacks
     * Matches the design with EBIT calculated and total addbacks summary boxes
     */
    drawFinancialDataTablesPage(data) {
        // Intaleks branding in top-right
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        this.currentY = this.margin + 50;
        // Page title
        this.doc.fontSize(16).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Financial Data", this.margin, this.currentY);
        this.currentY += 30;
        // ACCOUNTING PROFIT AND LOSS section header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill(exports.COLORS.primary);
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("ACCOUNTING PROFIT AND LOSS", this.margin + 10, this.currentY + 7);
        this.currentY += 34;
        // Get years from data
        const years = data.financialYears || ["2023", "2024", "2025"];
        const colWidth = (this.contentWidth - 120) / years.length;
        // Table header row
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 22).fill("#f8fafc");
        this.doc
            .fontSize(8)
            .font("Helvetica-Bold")
            .fillColor("#475569")
            .text("METRIC", this.margin + 10, this.currentY + 7);
        years.forEach((year, i) => {
            const yearLabel = i === 0 ? `2 YEAR PREVIOUS(${year})` : i === 1 ? `1 YEAR PREVIOUS(${year})` : `LAST FINANCIAL YEAR(${year})`;
            this.doc.text(yearLabel, this.margin + 120 + i * colWidth, this.currentY + 7, { width: colWidth - 5, align: "center" });
        });
        this.currentY += 22;
        // Financial metrics rows - only show rows that have at least one non-zero value
        const metrics = [
            { key: "sales", label: "Sales" },
            { key: "grossProfit", label: "Gross profit" },
            { key: "cogs", label: "COGS" },
            { key: "operatingExpenses", label: "Wages & on Costs" },
            { key: "netProfit", label: "Net profit and Loss" },
            { key: "interestExpense", label: "Interest Expense" },
            { key: "interestIncome", label: "Interest Income" },
        ];
        metrics.forEach((metric, rowIndex) => {
            // Check if this metric has any non-zero values across all years
            const hasValue = years.some((year) => {
                const value = data.financialData?.[year]?.[metric.key];
                return value !== undefined && value !== 0;
            });
            // Skip this row if no values exist
            if (!hasValue)
                return;
            const bgColor = rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc";
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 20).fill(bgColor);
            this.doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#374151")
                .text(metric.label, this.margin + 10, this.currentY + 6);
            years.forEach((year, i) => {
                const value = data.financialData?.[year]?.[metric.key];
                if (value !== undefined && value !== 0) {
                    this.doc
                        .fontSize(9)
                        .font("Helvetica")
                        .fillColor("#374151")
                        .text(this.formatCurrency(value), this.margin + 120 + i * colWidth, this.currentY + 6, { width: colWidth - 5, align: "center" });
                }
            });
            this.currentY += 20;
        });
        // EBIT CALCULATED row (highlighted)
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill("#e0f2fe");
        this.doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor("#0c4a6e")
            .text("EBIT CALCULATED", this.margin + 10, this.currentY + 7);
        years.forEach((year, i) => {
            const ebit = data.financialData?.[year]?.ebit;
            const displayValue = ebit !== undefined ? this.formatCurrency(ebit) : "$0";
            this.doc
                .fontSize(9)
                .font("Helvetica-Bold")
                .fillColor("#0c4a6e")
                .text(displayValue, this.margin + 120 + i * colWidth, this.currentY + 7, { width: colWidth - 5, align: "center" });
        });
        this.currentY += 40;
        // ADDBACKS/ADJUSTMENTS section header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill(exports.COLORS.primary);
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("ADDBACKS/ADJUSTMENTS", this.margin + 10, this.currentY + 7);
        this.currentY += 34;
        // Get years from data for addbacks section
        const addbackYears = data.financialYears || ["2023", "2024", "2025"];
        const addbackColWidth = (this.contentWidth - 200) / addbackYears.length;
        // Filter valid addbacks (only those with reason and at least one non-zero value)
        const validAddbacks = (data.addbacks || []).filter((a) => {
            // Must have a reason that's not empty or placeholder
            const hasValidReason = a.reason && a.reason.trim() !== "" && a.reason !== "Enter reason";
            // Must have at least one year with a value > 0
            const hasValidValue = Object.values(a.values || {}).some((val) => val > 0);
            return hasValidReason && hasValidValue;
        });
        // Only show addbacks section if there are valid addbacks
        if (validAddbacks.length > 0) {
            // Addbacks table header
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 22).fill("#f8fafc");
            this.doc
                .fontSize(8)
                .font("Helvetica-Bold")
                .fillColor("#475569")
                .text("ADDBACK REASON", this.margin + 10, this.currentY + 7);
            addbackYears.forEach((year, i) => {
                const yearLabel = i === 0 ? `${year}` : i === 1 ? `${year}` : `${year}`;
                this.doc.text(yearLabel, this.margin + 200 + i * addbackColWidth, this.currentY + 7, { width: addbackColWidth - 5, align: "center" });
            });
            this.currentY += 22;
            // Addback rows - only show valid addbacks
            validAddbacks.forEach((addback, i) => {
                const bgColor = i % 2 === 0 ? "#ffffff" : "#f8fafc";
                this.doc.rect(this.margin, this.currentY, this.contentWidth, 20).fill(bgColor);
                const formattedReason = formatAddbackReason(addback.reason);
                this.doc
                    .fontSize(9)
                    .font("Helvetica")
                    .fillColor("#374151")
                    .text(formattedReason, this.margin + 10, this.currentY + 6, { width: 180 });
                addbackYears.forEach((year, yearIdx) => {
                    const value = addback.values?.[year] || 0;
                    if (value > 0) {
                        this.doc
                            .fontSize(9)
                            .font("Helvetica")
                            .fillColor("#374151")
                            .text(this.formatCurrency(value), this.margin + 200 + yearIdx * addbackColWidth, this.currentY + 6, { width: addbackColWidth - 5, align: "center" });
                    }
                });
                this.currentY += 20;
            });
        }
        else {
            // If no addbacks, skip the table entirely and just show a note
            this.doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#9ca3af")
                .text("No addbacks/adjustments recorded", this.margin + 10, this.currentY);
            this.currentY += 22;
        }
        // TOTAL ADDBACKS row - show totals per year
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill("#0c4a6e");
        this.doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("TOTAL ADDBACKS", this.margin + 10, this.currentY + 7);
        addbackYears.forEach((year, i) => {
            const yearTotal = (data.addbacks || []).reduce((sum, addback) => sum + (addback.values?.[year] || 0), 0);
            this.doc
                .fontSize(9)
                .font("Helvetica-Bold")
                .fillColor("#ffffff")
                .text(this.formatCurrency(yearTotal), this.margin + 200 + i * addbackColWidth, this.currentY + 7, { width: addbackColWidth - 5, align: "center" });
        });
        this.currentY += 50;
        // Summary boxes at bottom
        const boxWidth = 280;
        const boxHeight = 60;
        const boxX = (this.pageWidth - boxWidth) / 2;
        // EBIT Calculated box
        this.doc.rect(boxX, this.currentY, boxWidth, boxHeight).fillAndStroke("#f8fafc", "#e2e8f0");
        this.doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#64748b")
            .text(`EBIT Calculated (${years.join(",")})`, boxX, this.currentY + 12, { width: boxWidth, align: "center" });
        // Get EBIT values for each year
        const ebitValues = years.map((year) => {
            const ebit = data.financialData?.[year]?.ebit;
            return ebit !== undefined ? this.formatCurrency(ebit) : "$0";
        });
        this.doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(ebitValues.join(",  "), boxX, this.currentY + 30, { width: boxWidth, align: "center" });
        this.currentY += boxHeight + 15;
        // Total Addbacks box
        this.doc.rect(boxX, this.currentY, boxWidth, boxHeight).fillAndStroke("#f8fafc", "#e2e8f0");
        this.doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Total Addbacks", boxX, this.currentY + 12, { width: boxWidth, align: "center" });
        this.doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(this.formatCurrency(data.totalAddbacks || 0), boxX, this.currentY + 30, { width: boxWidth, align: "center" });
    }
    /**
     * Draws the Asset Method valuation page
     * Shows assets, liabilities, and net business valuation
     * Only displays items with actual values
     */
    drawAssetMethodPage(data) {
        // Intaleks branding in top-right
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        this.currentY = this.margin + 50;
        // Page title
        this.doc.fontSize(16).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Asset Method", this.margin, this.currentY);
        this.currentY += 30;
        // ASSET BASED VALUATION METHOD section header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill(exports.COLORS.primary);
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("ASSET BASED VALUATION METHOD", this.margin + 10, this.currentY + 7);
        this.currentY += 40;
        const inputBoxWidth = 200;
        const inputBoxX = this.margin + 180;
        // Asset items - filter to only show items with values
        const assetItems = [
            { label: "Plant and Equipments(FMV)", value: data.assets?.plantEquipment },
            { label: "Inventory(FMV)", value: data.assets?.inventory },
            { label: "Vehicles(FMV)", value: data.assets?.vehicles },
            { label: "Goodwill(FMV)", value: data.assets?.goodwill },
            { label: "Other intangible Assets(FMV)", value: data.assets?.otherIntangible },
        ].filter((item) => item.value !== undefined && item.value !== null && item.value > 0);
        // Only show ASSETS section if there are any assets
        if (assetItems.length > 0) {
            // ASSETS (FAIR MARKET VALUE) subsection
            this.doc
                .fontSize(11)
                .font("Helvetica-Bold")
                .fillColor(exports.COLORS.text)
                .text("ASSETS (FAIR MARKET VALUE)", this.margin + 10, this.currentY);
            this.currentY += 25;
            assetItems.forEach((item) => {
                // Label
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(item.label, this.margin + 20, this.currentY + 8);
                // Input box
                this.doc.rect(inputBoxX, this.currentY, inputBoxWidth, 28).fillAndStroke("#f8fafc", "#e2e8f0");
                // Value
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(item.value), inputBoxX + 10, this.currentY + 8);
                this.currentY += 32;
            });
            // Total Assets row (only if we have assets)
            if (data.totalAssets !== undefined && data.totalAssets !== null && data.totalAssets !== 0) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text("Total Assets", this.margin + 20, this.currentY + 5);
                this.doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.totalAssets), inputBoxX + inputBoxWidth + 20, this.currentY + 5, { width: 80, align: "right" });
                this.currentY += 35;
            }
        }
        // Liability items - filter to only show items with values
        const liabilityItems = [
            { label: "Loans", value: data.liabilities?.loans },
            { label: "Annual Leave Provision", value: data.liabilities?.annualLeave },
            { label: "Long Service Leave Provision", value: data.liabilities?.longServiceLeave },
            { label: "Other Liabilities", value: data.liabilities?.otherLiabilities },
        ].filter((item) => item.value !== undefined && item.value !== null && item.value > 0);
        // Only show LIABILITIES section if there are any liabilities
        if (liabilityItems.length > 0) {
            // LIABILITIES subsection
            this.doc
                .fontSize(11)
                .font("Helvetica-Bold")
                .fillColor(exports.COLORS.text)
                .text("LIABILITIES", this.margin + 10, this.currentY);
            this.currentY += 25;
            liabilityItems.forEach((item) => {
                // Label
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(item.label, this.margin + 20, this.currentY + 8);
                // Input box
                this.doc.rect(inputBoxX, this.currentY, inputBoxWidth, 28).fillAndStroke("#f8fafc", "#e2e8f0");
                // Value
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(item.value), inputBoxX + 10, this.currentY + 8);
                this.currentY += 32;
            });
            // Total Liabilities row (only if we have liabilities)
            if (data.totalLiabilities !== undefined && data.totalLiabilities !== null && data.totalLiabilities !== 0) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text("Total Liabilities", this.margin + 20, this.currentY + 5);
                this.doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.totalLiabilities), inputBoxX + inputBoxWidth + 20, this.currentY + 5, { width: 80, align: "right" });
                this.currentY += 35;
            }
        }
        // Net Business Valuation box (only if we have a valuation)
        if (data.assetValuation !== undefined && data.assetValuation !== null && data.assetValuation !== 0) {
            this.currentY += 15;
            const boxWidth = this.contentWidth - 40;
            const boxHeight = 80;
            const boxX = this.margin + 20;
            this.doc.rect(boxX, this.currentY, boxWidth, boxHeight).fill("#0c4a6e");
            this.doc
                .fontSize(11)
                .font("Helvetica")
                .fillColor("#ffffff")
                .text("Net Business Valuation (Asset Method)", boxX, this.currentY + 18, { width: boxWidth, align: "center" });
            this.doc
                .fontSize(32)
                .font("Helvetica-Bold")
                .fillColor("#ffffff")
                .text(this.formatCurrency(data.assetValuation), boxX, this.currentY + 40, { width: boxWidth, align: "center" });
        }
    }
    /**
     * Draws the Profit Method valuation page
     * Shows core valuation data, capitalization rate, and adjusted earnings calculation
     * Only displays sections with actual data
     */
    drawProfitMethodPage(data) {
        // Intaleks branding in top-right
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        this.currentY = this.margin + 50;
        // Page title
        this.doc.fontSize(16).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Profit Method", this.margin, this.currentY);
        this.currentY += 30;
        // PROFIT BASED VALUATION section header
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 24).fill(exports.COLORS.primary);
        this.doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#ffffff")
            .text("PROFIT BASED VALUATION (Capitalization of Earnings)", this.margin + 10, this.currentY + 7);
        this.currentY += 40;
        // Check if we have any core valuation data to show
        const hasAverageEbit = data.averageEbit !== undefined && data.averageEbit !== null && data.averageEbit !== 0;
        const hasTotalAddbacks = data.totalAddbacks !== undefined && data.totalAddbacks !== null && data.totalAddbacks !== 0;
        const hasAdjustedEbit = data.adjustedEbit !== undefined && data.adjustedEbit !== null && data.adjustedEbit !== 0;
        // Only show CORE VALUATION DATA section if we have data
        if (hasAverageEbit || hasTotalAddbacks) {
            this.doc
                .fontSize(10)
                .font("Helvetica-Bold")
                .fillColor(exports.COLORS.text)
                .text("CORE VALUATION DATA(Last 3 Years)", this.margin + 10, this.currentY);
            this.currentY += 20;
            const boxWidth = this.contentWidth - 20;
            const boxX = this.margin + 10;
            // Calculate dynamic box height based on what we're showing
            const rowHeight = 20;
            const baseHeight = 30; // padding + label
            const dataRows = (hasAverageEbit ? 1 : 0) + (hasTotalAddbacks ? 1 : 0);
            const boxHeight = baseHeight + dataRows * rowHeight;
            this.doc.rect(boxX, this.currentY, boxWidth, boxHeight).fillAndStroke("#f8fafc", "#e2e8f0");
            // *Calculated from Financial Data label
            this.doc
                .fontSize(8)
                .font("Helvetica")
                .fillColor("#9ca3af")
                .text("*Calculated from Financial Data", boxX + 10, this.currentY + 8);
            let dataY = this.currentY + 28;
            // Average EBIT row (only if has value)
            if (hasAverageEbit) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text("Average EBIT", boxX + 10, dataY);
                this.doc
                    .fontSize(14)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.averageEbit), boxX + boxWidth - 120, dataY - 2, { width: 100, align: "right" });
                dataY += rowHeight;
            }
            // Total Addbacks row (only if has value)
            if (hasTotalAddbacks) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text("Total Addbacks", boxX + 10, dataY);
                this.doc
                    .fontSize(14)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.totalAddbacks), boxX + boxWidth - 120, dataY - 2, { width: 100, align: "right" });
            }
            this.currentY += boxHeight + 20;
        }
        // Multiple Applied section (always show as it has a default)
        this.doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Multiple Applied (as a %)", this.margin + 10, this.currentY);
        this.currentY += 15;
        const boxWidth = this.contentWidth - 20;
        const boxX = this.margin + 10;
        // Multiple Applied input box
        this.doc.rect(boxX, this.currentY, 200, 32).fillAndStroke("#ffffff", "#e2e8f0");
        const capRate = data.capitalizationRate || 25;
        this.doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor(exports.COLORS.text)
            .text(String(capRate), boxX + 15, this.currentY + 10);
        this.doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor(exports.COLORS.text)
            .text("%", boxX + 180, this.currentY + 10);
        // Equivalent Multiple note
        const multiple = (100 / capRate).toFixed(2);
        this.doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor("#9ca3af")
            .text(`*Equivalent Multiple: ${multiple}x`, boxX + 220, this.currentY + 12);
        this.currentY += 50;
        // Adjusted Earnings Calculation section (only if we have data)
        if (hasAverageEbit || hasTotalAddbacks || hasAdjustedEbit) {
            // Calculate dynamic box height
            const calcRows = (hasAverageEbit ? 1 : 0) + (hasTotalAddbacks ? 1 : 0) + (hasAdjustedEbit ? 1 : 0);
            const calcBoxHeight = 30 + calcRows * 20;
            this.doc.rect(boxX, this.currentY, boxWidth, calcBoxHeight).fillAndStroke("#f8fafc", "#e2e8f0");
            this.doc
                .fontSize(9)
                .font("Helvetica")
                .fillColor("#64748b")
                .text("Adjusted Earnings Calculation", boxX + 10, this.currentY + 8);
            let calcY = this.currentY + 28;
            // Average EBIT (only if has value)
            if (hasAverageEbit) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text("Average EBIT", boxX + 10, calcY);
                this.doc
                    .fontSize(12)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.averageEbit), boxX + boxWidth - 120, calcY - 2, { width: 100, align: "right" });
                calcY += 20;
            }
            // Total Addbacks (only if has value)
            if (hasTotalAddbacks) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text("Total Addbacks", boxX + 10, calcY);
                this.doc
                    .fontSize(12)
                    .font("Helvetica")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.totalAddbacks), boxX + boxWidth - 120, calcY - 2, { width: 100, align: "right" });
                calcY += 20;
            }
            // Adjusted EBIT (only if has value)
            if (hasAdjustedEbit) {
                this.doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text("Adjusted EBIT", boxX + 10, calcY);
                this.doc
                    .fontSize(14)
                    .font("Helvetica-Bold")
                    .fillColor(exports.COLORS.text)
                    .text(this.formatCurrency(data.adjustedEbit), boxX + boxWidth - 120, calcY - 2, { width: 100, align: "right" });
            }
            this.currentY += calcBoxHeight + 30;
        }
        // Net Business Valuation box (only if we have a valuation)
        if (data.profitValuation !== undefined && data.profitValuation !== null && data.profitValuation !== 0) {
            const valuationBoxWidth = this.contentWidth - 80;
            const valuationBoxX = this.margin + 40;
            this.doc.rect(valuationBoxX, this.currentY, valuationBoxWidth, 70).fillAndStroke("#f8fafc", "#e2e8f0");
            this.doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor("#64748b")
                .text("Net Business Valuation (Profit Method)", valuationBoxX, this.currentY + 12, { width: valuationBoxWidth, align: "center" });
            this.doc
                .fontSize(28)
                .font("Helvetica-Bold")
                .fillColor(exports.COLORS.text)
                .text(this.formatCurrency(data.profitValuation), valuationBoxX, this.currentY + 35, { width: valuationBoxWidth, align: "center" });
        }
    }
    /**
     * DCF Method removed - no longer supported
     */
    /**
     * Draws the financial summary page with tables and EBIT analysis
     * Requirements: 2.1 - Financial summary page
     */
    drawFinancialSummaryPage(data) {
        // Page header
        this.drawPageHeader("Financial Summary");
        // Company info summary
        this.drawCompanyInfoSummary(data);
        // Financial table
        this.drawFinancialTable(data);
        // Addbacks table
        this.drawAddbacksTable(data);
        // EBIT summary
        this.drawEbitSummary(data);
    }
    /**
     * Draws the valuation method details page
     * Requirements: 2.1 - Valuation method details page
     */
    drawValuationMethodPage(data) {
        // Page header
        this.drawPageHeader("Valuation Analysis");
        // Draw the valuation method details
        this.drawValuationMethod(data);
    }
    /**
     * Draws the final valuation page with result and disclaimer
     * Requirements: 2.1 - Final valuation page
     */
    drawFinalValuationPage(data) {
        // Page header
        this.drawPageHeader("Valuation Result");
        // Final valuation box
        this.drawFinalValuation(data);
        // Disclaimer
        this.drawDisclaimer();
    }
    /**
     * Draws a page header with title
     * @param title - Page title
     */
    drawPageHeader(title) {
        // Intaleks branding
        this.drawLogo(this.margin, this.currentY, 120);
        this.currentY += 30;
        // Page title
        this.doc.fontSize(22).font("Helvetica-Bold").fillColor(exports.COLORS.text).text(title, this.margin, this.currentY, {
            align: "center",
            width: this.contentWidth,
        });
        this.currentY += 40;
    }
    /**
     * Draws a compact company info summary box
     * @param data - Valuation data
     */
    drawCompanyInfoSummary(data) {
        // Company Info Box
        this.doc.rect(this.margin, this.currentY, this.contentWidth, 60).fillAndStroke("#f8fafc", "#e2e8f0");
        const boxY = this.currentY + 12;
        const col1X = this.margin + 20;
        const col2X = this.margin + 250;
        this.doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Company:", col1X, boxY)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(data.companyName || "Not Specified", col1X + 70, boxY);
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Country:", col2X, boxY)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(this.capitalizeFirst(data.country || "Australia"), col2X + 60, boxY);
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Industry:", col1X, boxY + 20)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(this.capitalizeFirst(data.industry || "General"), col1X + 70, boxY + 20);
        this.doc
            .font("Helvetica")
            .fillColor("#64748b")
            .text("Report Date:", col2X, boxY + 20)
            .font("Helvetica-Bold")
            .fillColor(exports.COLORS.text)
            .text(data.generatedDate, col2X + 70, boxY + 20);
        this.currentY += 75;
    }
    /**
     * Draws the Summary page with valuation result
     * Shows only the selected method's valuation if it has a value
     */
    drawSummaryPage(data) {
        // Intaleks branding in top-right
        const brandingX = this.pageWidth - this.margin - 120;
        this.drawLogo(brandingX, this.margin, 120);
        this.currentY = this.margin + 50;
        // Page title
        this.doc.fontSize(16).font("Helvetica-Bold").fillColor(exports.COLORS.text).text("Summary", this.margin, this.currentY);
        this.currentY += 40;
        // Determine which valuation to show
        const methodLabel = data.valuationMethod === "profit" ? "Profit Method" : "Asset Method";
        const valuationAmount = data.valuationMethod === "profit" ? data.profitValuation : data.assetValuation;
        // Only show valuation box if we have a value
        if (valuationAmount !== undefined && valuationAmount !== null && valuationAmount !== 0) {
            const boxWidth = 350;
            const boxHeight = 100;
            const boxX = (this.pageWidth - boxWidth) / 2;
            this.doc.rect(boxX, this.currentY, boxWidth, boxHeight).fillAndStroke("#f1f5f9", "#e2e8f0");
            this.doc
                .fontSize(12)
                .font("Helvetica")
                .fillColor("#64748b")
                .text("Net Business Valuation", boxX, this.currentY + 20, { width: boxWidth, align: "center" });
            this.doc
                .fontSize(12)
                .font("Helvetica-Bold")
                .fillColor("#64748b")
                .text(`(${methodLabel})`, boxX, this.currentY + 36, { width: boxWidth, align: "center" });
            this.doc
                .fontSize(28)
                .font("Helvetica-Bold")
                .fillColor(exports.COLORS.text)
                .text(this.formatCurrency(valuationAmount), boxX, this.currentY + 58, { width: boxWidth, align: "center" });
        }
        else {
            // If no valuation, show a message
            this.doc.fontSize(12).font("Helvetica").fillColor("#9ca3af").text("Valuation calculation in progress. Please complete all required fields.", this.margin, this.currentY, {
                width: this.contentWidth,
                align: "center",
            });
        }
        this.currentY += 140;
    }
    /**
     * Draws the Outro page with Intaleks branding centered
     */
    drawOutroPage(data) {
        // Center the branding vertically on the page
        const centerY = this.pageHeight / 2 - 50;
        const logoWidth = 300;
        const logoX = (this.pageWidth - logoWidth) / 2;
        // Large centered Intaleks logo
        this.drawLogo(logoX, centerY, logoWidth);
        // Website URL below
        this.doc
            .fontSize(14)
            .font("Helvetica")
            .fillColor(exports.COLORS.muted)
            .text("intaleks.com", this.margin, centerY + 80, { width: this.contentWidth, align: "center" });
    }
}
exports.PDFService = PDFService;
