import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PAGE = {
  width: 595,
  height: 842,
  marginX: 50,
};
const FONT_REGULAR = "Inter";
const FONT_MEDIUM = "Inter-Medium";
const FONT_SEMIBOLD = "Inter-SemiBold";
const FONT_BOLD = "Inter-Bold";

type PdfFonts = {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
};

const COUNTRY_CURRENCY_MAP: Record<string, { symbol: string; code: string }> = {
  australia: { symbol: "$", code: "AUD" },
  "united states": { symbol: "$", code: "USD" },
  "united kingdom": { symbol: "£", code: "GBP" },
  canada: { symbol: "$", code: "CAD" },
  china: { symbol: "¥", code: "CNY" },
  indonesia: { symbol: "Rp", code: "IDR" },
};

/** Returns a formatted currency string, e.g. "$50 AUD", "£50", "¥50" */
function formatMoney(value: number, symbol: string, code: string): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  const formatted = safe.toLocaleString("en-US");
  // Append ISO code for dollar currencies to disambiguate
  const suffix = code === "AUD" || code === "CAD" || code === "USD" ? ` ${code}` : "";
  return `${symbol}${formatted}${suffix}`;
}

/** Returns a formatted currency string without the ISO code suffix — used in table cells */
function formatMoneyNoCode(value: number, symbol: string): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return `${symbol}${safe.toLocaleString("en-US")}`;
}

function getCurrencySymbolForCountry(country?: string): string {
  if (!country) return "$";
  return COUNTRY_CURRENCY_MAP[country.toLowerCase()]?.symbol ?? "$";
}

function getCurrencyCodeForCountry(country?: string): string {
  if (!country) return "AUD";
  return COUNTRY_CURRENCY_MAP[country.toLowerCase()]?.code ?? "AUD";
}

export interface RAVDAData {
  companyName?: string;
  country?: string;
  currencySymbol?: string;
  /** ISO 4217 currency code, e.g. "AUD", "USD", "CAD" */
  currencyCode?: string;
  industry?: string;
  generatedDate?: string;
  calculatedMultiple?: number;
  multipleSource?: "questionnaire" | "industry" | "custom";
  questionnaireScore?: number;
  score?: number;
  valuationMethod?: "profit" | "asset" | "dcf";
  finalValuation?: number;
  financialYears?: string[];
  financialData?: Record<
    string,
    {
      sales: number;
      otherIncome: number;
      cogs: number;
      grossProfit: number;
      operatingExpenses: number;
      netProfitAndLoss: number;
      interestExpense: number;
      interestIncome: number;
      ebit: number;
    }
  >;
  addbacks?: Array<{
    id: string;
    reason: string;
    customReason?: string;
    values: Record<string, number>;
  }>;
  totalAddbacks?: number;
  /**
   * Per-year Adjusted EBIT values.
   * adjustedEbitPerYear[yearLabel] = EBIT_year + Addbacks_year for that year.
   */
  adjustedEbitPerYear?: Record<string, number>;
  /**
   * Per-year total add-backs.
   * totalAddbacksPerYear[yearLabel] = sum of all add-back items for that year.
   */
  totalAddbacksPerYear?: Record<string, number>;
  assets?: {
    cashAndBank_bv?: number;
    cashAndBank_fmv?: number;
    accountsReceivable_bv?: number;
    accountsReceivable_fmv?: number;
    inventory_bv?: number;
    inventory_fmv?: number;
    plantEquipment_bv?: number;
    plantEquipment_fmv?: number;
    vehicles_bv?: number;
    vehicles_fmv?: number;
    realEstate_bv?: number;
    realEstate_fmv?: number;
    intellectualProperty_bv?: number;
    intellectualProperty_fmv?: number;
    otherAssets_bv?: number;
    otherAssets_fmv?: number;
    landUseRights_bv?: number;
    landUseRights_fmv?: number;
  };
  liabilities?: {
    liabilities_bv?: number;
    liabilities_fmv?: number;
    accountsPayable_bv?: number;
    accountsPayable_fmv?: number;
    loansAndDebt_bv?: number;
    loansAndDebt_fmv?: number;
    otherLiabilities_bv?: number;
    otherLiabilities_fmv?: number;
  };
  totalAssets?: number;
  totalLiabilities?: number;
  averageEbit?: number;
  adjustedEbit?: number;
  // Equity Value (China & Indonesia only)
  totalDebt?: number;
  cashEquivalents?: number;
  equityValue?: number;
  drivers?: {
    strong: string[];
    average: string[];
    weak: string[];
  };
  logoBase64?: string;
  logoMimeType?: string;
  /** Days in each reporting period, keyed by the year label string */
  daysInPeriod?: Record<string, number>;
  questionnaireResponses?: {
    ownerDependence: number;
    recurringRevenue: number;
    customerConcentration: number;
    managementDepth: number;
    growthRate: number;
    competitiveAdvantage: number;
    revenueDiversification: number;
    systemsScalability: number;
    marginStability: number;
    externalRisk: number;
  };
}

function formatGeneratedDate(input?: string): string {
  if (!input) {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${now.getDate()} ${month}, ${now.getFullYear()}`;
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    const month = parsed.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${parsed.getDate()} ${month}, ${parsed.getFullYear()}`;
  }

  return input.toUpperCase();
}

function toDisplayLabel(value?: string): string {
  if (!value) return "";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function sanitizeCountry(value?: string): string {
  if (!value) return "";
  // Remove regional indicator emoji flags and trim extra spaces
  const cleaned = value.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").trim();
  return toDisplayLabel(cleaned);
}

function fitTitleFontSize(doc: PDFKit.PDFDocument, text: string, fontName: string, min: number, max: number, width: number): number {
  let size = max;
  while (size > min) {
    doc.font(fontName).fontSize(size);
    if (doc.widthOfString(text) <= width) {
      return size;
    }
    size -= 1;
  }
  return min;
}

function drawIntaleksLogo(doc: PDFKit.PDFDocument): void {
  const pngPath = path.join(__dirname, "../assets/intaleks.png");
  const jpgPath = path.join(__dirname, "../assets/intaleks.jpg");
  const logoPath = fs.existsSync(pngPath) ? pngPath : jpgPath;

  if (!fs.existsSync(logoPath)) {
    return;
  }

  const width = 110;
  const x = PAGE.width - PAGE.marginX - width;
  doc.image(logoPath, x, 50, { width });
}

function drawClientLogo(doc: PDFKit.PDFDocument, data: RAVDAData): void {
  const logoX = (PAGE.width - 150) / 2; // Centered horizontally
  const logoY = 120; // Moved down from 80 to 120

  // If client uploaded a logo via frontend, use it
  if (data.logoBase64 && data.logoMimeType) {
    try {
      // Convert base64 to buffer and add to PDF
      const logoBuffer = Buffer.from(data.logoBase64, "base64");
      doc.image(logoBuffer, logoX, logoY, { width: 150, height: 100, fit: [150, 100] });
      return;
    } catch (error) {
      console.error("Error loading client logo:", error);
      // Fall through - no logo will be displayed
    }
  }

  // No logo provided - skip rendering entirely (logo is optional)
}

function registerInterFonts(doc: PDFKit.PDFDocument): PdfFonts {
  const fontsDir = [path.join(__dirname, "../assets/fonts"), path.join(__dirname, "../../assets/fonts")].find((dir) => fs.existsSync(dir));

  if (!fontsDir) {
    return {
      regular: "Helvetica",
      medium: "Helvetica",
      semibold: "Helvetica-Bold",
      bold: "Helvetica-Bold",
    };
  }

  const regularPath = path.join(fontsDir, "Inter-Regular.ttf");
  const mediumPath = path.join(fontsDir, "Inter-Medium.ttf");
  const semiboldPath = path.join(fontsDir, "Inter-SemiBold.ttf");
  const boldPath = path.join(fontsDir, "Inter-Bold.ttf");

  // Register static Inter fonts with different weights
  if (fs.existsSync(regularPath)) {
    doc.registerFont(FONT_REGULAR, regularPath);
  }
  if (fs.existsSync(mediumPath)) {
    doc.registerFont(FONT_MEDIUM, mediumPath);
  }
  if (fs.existsSync(semiboldPath)) {
    doc.registerFont(FONT_SEMIBOLD, semiboldPath);
  }
  if (fs.existsSync(boldPath)) {
    doc.registerFont(FONT_BOLD, boldPath);
  }

  return {
    regular: FONT_REGULAR,
    medium: FONT_MEDIUM,
    semibold: FONT_SEMIBOLD,
    bold: FONT_BOLD,
  };
}

function drawPlaceholderCompanyLogo(doc: PDFKit.PDFDocument): void {
  const x = (PAGE.width - 96) / 2;
  const y = 315;

  doc.save();
  doc.fillColor("#111111");

  doc.rect(x, y + 10, 34, 46).fill();
  doc
    .moveTo(x + 39, y + 10)
    .lineTo(x + 64, y + 10)
    .lineTo(x + 86, y + 24)
    .lineTo(x + 86, y + 44)
    .lineTo(x + 64, y + 56)
    .lineTo(x + 39, y + 56)
    .closePath()
    .fill();

  doc
    .fillColor("#FFFFFF")
    .circle(x + 73, y + 34, 3.5)
    .fill();
  doc.restore();
}

function drawCompanyLogo(doc: PDFKit.PDFDocument, data: RAVDAData): boolean {
  if (data.logoBase64) {
    try {
      const logoBuffer = Buffer.from(data.logoBase64, "base64");
      const width = 120;
      const height = 90;
      const x = (PAGE.width - width) / 2;
      doc.image(logoBuffer, x, 300, { fit: [width, height], align: "center", valign: "center" });
      return true;
    } catch {
      // fallback handled below
    }
  }

  // Do not render fallback icon; sample styling shows text-only when no company logo is provided.
  return false;
}

function drawCenteredIntroPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");

  // Draw client's uploaded logo at the top center
  drawClientLogo(doc, data);

  // Company name - reduced size, bold, centered (positioned lower to match target)
  const title = data.companyName || "Company";
  const titleMaxWidth = PAGE.width - PAGE.marginX * 2 - 40;
  const titleSize = fitTitleFontSize(doc, title, fonts.bold, 30, 48, titleMaxWidth); // Reduced font size range from 36-56 to 30-48
  const titleY = 320; // Moved down to match target positioning

  doc
    .font(fonts.bold)
    .fontSize(titleSize)
    .fillColor("#000000")
    .text(title, PAGE.marginX, titleY, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
      ellipsis: true,
    });

  // Report generated date - split into regular and bold parts
  const dateText = formatGeneratedDate(data.generatedDate);
  const regularPart = "Report Generated: ";

  // Calculate positioning for mixed formatting
  const reportRegularWidth = doc.font(fonts.regular).fontSize(10).widthOfString(regularPart);
  const reportBoldWidth = doc.font(fonts.semibold).fontSize(10).widthOfString(dateText);
  const reportTotalWidth = reportRegularWidth + reportBoldWidth;
  const reportStartX = (PAGE.width - reportTotalWidth) / 2;

  // Regular part
  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#000000")
    .text(regularPart, reportStartX, titleY + 80, {
      lineBreak: false,
    });

  // Bold date part
  doc
    .font(fonts.semibold)
    .fontSize(10)
    .fillColor("#000000")
    .text(dateText, reportStartX + reportRegularWidth, titleY + 80, {
      lineBreak: false,
    });

  // "POWERED BY" text - positioned like in the image
  const poweredByY = PAGE.height - 200; // Adjusted for footer positioning
  doc
    .font(fonts.bold) // Changed to bold
    .fontSize(12) // Reduced from 14 to 12
    .fillColor("#000000")
    .text("POWERED BY", PAGE.marginX, poweredByY, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });

  // Use actual intaleks.png logo instead of text
  try {
    const intaleksLogoPath = path.join(__dirname, "../assets/intaleks.png");
    const intaleksLogoX = (PAGE.width - 120) / 2;
    const intaleksLogoY = poweredByY + 25;

    doc.image(intaleksLogoPath, intaleksLogoX, intaleksLogoY, {
      width: 120,
      height: 40,
      fit: [120, 40],
    });
  } catch (error) {
    console.error("Error loading intaleks logo:", error);
    // Fallback to text if image fails
    doc
      .font(fonts.bold)
      .fontSize(28) // Increased font size
      .fillColor("#000000")
      .text("intaleks", PAGE.marginX, poweredByY + 25, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
      });
  }

  // Company details at the bottom - single block with mixed formatting
  // Company details at the bottom - properly centered with mixed formatting
  const companyDetailsY = PAGE.height - 100; // Moved up more to ensure all lines are visible

  // Calculate text positioning for center alignment with mixed formatting
  const line1Bold = "Perth Business Evaluators Pty Ltd";
  const line1Regular = " (ABN 51 622 231 832) trading as Intaleks";
  const line2 = "Level 35, 100 Barangaroo Avenue, Sydney NSW 2000";
  const line3 = "Phone: +61 2 8088 0798 | Email: admin@intaleks.com";

  // Measure text widths for proper centering
  const boldWidth = doc.font(fonts.bold).fontSize(8).widthOfString(line1Bold);
  const regularWidth = doc.font(fonts.regular).fontSize(8).widthOfString(line1Regular);
  const totalLine1Width = boldWidth + regularWidth;
  const line1StartX = (PAGE.width - totalLine1Width) / 2;

  // First line - company name in bold + regular text
  doc.font(fonts.bold).fontSize(8).fillColor("#333333").text(line1Bold, line1StartX, companyDetailsY, {
    lineBreak: false,
  });

  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#333333")
    .text(line1Regular, line1StartX + boldWidth, companyDetailsY, {
      lineBreak: false,
    });

  // Second line - address
  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#333333")
    .text(line2, PAGE.marginX, companyDetailsY + 15, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });

  // Third line - phone and email
  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#333333")
    .text(line3, PAGE.marginX, companyDetailsY + 30, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });
}

type StrengthBand = {
  color: string;
  factorText: string;
};
type StrengthRating = {
  label: string;
  bg: string;
  text: string;
};

interface QuestionDefinition {
  key: keyof NonNullable<RAVDAData["questionnaireResponses"]>;
  title: string;
  description: string;
  options: Array<{ value: number; label: string; description: string }>;
}

const questionDefinitions: QuestionDefinition[] = [
  {
    key: "ownerDependence",
    title: "1. Owner Dependence",
    description: "How reliant is the business on you personally?",
    options: [
      { value: 1, label: "High Risk", description: "You drive most revenue, decisions, and relationships" },
      { value: 2, label: "Moderate-High", description: "Heavy involvement in key areas" },
      { value: 3, label: "Neutral", description: "Some reliance, but key functions are shared" },
      { value: 4, label: "Low-Moderate", description: "Limited involvement needed" },
      { value: 5, label: "Strong", description: "Business operates independently of you" },
    ],
  },
  {
    key: "recurringRevenue",
    title: "2. Recurring or Contracted Revenue",
    description: "What proportion of revenue is predictable?",
    options: [
      { value: 1, label: "Weak", description: "Mostly one-off, transactional" },
      { value: 2, label: "Low", description: "Some repeat business" },
      { value: 3, label: "Neutral", description: "Mix of recurring and one-off" },
      { value: 4, label: "Good", description: "Majority recurring" },
      { value: 5, label: "Strong", description: "High recurring, contracted, subscription-based" },
    ],
  },
  {
    key: "customerConcentration",
    title: "3. Customer Concentration",
    description: "How diversified is your customer base?",
    options: [
      { value: 1, label: "High Risk", description: "One client >40% of revenue" },
      { value: 2, label: "Moderate Risk", description: "Top client 30-40%" },
      { value: 3, label: "Neutral", description: "Top client 15-30%" },
      { value: 4, label: "Good", description: "Top client 10-15%" },
      { value: 5, label: "Strong", description: "No client >10%" },
    ],
  },
  {
    key: "managementDepth",
    title: "4. Management Depth",
    description: "Can the business run without you?",
    options: [
      { value: 1, label: "Weak", description: "No management layer" },
      { value: 2, label: "Limited", description: "One key manager" },
      { value: 3, label: "Neutral", description: "Partial coverage" },
      { value: 4, label: "Good", description: "Solid team in place" },
      { value: 5, label: "Strong", description: "Strong, stable leadership team" },
    ],
  },
  {
    key: "growthRate",
    title: "5. Growth Rate",
    description: "What is your 3-5 year revenue/EBITDA growth?",
    options: [
      { value: 1, label: "Declining", description: "Flat or declining" },
      { value: 2, label: "Slow", description: "0-5% growth" },
      { value: 3, label: "Neutral", description: "Moderate, steady growth (5-15%)" },
      { value: 4, label: "Good", description: "Strong growth (15-30%)" },
      { value: 5, label: "Excellent", description: "Strong, consistent growth (>30%)" },
    ],
  },
  {
    key: "competitiveAdvantage",
    title: "6. Competitive Advantage",
    description: "How defensible is your position?",
    options: [
      { value: 1, label: "Weak", description: "Easily replicated, low barriers" },
      { value: 2, label: "Limited", description: "Some advantages" },
      { value: 3, label: "Neutral", description: "Some differentiation" },
      { value: 4, label: "Good", description: "Clear advantages" },
      { value: 5, label: "Strong", description: "Strong IP, contracts, brand, or barriers" },
    ],
  },
  {
    key: "revenueDiversification",
    title: "7. Revenue Diversification",
    description: "How many revenue streams do you have?",
    options: [
      { value: 1, label: "Single", description: "Single product/service" },
      { value: 2, label: "Limited", description: "1-2 streams" },
      { value: 3, label: "Neutral", description: "2-3 streams" },
      { value: 4, label: "Good", description: "3-5 streams" },
      { value: 5, label: "Strong", description: "Multiple stable streams" },
    ],
  },
  {
    key: "systemsScalability",
    title: "8. Systems & Scalability",
    description: "How well-systemised is the business?",
    options: [
      { value: 1, label: "Weak", description: "Manual, founder-driven" },
      { value: 2, label: "Limited", description: "Basic processes" },
      { value: 3, label: "Neutral", description: "Some documented processes" },
      { value: 4, label: "Good", description: "Well documented" },
      { value: 5, label: "Strong", description: "Strong systems, automation, tech-enabled" },
    ],
  },
  {
    key: "marginStability",
    title: "9. Margin Stability",
    description: "How consistent are your margins?",
    options: [
      { value: 1, label: "Volatile", description: "Highly volatile" },
      { value: 2, label: "Unstable", description: "Significant fluctuation" },
      { value: 3, label: "Neutral", description: "Some fluctuation" },
      { value: 4, label: "Stable", description: "Generally consistent" },
      { value: 5, label: "Very Stable", description: "Stable, predictable margins" },
    ],
  },
  {
    key: "externalRisk",
    title: "10. External / Industry Risk",
    description: "How exposed are you to regulatory or industry shocks?",
    options: [
      { value: 1, label: "High Risk", description: "High exposure" },
      { value: 2, label: "Elevated", description: "Significant exposure" },
      { value: 3, label: "Neutral", description: "Moderate exposure" },
      { value: 4, label: "Low", description: "Limited exposure" },
      { value: 5, label: "Very Low", description: "Low exposure" },
    ],
  },
];

function getScoreOutOf50(data: RAVDAData): number {
  if (typeof data.questionnaireScore === "number" && Number.isFinite(data.questionnaireScore)) {
    return Math.max(0, Math.min(50, Math.round(data.questionnaireScore)));
  }

  if (typeof data.score === "number" && Number.isFinite(data.score)) {
    return Math.max(0, Math.min(50, Math.round(data.score * 5)));
  }

  return 25;
}

function getStrengthBand(scoreOutOf50: number): StrengthBand {
  if (scoreOutOf50 >= 40) return { color: "#22C55E", factorText: "100% (1.0x)" };
  if (scoreOutOf50 >= 30) return { color: "#EAB308", factorText: "80% (0.8x)" };
  if (scoreOutOf50 >= 20) return { color: "#F97316", factorText: "50% (0.5x)" };
  return { color: "#EF4444", factorText: "30% (0.3x)" };
}

function getStrengthRating(scoreOutOf50: number): StrengthRating {
  if (scoreOutOf50 >= 40) return { label: "Excellent", bg: "#DCFCE7", text: "#166534" };
  if (scoreOutOf50 >= 30) return { label: "Good", bg: "#FEF3C7", text: "#92400E" };
  if (scoreOutOf50 >= 20) return { label: "Average", bg: "#FFEDD5", text: "#9A3412" };
  return { label: "Below Average", bg: "#FEE2E2", text: "#991B1B" };
}

function getValuationMultipleColors(scoreOutOf50: number): { bg: string; border: string; text: string } {
  // Follow official valuation multiple bands: green, yellow, orange, red
  if (scoreOutOf50 >= 40) {
    // Excellent - green
    return { bg: "#DCFCE7", border: "#BBF7D0", text: "#166534" };
  }
  if (scoreOutOf50 >= 30) {
    // Good - yellow/amber
    return { bg: "#FEF3C7", border: "#FACC15", text: "#92400E" };
  }
  if (scoreOutOf50 >= 20) {
    // Average - orange
    return { bg: "#FFEDD5", border: "#FDBA74", text: "#9A3412" };
  }
  // Below average - red
  return { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B" };
}

function drawLegendRow(doc: PDFKit.PDFDocument, fonts: PdfFonts, x: number, y: number, width: number): void {
  const legendItems = [
    { color: "#22C55E", text: "Excellent – 40-50 points: 100% (1.0x)" },
    { color: "#EAB308", text: "Good – 30-39 points: 80% (0.8x)" },
    { color: "#F97316", text: "Average – 20-29 points: 50% (0.5x)" },
    { color: "#EF4444", text: "Below Average – <20 points: 30% (0.3x)" },
  ];

  let fontSize = 10;
  const dotRadius = 4.5;
  const dotGap = 8;
  let itemGap = 22;

  const getTotalWidth = (size: number, gap: number): number => {
    doc.font(fonts.regular).fontSize(size);
    return legendItems.reduce((acc, item, idx) => {
      const itemWidth = dotRadius * 2 + dotGap + doc.widthOfString(item.text);
      return acc + itemWidth + (idx < legendItems.length - 1 ? gap : 0);
    }, 0);
  };

  let totalWidth = getTotalWidth(fontSize, itemGap);
  while (totalWidth > width && fontSize > 8) {
    fontSize -= 0.5;
    totalWidth = getTotalWidth(fontSize, itemGap);
  }

  if (totalWidth > width) {
    itemGap = 12;
    totalWidth = getTotalWidth(fontSize, itemGap);
  }

  let cursorX = x + Math.max(0, (width - totalWidth) / 2);
  legendItems.forEach((item) => {
    const circleY = y + dotRadius;
    doc.circle(cursorX, circleY, dotRadius).fill(item.color);
    cursorX += dotGap;

    const textY = circleY - fontSize / 2;
    doc.font(fonts.regular).fontSize(fontSize).fillColor("#111827").text(item.text, cursorX, textY, { lineBreak: false });
    cursorX += doc.widthOfString(item.text) + itemGap;
  });
}

function money(value: number | undefined, currencySymbol: string = "$", currencyCode: string = "AUD"): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return formatMoney(safe, currencySymbol, currencyCode);
}

function moneyComma(value: number | undefined, currencySymbol: string = "$", currencyCode: string = "AUD"): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return formatMoney(safe, currencySymbol, currencyCode);
}

/** Currency format without ISO code suffix — for use in table cells */
function moneyCell(value: number | undefined, currencySymbol: string = "$"): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return formatMoneyNoCode(safe, currencySymbol);
}

function drawInputRow(doc: PDFKit.PDFDocument, fonts: PdfFonts, y: number, label: string, value: number | undefined): void {
  const labelX = 86;
  const boxX = 270;
  const boxWidth = 235;
  const boxHeight = 27;

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#111827")
    .text(label, labelX, y + 7, {
      lineBreak: false,
    });

  doc.roundedRect(boxX, y, boxWidth, boxHeight, 4).fillAndStroke("#F3F4F6", "#E5E7EB");
  doc
    .font(fonts.regular)
    .fontSize(10.5)
    .fillColor("#9CA3AF")
    .text(money(value), boxX + 8, y + 8, {
      lineBreak: false,
    });
}

/**
 * Returns a short two-line header for a financial column.
 *
 * Supported formats:
 * - With date: "Year 1 - 31/03/2026"  → line1="Year 1"  line2="31/03/2026"
 * - Without date: "Year 1"            → line1="Year 1"  line2=""
 */
function parseColumnHeader(year: string): { line1: string; line2: string } {
  // Format with date: "Year N - DD/MM/YYYY"
  const withDate = year.match(/^(.+?)\s*-\s*(\d{2}\/\d{2}\/\d{4})$/);
  if (withDate) return { line1: withDate[1].trim(), line2: withDate[2].trim() };

  // Default: use column label as-is (e.g., "Year 1", "Year 2", "Year 3", "Year 4")
  return { line1: year, line2: "" };
}

function formatYearLabel(year: string): string {
  const { line1 } = parseColumnHeader(year);
  return line1;
}

function financialValue(data: RAVDAData, year: string, key: "sales" | "otherIncome" | "grossProfit" | "cogs" | "operatingExpenses" | "netProfitAndLoss" | "interestExpense" | "interestIncome" | "ebit"): number {
  return data.financialData?.[year]?.[key] ?? 0;
}

function drawBusinessStrengthAssessmentPanel(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts, assessmentY: number): void {
  const strengthScore = getScoreOutOf50(data);
  const strengthRating = getStrengthRating(strengthScore);

  const assessmentW = PAGE.width - PAGE.marginX * 2;
  const assessmentH = 52;

  doc.roundedRect(PAGE.marginX, assessmentY, assessmentW, assessmentH, 8).fillAndStroke("#FFFFFF", "#BFDBFE");

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280")
    .text("Business Strength Assessment", PAGE.marginX + 12, assessmentY + 10, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(18)
    .fillColor("#2563EB")
    .text(`${strengthScore}/50`, PAGE.marginX + 12, assessmentY + 26, { lineBreak: false });

  // Dynamic rating label + pill that fits "Excellent", "Good", etc. without overflow
  const ratingLabel = "Rating";
  const ratingColumnRight = PAGE.marginX + assessmentW - 12;

  // Compute pill width based on label text width with padding
  doc.font(fonts.medium).fontSize(8);
  const pillTextWidth = doc.widthOfString(strengthRating.label);
  const pillHorizontalPadding = 16; // 8px left/right
  const pillMinWidth = 60;
  const pillWidth = Math.max(pillMinWidth, pillTextWidth + pillHorizontalPadding);
  const pillHeight = 20;
  const pillRadius = 10;

  const pillX = ratingColumnRight - pillWidth;
  const pillY = assessmentY + 24;

  // "Rating" label centered horizontally above the pill
  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280")
    .text(ratingLabel, pillX, assessmentY + 10, { width: pillWidth, align: "center", lineBreak: false });

  // Rating pill
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, pillRadius).fill(strengthRating.bg);

  // Rating text centered inside the pill
  const ratingTextY = pillY + (pillHeight - 8) / 2; // 8 ≈ font size
  doc.font(fonts.medium).fontSize(8).fillColor(strengthRating.text).text(strengthRating.label, pillX, ratingTextY, { width: pillWidth, align: "center", lineBreak: false });
}

function drawMultipleCalculationFormulaSection(doc: PDFKit.PDFDocument, fonts: PdfFonts, topY: number): void {
  const x = PAGE.marginX;
  const width = PAGE.width - PAGE.marginX * 2;

  // Title
  doc.font(fonts.bold).fontSize(14).fillColor("#111827").text("Multiple Calculation Formula", x, topY, {
    width,
    lineBreak: false,
  });

  // Description line
  const descY = topY + 26;
  doc.font(fonts.regular).fontSize(11).fillColor("#111827").text("Your final multiple is calculated as: ", x, descY, { lineBreak: false, continued: true });
  doc.font(fonts.bold).text("Base Multiple × Score Factor", { lineBreak: false });

  // Table (4 columns, 2 rows) – Excellent / Good / Average / Below Average
  const tableTop = descY + 26;
  const tableHeight = 52;
  const colCount = 4;
  const colWidth = width / colCount;

  doc.lineWidth(1).strokeColor("#000000");

  // Outer border
  doc.rect(x, tableTop, width, tableHeight).stroke();

  // Vertical separators
  for (let i = 1; i < colCount; i += 1) {
    const colX = x + colWidth * i;
    doc
      .moveTo(colX, tableTop)
      .lineTo(colX, tableTop + tableHeight)
      .stroke();
  }

  // Horizontal mid-line
  const midY = tableTop + tableHeight / 2;
  doc
    .moveTo(x, midY)
    .lineTo(x + width, midY)
    .stroke();

  const headers = ["Excellent", "Good", "Average", "Below Average"];
  const rows = ["40-50 points: 100% (1.0x)", "30-39 points: 80% (0.8x)", "20-29 points: 50% (0.5x)", "<20 points: 30% (0.3x)"];

  // Header row text
  headers.forEach((label, idx) => {
    const colX = x + colWidth * idx;
    doc
      .font(fonts.bold)
      .fontSize(9.5)
      .fillColor("#111827")
      .text(label, colX + 8, tableTop + 8, {
        width: colWidth - 16,
        align: "center",
        lineBreak: false,
      });
  });

  // Value row text
  rows.forEach((text, idx) => {
    const colX = x + colWidth * idx;
    doc
      .font(fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(text, colX + 8, midY + 6, {
        width: colWidth - 16,
        align: "center",
        lineBreak: true,
      });
  });

  // Example line
  const exampleY = tableTop + tableHeight + 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("Example: If your industry base multiple is 5.0x and you scored 35 points, your multiple = 5.0 × 0.8 = 4.0x", x, exampleY, {
    width,
    align: "left",
  });
}

function drawValuationSummaryPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  const years = (data.financialYears || []).slice(0, 3);
  const yearCount = years.length || 1;
  const sumBy = (key: "sales" | "cogs" | "ebit"): number => years.reduce((sum, year) => sum + (data.financialData?.[year]?.[key] || 0), 0);

  const avgSales = sumBy("sales") / yearCount;
  const avgCogs = sumBy("cogs") / yearCount;
  const avgEbit = typeof data.averageEbit === "number" ? data.averageEbit : sumBy("ebit") / yearCount;
  const avgAddbacks = yearCount > 0 ? (data.totalAddbacks || 0) / yearCount : 0;
  const avgAdjustedEbit = typeof data.adjustedEbit === "number" ? data.adjustedEbit : avgEbit + avgAddbacks;
  const valuationMultiple = typeof data.calculatedMultiple === "number" ? data.calculatedMultiple : 0;
  const strengthScore = getScoreOutOf50(data);
  const strengthRating = getStrengthRating(strengthScore);
  const valuationMultipleColors = getValuationMultipleColors(strengthScore);

  // Header - Valuation Summary Report
  doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation Summary Report", PAGE.marginX, 94, { lineBreak: false });

  // Company name
  doc
    .font(fonts.semibold)
    .fontSize(14)
    .fillColor("#4B5563")
    .text(data.companyName || "Your Business", PAGE.marginX, 130, { lineBreak: false });

  // Industry and Country
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#6B7280")
    .text(`${toDisplayLabel(data.industry) || "Retail"} • ${sanitizeCountry(data.country)}`, PAGE.marginX, 150, { lineBreak: false });

  // Method description box - positioned below industry line
  const methodDescY = 172;
  const methodDescW = PAGE.width - PAGE.marginX * 2;
  const methodDescH = 64;

  // Determine method title and text based on valuation method
  const methodTitle = data.valuationMethod === "asset" ? "Asset Method" : "Profit Method";
  const methodText = data.valuationMethod === "asset" ? "You have selected the asset method to value your business. This approach determines what your business is worth by adding up everything it owns—such as equipment, stock, and property—and subtracting everything it owes, such as debts and liabilities." : "You have selected the profit method to value your business. This approach determines what your business is worth by looking at its ability to generate income and how efficiently it operates day to day.";

  doc.roundedRect(PAGE.marginX, methodDescY, methodDescW, methodDescH, 8).fillAndStroke("#F0F9FF", "#BFDBFE");

  // Method title
  doc
    .font(fonts.semibold)
    .fontSize(12)
    .fillColor("#1E40AF")
    .text(methodTitle, PAGE.marginX + 16, methodDescY + 12, {
      width: methodDescW - 32,
      align: "center",
      lineBreak: false,
    });

  // Method description
  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#1E40AF")
    .text(methodText, PAGE.marginX + 16, methodDescY + 32, {
      width: methodDescW - 32,
      align: "center",
      lineGap: 1.5,
    });

  // Metric cards - Row 1 (increased spacing from method description)
  const cardsY1 = 250;
  const cardW = 160;
  const gap = 10;
  const x0 = PAGE.marginX;

  // Average Sales - Blue
  drawColoredMetricCard(doc, fonts, x0, cardsY1, cardW, "Average Sales", money(avgSales, data.currencySymbol, data.currencyCode), "💰", "#EFF6FF", "#BFDBFE", "#1E40AF");

  // Average COGS - Gray
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY1, cardW, "Average COGS", money(avgCogs, data.currencySymbol, data.currencyCode), "📊", "#F9FAFB", "#E5E7EB", "#374151");

  // Average EBIT - fixed indigo (distinct from valuation multiple band colors)
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY1, cardW, "Average EBIT", money(avgEbit, data.currencySymbol, data.currencyCode), "📈", "#EEF2FF", "#C7D2FE", "#4338CA");

  // Metric cards - Row 2
  const cardsY2 = cardsY1 + 74;

  // Average Addbacks - Neutral gray
  drawColoredMetricCard(doc, fonts, x0, cardsY2, cardW, "Average Addbacks", money(avgAddbacks, data.currencySymbol, data.currencyCode), "➕", "#F9FAFB", "#E5E7EB", "#374151");

  // Average Adjusted EBIT - Purple (distinct from both EBIT and Valuation Multiple)
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY2, cardW, "Average Adjusted EBIT", money(avgAdjustedEbit, data.currencySymbol, data.currencyCode), "✨", "#FAF5FF", "#E9D5FF", "#7C3AED");

  // Valuation Multiple - dynamic color following strength rating bands
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY2, cardW, "Valuation Multiple", `${valuationMultiple.toFixed(2)}x`, "🎯", valuationMultipleColors.bg, valuationMultipleColors.border, valuationMultipleColors.text);

  // Business Strength Assessment
  const assessmentY = cardsY2 + 84;
  drawBusinessStrengthAssessmentPanel(doc, data, fonts, assessmentY);

  // Blue valuation panel
  const panelX = PAGE.marginX;
  const panelY = assessmentY + 68;
  const panelW = PAGE.width - PAGE.marginX * 2;
  const panelH = 110;
  doc.roundedRect(panelX, panelY, panelW, panelH, 12).fill("#2563EB");

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor("#DBEAFE")
    .text("Estimated Business Valuation", panelX + 12, panelY + 14, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(32)
    .fillColor("#FFFFFF")
    .text(moneyComma(data.finalValuation, data.currencySymbol, data.currencyCode), panelX + 12, panelY + 34, { lineBreak: false });

  doc
    .moveTo(panelX + 12, panelY + 80)
    .lineTo(panelX + panelW - 12, panelY + 80)
    .lineWidth(1)
    .strokeColor("#60A5FA")
    .stroke();

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#DBEAFE")
    .text(`Method: ${data.valuationMethod === "asset" ? "Asset Method" : "Profit Method"}`, panelX + 12, panelY + 88, { lineBreak: false, continued: true });

  if (data.valuationMethod === "profit" && valuationMultiple) {
    doc.text(` • Multiple: ${valuationMultiple.toFixed(2)}x`, { lineBreak: false });
  }

  const narrative = "This valuation estimate is generated from your financial performance, adjusted EBIT and selected valuation method. It is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";

  // Equity Value section — China & Indonesia only
  const country = (data.country || "").toLowerCase();
  const isEquityCountry = country === "china" || country === "indonesia";
  let narrativeY = PAGE.height - 150;

  if (isEquityCountry && data.valuationMethod === "profit" && typeof data.equityValue === "number") {
    const eqPanelY = panelY + panelH + 14;
    const eqPanelW = panelW;
    const eqPanelH = 68;

    // Header bar
    doc.roundedRect(panelX, eqPanelY, eqPanelW, 22, 4).fill("#1D4ED8");
    doc
      .font(fonts.bold)
      .fontSize(9)
      .fillColor("#FFFFFF")
      .text("CHINA & INDONESIA ONLY — EQUITY VALUE CALCULATION", panelX + 10, eqPanelY + 6, { lineBreak: false });

    // Body
    doc.roundedRect(panelX, eqPanelY + 22, eqPanelW, eqPanelH, 4).fillAndStroke("#EFF6FF", "#BFDBFE");

    const ev = data.finalValuation ?? 0;
    const debt = data.totalDebt ?? 0;
    const cash = data.cashEquivalents ?? 0;
    const sym = data.currencySymbol ?? "$";
    const code = data.currencyCode ?? "AUD";

    doc
      .font(fonts.regular)
      .fontSize(9)
      .fillColor("#6B7280")
      .text("= Equity Value", panelX + 12, eqPanelY + 30, { lineBreak: false });

    doc
      .font(fonts.bold)
      .fontSize(20)
      .fillColor("#1D4ED8")
      .text(moneyComma(data.equityValue, sym, code), panelX + 12, eqPanelY + 42, { lineBreak: false });

    doc
      .font(fonts.regular)
      .fontSize(8)
      .fillColor("#6B7280")
      .text(`EV (${moneyComma(ev, sym, code)}) − Total Debt (${moneyComma(debt, sym, code)}) + Cash (${moneyComma(cash, sym, code)})`, panelX + 12, eqPanelY + 78, { lineBreak: false });

    narrativeY = eqPanelY + eqPanelH + 30;
  }

  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#111827")
    .text(narrative, PAGE.marginX, narrativeY, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "justify",
      lineGap: 1.4,
    });

  // Page number
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#111827").text("3", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawFinancialDataPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): number {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  let currentPageNumber = 4; // This is page 4 in the sequence

  // Title
  doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation Inputs", PAGE.marginX, 76, { lineBreak: false });

  // Subtitle
  doc.font(fonts.regular).fontSize(11).fillColor("#111827").text("Your numbers are shown below:", PAGE.marginX, 105, { lineBreak: false });

  // Year selection section - show column type and period date
  const years = (data.financialYears || []).slice(0, 3);
  let yearY = 125;

  // Check if we have enough space for the table start, if not, create a new page
  const spaceNeededForTableStart = 100; // Minimum space needed for table header
  const totalSpaceNeeded = yearY + spaceNeededForTableStart;

  if (totalSpaceNeeded > PAGE.height - PAGE.marginX - 60) {
    // Not enough space, create a new page
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(8).fillColor("#111827").text(currentPageNumber.toString(), 0, footerY, {
      width: PAGE.width,
      align: "center",
      lineBreak: false,
    });

    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    currentPageNumber++;

    // Add continuation title
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation (continued)", PAGE.marginX, 76, { lineBreak: false });

    yearY = 110; // Reset Y position for new page
  }

  // Accounting Profit and Loss Table
  const tableY = yearY + 20;
  const tableW = PAGE.width - PAGE.marginX * 2;
  const tableX = PAGE.marginX;

  // Table header
  doc.rect(tableX, tableY, tableW, 24).fill("#4C94D8");
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text("ACCOUNTING PROFIT AND LOSS", tableX + 12, tableY + 7, { lineBreak: false });

  // Column headers
  const headerY = tableY + 24;
  doc.rect(tableX, headerY, tableW, 32).fill("#E8E8E8");

  const metricW = 140;
  const colW = (tableW - metricW) / years.length;

  // Draw header cell borders
  doc.rect(tableX, headerY, metricW, 32).stroke("#D1D5DB");
  years.forEach((year, idx) => {
    const colX = tableX + metricW + idx * colW;
    doc.rect(colX, headerY, colW, 32).stroke("#D1D5DB");
  });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("METRIC", tableX + 12, headerY + 12, { lineBreak: false });

  years.forEach((year, idx) => {
    const colX = tableX + metricW + idx * colW;
    const { line1, line2 } = parseColumnHeader(year);

    if (line2) {
      // Render two lines separately - manually center to avoid PDFKit issues
      doc.font(fonts.bold).fontSize(9);
      const line1Width = doc.widthOfString(line1);
      const line2Width = doc.widthOfString(line2);
      const line1X = colX + (colW - line1Width) / 2;
      const line2X = colX + (colW - line2Width) / 2;

      // Save cursor position
      const savedX = doc.x;
      const savedY = doc.y;

      doc.fillColor("#374151").text(line1, line1X, headerY + 6, { lineBreak: false, continued: false });

      // Reset cursor to prevent interference
      doc.x = savedX;
      doc.y = savedY;

      doc.fillColor("#374151").text(line2, line2X, headerY + 18, { lineBreak: false, continued: false });

      // Reset cursor again
      doc.x = savedX;
      doc.y = savedY;
    } else {
      // Single line - manually center
      doc.font(fonts.bold).fontSize(9);
      const lineWidth = doc.widthOfString(line1);
      const lineX = colX + (colW - lineWidth) / 2;

      // Save cursor position
      const savedX = doc.x;
      const savedY = doc.y;

      doc.fillColor("#374151").text(line1, lineX, headerY + 12, { lineBreak: false, continued: false });

      // Reset cursor
      doc.x = savedX;
      doc.y = savedY;
    }
  });

  // Financial data rows
  const financialRows = [
    { label: "Sales", key: "sales" as const },
    { label: "Other Income", key: "otherIncome" as const },
    { label: "COGS", key: "cogs" as const },
    { label: "Gross Profit", key: "grossProfit" as const },
    { label: "Operating Expenses", key: "operatingExpenses" as const },
    { label: "Net Profit and Loss", key: "netProfitAndLoss" as const },
    { label: "Interest Expense", key: "interestExpense" as const },
    { label: "Interest Income", key: "interestIncome" as const },
  ];

  const rowHeight = 32;
  const gridColor = "#D1D5DB";
  let rowY = headerY + 32;

  financialRows.forEach((row, idx) => {
    // Fill row background
    doc.rect(tableX, rowY, tableW, rowHeight).fill(idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB");

    // Draw all cell borders
    // Left border for metric column
    doc.rect(tableX, rowY, metricW, rowHeight).stroke(gridColor);

    // Borders for year columns
    years.forEach((year, yearIdx) => {
      const colX = tableX + metricW + yearIdx * colW;
      doc.rect(colX, rowY, colW, rowHeight).stroke(gridColor);
    });

    // Add row label
    doc
      .font(fonts.regular)
      .fontSize(10)
      .fillColor("#111827")
      .text(row.label, tableX + 12, rowY + 10, { lineBreak: false });

    // Add year values
    years.forEach((year, yearIdx) => {
      const colX = tableX + metricW + yearIdx * colW;
      const value = financialValue(data, year, row.key);
      doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#111827")
        .text(moneyCell(value, data.currencySymbol), colX + 8, rowY + 10, { width: colW - 16, align: "center", lineBreak: false });
    });

    rowY += rowHeight;
  });

  // EBIT Calculated row
  doc.rect(tableX, rowY, tableW, rowHeight).fill("#A5C9EB");

  // Draw all cell borders for EBIT row
  doc.rect(tableX, rowY, metricW, rowHeight).stroke(gridColor);
  years.forEach((year, yearIdx) => {
    const colX = tableX + metricW + yearIdx * colW;
    doc.rect(colX, rowY, colW, rowHeight).stroke(gridColor);
  });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#1F2937")
    .text("EBIT CALCULATED", tableX + 12, rowY + 11, { lineBreak: false });

  years.forEach((year, yearIdx) => {
    const colX = tableX + metricW + yearIdx * colW;
    const ebitValue = financialValue(data, year, "ebit");
    doc
      .font(fonts.bold)
      .fontSize(10)
      .fillColor("#1F2937")
      .text(moneyCell(ebitValue, data.currencySymbol), colX + 8, rowY + 11, { width: colW - 16, align: "center", lineBreak: false });
  });

  // Addbacks section - check if we have enough space BEFORE rendering
  const addbacksY = rowY + 60;

  // Calculate space needed for addbacks section
  const allAddbacks = data.addbacks || [];
  const addbacks = allAddbacks.filter((addback) => {
    // Check if addback has a reason
    if (addback.reason && addback.reason.trim().length > 0) return true;

    // Check if addback has any non-zero values
    const hasNonZeroValue = Object.values(addback.values || {}).some((val) => val > 0);
    return hasNonZeroValue;
  });

  const addbacksHeaderHeight = 24 + 32; // Header + column headers
  const addbacksRowsHeight = addbacks.length > 0 ? addbacks.length * rowHeight + rowHeight : rowHeight; // Rows + total/no data row
  const totalAddbacksHeight = addbacksHeaderHeight + addbacksRowsHeight;
  const spaceNeededForAddbacks = addbacksY + totalAddbacksHeight + 80; // 80 for page number and safe margin

  // Check if we need a new page for addbacks BEFORE rendering anything
  let actualAddbacksY = addbacksY;
  if (spaceNeededForAddbacks > PAGE.height - PAGE.marginX) {
    // Not enough space, move entire addbacks section to new page
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(8).fillColor("#111827").text(currentPageNumber.toString(), 0, footerY, {
      width: PAGE.width,
      align: "center",
      lineBreak: false,
    });

    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    currentPageNumber++;

    // Add continuation title
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation (continued)", PAGE.marginX, 76, { lineBreak: false });

    actualAddbacksY = 110; // Reset Y position for new page
  }

  // Now render addbacks section
  doc.rect(tableX, actualAddbacksY, tableW, 24).fill("#4C94D8");
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text("ADDBACKS / ADJUSTMENTS", tableX + 12, actualAddbacksY + 7, { lineBreak: false });

  // Addbacks table headers
  const addHeaderY = actualAddbacksY + 24;
  doc.rect(tableX, addHeaderY, tableW, 32).fill("#E8E8E8");

  const addbackW = 80;
  const reasonW = 160;
  const addYearColW = (tableW - addbackW - reasonW) / years.length;

  // Draw header cell borders
  doc.rect(tableX, addHeaderY, addbackW, 32).stroke("#D1D5DB");
  doc.rect(tableX + addbackW, addHeaderY, reasonW, 32).stroke("#D1D5DB");
  years.forEach((year, idx) => {
    const colX = tableX + addbackW + reasonW + idx * addYearColW;
    doc.rect(colX, addHeaderY, addYearColW, 32).stroke("#D1D5DB");
  });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("ADDBACK", tableX + 12, addHeaderY + 12, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("ADDBACK REASON", tableX + addbackW + 12, addHeaderY + 12, { lineBreak: false });

  years.forEach((year, idx) => {
    const colX = tableX + addbackW + reasonW + idx * addYearColW;
    const { line1, line2 } = parseColumnHeader(year);

    if (line2) {
      // Render two lines separately - manually center to avoid PDFKit issues
      doc.font(fonts.bold).fontSize(9);
      const line1Width = doc.widthOfString(line1);
      const line2Width = doc.widthOfString(line2);
      const line1X = colX + (addYearColW - line1Width) / 2;
      const line2X = colX + (addYearColW - line2Width) / 2;

      // Save cursor position
      const savedX = doc.x;
      const savedY = doc.y;

      doc.fillColor("#374151").text(line1, line1X, addHeaderY + 6, { lineBreak: false, continued: false });

      // Reset cursor to prevent interference
      doc.x = savedX;
      doc.y = savedY;

      doc.fillColor("#374151").text(line2, line2X, addHeaderY + 18, { lineBreak: false, continued: false });

      // Reset cursor again
      doc.x = savedX;
      doc.y = savedY;
    } else {
      // Single line - manually center
      doc.font(fonts.bold).fontSize(9);
      const lineWidth = doc.widthOfString(line1);
      const lineX = colX + (addYearColW - lineWidth) / 2;

      // Save cursor position
      const savedX = doc.x;
      const savedY = doc.y;

      doc.fillColor("#374151").text(line1, lineX, addHeaderY + 12, { lineBreak: false, continued: false });

      // Reset cursor
      doc.x = savedX;
      doc.y = savedY;
    }
  });

  // Render addback rows (addbacks already filtered above)
  if (addbacks.length > 0) {
    let addRowY = addHeaderY + 32;

    addbacks.forEach((addback, idx) => {
      // Fill row background
      doc.rect(tableX, addRowY, tableW, rowHeight).fill(idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB");

      // Draw all cell borders
      doc.rect(tableX, addRowY, addbackW, rowHeight).stroke(gridColor);
      doc.rect(tableX + addbackW, addRowY, reasonW, rowHeight).stroke(gridColor);
      years.forEach((year, yearIdx) => {
        const colX = tableX + addbackW + reasonW + yearIdx * addYearColW;
        doc.rect(colX, addRowY, addYearColW, rowHeight).stroke(gridColor);
      });

      doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#111827")
        .text(`Addback ${idx + 1}`, tableX + 12, addRowY + 10, { lineBreak: false });

      // Use customReason if reason is "other", otherwise format the reason
      let reason = "";
      if (addback?.reason === "other" && addback?.customReason) {
        reason = addback.customReason;
      } else {
        reason = (addback?.reason || "")
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      }

      const fontSize = reason.length > 15 ? 9 : 10;
      doc
        .font(fonts.regular)
        .fontSize(fontSize)
        .fillColor("#111827")
        .text(reason, tableX + addbackW + 12, addRowY + 10, { width: reasonW - 24, lineBreak: false, ellipsis: true });

      years.forEach((year, yearIdx) => {
        const colX = tableX + addbackW + reasonW + yearIdx * addYearColW;
        const value = addback?.values?.[year] || 0;
        doc
          .font(fonts.regular)
          .fontSize(10)
          .fillColor("#111827")
          .text(moneyCell(value, data.currencySymbol), colX + 8, addRowY + 10, { width: addYearColW - 16, align: "center", lineBreak: false });
      });

      addRowY += rowHeight;
    });

    // Total addbacks row
    doc.rect(tableX, addRowY, tableW, rowHeight).fill("#A5C9EB");

    // Draw all cell borders for total row
    doc.rect(tableX, addRowY, addbackW, rowHeight).stroke(gridColor);
    doc.rect(tableX + addbackW, addRowY, reasonW, rowHeight).stroke(gridColor);
    years.forEach((year, yearIdx) => {
      const colX = tableX + addbackW + reasonW + yearIdx * addYearColW;
      doc.rect(colX, addRowY, addYearColW, rowHeight).stroke(gridColor);
    });

    doc
      .font(fonts.bold)
      .fontSize(10)
      .fillColor("#1F2937")
      .text("TOTAL ADDBACKS", tableX + 12, addRowY + 11, { lineBreak: false });

    // Show total for each year
    years.forEach((year, yearIdx) => {
      const colX = tableX + addbackW + reasonW + yearIdx * addYearColW;
      const yearTotal = data.totalAddbacksPerYear?.[year] || 0;
      doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#1F2937")
        .text(moneyCell(yearTotal, data.currencySymbol), colX + 8, addRowY + 11, { width: addYearColW - 16, align: "center", lineBreak: false });
    });
  } else {
    // If no addbacks, show a message
    const noAddbackY = addHeaderY + 32;
    doc.rect(tableX, noAddbackY, tableW, rowHeight).fill("#F9FAFB");
    doc
      .font(fonts.regular)
      .fontSize(10)
      .fillColor("#6B7280")
      .text("No addbacks provided", tableX + 12, noAddbackY + 10, { width: tableW - 24, align: "center", lineBreak: false });
  }

  // Page number
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#111827").text(currentPageNumber.toString(), 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });

  return currentPageNumber; // Return the last page number used
}

function drawMetricCard(doc: PDFKit.PDFDocument, fonts: PdfFonts, x: number, y: number, title: string, value: string): void {
  const w = 150;
  const h = 62;
  doc.roundedRect(x, y, w, h, 5).fillAndStroke("#F3F4F6", "#E5E7EB");
  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#111827")
    .text(title, x, y + 14, { width: w, align: "center", lineBreak: false });
  doc
    .font(fonts.bold)
    .fontSize(16)
    .fillColor("#111827")
    .text(value, x, y + 32, { width: w, align: "center", lineBreak: false });
}

function drawColoredMetricCard(doc: PDFKit.PDFDocument, fonts: PdfFonts, x: number, y: number, w: number, label: string, value: string, emoji: string, bgColor: string, borderColor: string, textColor: string): void {
  const h = 64;
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(bgColor, borderColor);

  // Label on top left
  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor(textColor)
    .fillOpacity(0.75)
    .text(label, x + 8, y + 10, { width: w - 16, lineBreak: false });

  doc.fillOpacity(1);

  // Value on bottom
  doc
    .font(fonts.bold)
    .fontSize(16)
    .fillColor(textColor)
    .text(value, x + 8, y + 34, { width: w - 16, lineBreak: false });
}

function drawAssetSummaryPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  const assets = data.assets || {};
  const liabilities = data.liabilities || {};
  const isChina = (data.country || "").toLowerCase() === "china";

  // Calculate totals for Book Value and Fair Market Value
  const totalAssetsBV = (Number(assets.cashAndBank_bv) || 0) + (Number(assets.accountsReceivable_bv) || 0) + (Number(assets.inventory_bv) || 0) + (Number(assets.plantEquipment_bv) || 0) + (Number(assets.vehicles_bv) || 0) + (Number(assets.realEstate_bv) || 0) + (Number(assets.intellectualProperty_bv) || 0) + (Number(assets.otherAssets_bv) || 0) + (isChina ? Number(assets.landUseRights_bv) || 0 : 0);

  const totalAssetsFMV = (Number(assets.cashAndBank_fmv) || 0) + (Number(assets.accountsReceivable_fmv) || 0) + (Number(assets.inventory_fmv) || 0) + (Number(assets.plantEquipment_fmv) || 0) + (Number(assets.vehicles_fmv) || 0) + (Number(assets.realEstate_fmv) || 0) + (Number(assets.intellectualProperty_fmv) || 0) + (Number(assets.otherAssets_fmv) || 0) + (isChina ? Number(assets.landUseRights_fmv) || 0 : 0);

  const totalLiabilitiesBV = (Number(liabilities.liabilities_bv) || 0) + (Number(liabilities.accountsPayable_bv) || 0) + (Number(liabilities.loansAndDebt_bv) || 0) + (Number(liabilities.otherLiabilities_bv) || 0);

  const totalLiabilitiesFMV = (Number(liabilities.liabilities_fmv) || 0) + (Number(liabilities.accountsPayable_fmv) || 0) + (Number(liabilities.loansAndDebt_fmv) || 0) + (Number(liabilities.otherLiabilities_fmv) || 0);

  const netAssetValueBV = totalAssetsBV - totalLiabilitiesBV;
  const netAssetValueFMV = totalAssetsFMV - totalLiabilitiesFMV;

  const strengthScore = getScoreOutOf50(data);
  const strengthRating = getStrengthRating(strengthScore);

  doc.font(fonts.semibold).fontSize(14).fillColor("#111827").text("Asset Method Summary", PAGE.marginX, 94, { lineBreak: false });

  // Company info line with justified spacing
  const infoY = 130;
  const infoStartX = PAGE.marginX + 26;
  const infoEndX = PAGE.width - PAGE.marginX - 26;
  const infoWidth = infoEndX - infoStartX;

  const baseMultiple = typeof data.calculatedMultiple === "number" ? (data.calculatedMultiple % 1 === 0 ? data.calculatedMultiple.toFixed(0) : data.calculatedMultiple.toFixed(1)) : "0";
  const industryText = `Industry: ${toDisplayLabel(data.industry) || "N/A"}(Base: ${baseMultiple}x)`;

  // Calculate widths
  doc.font(fonts.bold).fontSize(13);
  const companyWidth = doc.widthOfString(data.companyName || "-");
  doc.font(fonts.regular).fontSize(13);
  const countryWidth = doc.widthOfString(sanitizeCountry(data.country));
  const industryWidth = doc.widthOfString(industryText);

  // Calculate spacing
  const totalTextWidth = companyWidth + countryWidth + industryWidth;
  const spacing = (infoWidth - totalTextWidth) / 2;

  // Draw company name
  doc
    .font(fonts.bold)
    .fontSize(13)
    .fillColor("#111827")
    .text(data.companyName || "-", infoStartX, infoY, { lineBreak: false });

  // Draw country
  const countryX = infoStartX + companyWidth + spacing;
  doc.font(fonts.regular).fontSize(13).fillColor("#111827").text(sanitizeCountry(data.country), countryX, infoY, { lineBreak: false });

  // Draw industry with base multiple
  const industryX = countryX + countryWidth + spacing;
  doc
    .font(fonts.regular)
    .fontSize(13)
    .fillColor("#111827")
    .text(`Industry: ${toDisplayLabel(data.industry) || "N/A"}`, industryX, infoY, { lineBreak: false, continued: true });
  doc.font(fonts.regular).fontSize(13).fillColor("#9CA3AF").text(`(Base: ${baseMultiple}x)`, { lineBreak: false });

  // Method description box
  const methodDescY = 152;
  const methodDescW = PAGE.width - PAGE.marginX * 2;
  const methodDescH = 50;

  doc.roundedRect(PAGE.marginX, methodDescY, methodDescW, methodDescH, 8).fillAndStroke("#F0F9FF", "#BFDBFE");

  doc
    .font(fonts.semibold)
    .fontSize(11)
    .fillColor("#1E40AF")
    .text("Asset Method", PAGE.marginX + 16, methodDescY + 10, {
      width: methodDescW - 32,
      align: "center",
      lineBreak: false,
    });

  doc
    .font(fonts.regular)
    .fontSize(8.5)
    .fillColor("#1E40AF")
    .text("You have selected the asset method to value your business. This approach determines what your business is worth by adding up everything it owns—such as equipment, stock, and property—and subtracting everything it owes, such as debts and liabilities.", PAGE.marginX + 16, methodDescY + 28, {
      width: methodDescW - 32,
      align: "center",
      lineGap: 1.5,
    });

  // Asset & Liability breakdown table with BV and FMV columns
  const tableY = methodDescY + methodDescH + 16;
  const tableX = PAGE.marginX;
  const tableW = PAGE.width - PAGE.marginX * 2;
  const labelColW = tableW * 0.4;
  const valueColW = (tableW - labelColW) / 2; // Split remaining space for BV and FMV
  const rowH = 20;
  const gridColor = "#D1D5DB";

  // Assets header
  doc.rect(tableX, tableY, tableW, 20).fill("#4C94D8");
  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#FFFFFF")
    .text("ASSETS", tableX + 10, tableY + 6, { lineBreak: false });

  // Column headers
  const headerY = tableY + 20;
  doc.rect(tableX, headerY, tableW, 22).fill("#E8E8E8");
  doc.rect(tableX, headerY, labelColW, 22).stroke(gridColor);
  doc.rect(tableX + labelColW, headerY, valueColW, 22).stroke(gridColor);
  doc.rect(tableX + labelColW + valueColW, headerY, valueColW, 22).stroke(gridColor);

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Asset Category", tableX + 10, headerY + 8, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Book Value", tableX + labelColW + 8, headerY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Fair Market Value", tableX + labelColW + valueColW + 8, headerY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  // Asset rows
  const assetRows: Array<{ label: string; bv: number; fmv: number; highlight?: boolean }> = [
    { label: "Cash & Bank", bv: Number(assets.cashAndBank_bv) || 0, fmv: Number(assets.cashAndBank_fmv) || 0 },
    { label: "Accounts Receivable", bv: Number(assets.accountsReceivable_bv) || 0, fmv: Number(assets.accountsReceivable_fmv) || 0 },
    { label: "Inventory", bv: Number(assets.inventory_bv) || 0, fmv: Number(assets.inventory_fmv) || 0 },
    { label: "Plant & Equipment", bv: Number(assets.plantEquipment_bv) || 0, fmv: Number(assets.plantEquipment_fmv) || 0 },
    { label: "Vehicles", bv: Number(assets.vehicles_bv) || 0, fmv: Number(assets.vehicles_fmv) || 0 },
    { label: "Real Estate", bv: Number(assets.realEstate_bv) || 0, fmv: Number(assets.realEstate_fmv) || 0 },
    { label: "Intellectual Property", bv: Number(assets.intellectualProperty_bv) || 0, fmv: Number(assets.intellectualProperty_fmv) || 0 },
    { label: "Other Assets", bv: Number(assets.otherAssets_bv) || 0, fmv: Number(assets.otherAssets_fmv) || 0 },
  ];

  if (isChina) {
    assetRows.push({
      label: "Land-Use Rights (China)",
      bv: Number(assets.landUseRights_bv) || 0,
      fmv: Number(assets.landUseRights_fmv) || 0,
    });
  }

  assetRows.push({ label: "TOTAL ASSETS", bv: totalAssetsBV, fmv: totalAssetsFMV, highlight: true });

  let rowY = headerY + 22;
  assetRows.forEach((row, idx) => {
    const bg = row.highlight ? "#A5C9EB" : idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
    doc.rect(tableX, rowY, tableW, rowH).fill(bg);
    doc.rect(tableX, rowY, labelColW, rowH).stroke(gridColor);
    doc.rect(tableX + labelColW, rowY, valueColW, rowH).stroke(gridColor);
    doc.rect(tableX + labelColW + valueColW, rowY, valueColW, rowH).stroke(gridColor);

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(row.label, tableX + 10, rowY + 6, { lineBreak: false });

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(moneyComma(row.bv, data.currencySymbol, data.currencyCode), tableX + labelColW + 8, rowY + 6, { width: valueColW - 16, align: "center", lineBreak: false });

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(moneyComma(row.fmv, data.currencySymbol, data.currencyCode), tableX + labelColW + valueColW + 8, rowY + 6, { width: valueColW - 16, align: "center", lineBreak: false });

    rowY += rowH;
  });

  // Liabilities header
  const liabHeaderY = rowY + 8;
  doc.rect(tableX, liabHeaderY, tableW, 20).fill("#4C94D8");
  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#FFFFFF")
    .text("LIABILITIES", tableX + 10, liabHeaderY + 6, { lineBreak: false });

  // Column headers for liabilities
  const liabColHeaderY = liabHeaderY + 20;
  doc.rect(tableX, liabColHeaderY, tableW, 22).fill("#E8E8E8");
  doc.rect(tableX, liabColHeaderY, labelColW, 22).stroke(gridColor);
  doc.rect(tableX + labelColW, liabColHeaderY, valueColW, 22).stroke(gridColor);
  doc.rect(tableX + labelColW + valueColW, liabColHeaderY, valueColW, 22).stroke(gridColor);

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Liability Category", tableX + 10, liabColHeaderY + 8, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Book Value", tableX + labelColW + 8, liabColHeaderY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#374151")
    .text("Fair Market Value", tableX + labelColW + valueColW + 8, liabColHeaderY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  // Liability rows
  const liabilityRows: Array<{ label: string; bv: number; fmv: number; highlight?: boolean }> = [
    { label: "Liabilities", bv: Number(liabilities.liabilities_bv) || 0, fmv: Number(liabilities.liabilities_fmv) || 0 },
    { label: "Accounts Payable", bv: Number(liabilities.accountsPayable_bv) || 0, fmv: Number(liabilities.accountsPayable_fmv) || 0 },
    { label: "Loans & Debt", bv: Number(liabilities.loansAndDebt_bv) || 0, fmv: Number(liabilities.loansAndDebt_fmv) || 0 },
    { label: "Other Liabilities", bv: Number(liabilities.otherLiabilities_bv) || 0, fmv: Number(liabilities.otherLiabilities_fmv) || 0 },
    { label: "TOTAL LIABILITIES", bv: totalLiabilitiesBV, fmv: totalLiabilitiesFMV, highlight: true },
  ];

  rowY = liabColHeaderY + 22;
  liabilityRows.forEach((row, idx) => {
    const bg = row.highlight ? "#A5C9EB" : idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
    doc.rect(tableX, rowY, tableW, rowH).fill(bg);
    doc.rect(tableX, rowY, labelColW, rowH).stroke(gridColor);
    doc.rect(tableX + labelColW, rowY, valueColW, rowH).stroke(gridColor);
    doc.rect(tableX + labelColW + valueColW, rowY, valueColW, rowH).stroke(gridColor);

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(row.label, tableX + 10, rowY + 6, { lineBreak: false });

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(moneyComma(row.bv, data.currencySymbol, data.currencyCode), tableX + labelColW + 8, rowY + 6, { width: valueColW - 16, align: "center", lineBreak: false });

    doc
      .font(row.highlight ? fonts.bold : fonts.regular)
      .fontSize(8)
      .fillColor("#111827")
      .text(moneyComma(row.fmv, data.currencySymbol, data.currencyCode), tableX + labelColW + valueColW + 8, rowY + 6, { width: valueColW - 16, align: "center", lineBreak: false });

    rowY += rowH;
  });

  // Net Asset Value rows - show both BV and FMV separately
  const navY = rowY + 8;

  // Net Asset Value (Book Value) row
  doc.rect(tableX, navY, tableW, 24).fill("#F3F4F6");
  doc.rect(tableX, navY, labelColW, 24).stroke(gridColor);
  doc.rect(tableX + labelColW, navY, valueColW, 24).stroke(gridColor);
  doc.rect(tableX + labelColW + valueColW, navY, valueColW, 24).stroke(gridColor);

  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#111827")
    .text("Net Asset Value (Book Value)", tableX + 10, navY + 8, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#111827")
    .text(moneyComma(netAssetValueBV, data.currencySymbol, data.currencyCode), tableX + labelColW + 8, navY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#9CA3AF")
    .text("—", tableX + labelColW + valueColW + 8, navY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  // Net Asset Value (Fair Market Value) row
  const navFMVY = navY + 24;
  doc.rect(tableX, navFMVY, tableW, 24).fill("#DBEAFE");
  doc.rect(tableX, navFMVY, labelColW, 24).stroke(gridColor);
  doc.rect(tableX + labelColW, navFMVY, valueColW, 24).stroke(gridColor);
  doc.rect(tableX + labelColW + valueColW, navFMVY, valueColW, 24).stroke(gridColor);

  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#111827")
    .text("Net Asset Value (Fair Market Value)", tableX + 10, navFMVY + 8, { lineBreak: false });

  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#9CA3AF")
    .text("—", tableX + labelColW + 8, navFMVY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(9)
    .fillColor("#1E40AF")
    .text(moneyComma(netAssetValueFMV, data.currencySymbol, data.currencyCode), tableX + labelColW + valueColW + 8, navFMVY + 8, { width: valueColW - 16, align: "center", lineBreak: false });

  // Business strength assessment
  const assessmentY = navFMVY + 36;
  drawBusinessStrengthAssessmentPanel(doc, data, fonts, assessmentY);

  // Final valuation panel
  const panelX = PAGE.marginX;
  const panelY = assessmentY + 64;
  const panelW = PAGE.width - PAGE.marginX * 2;
  const panelH = 90;
  doc.roundedRect(panelX, panelY, panelW, panelH, 12).fill("#2563EB");

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#DBEAFE")
    .text("Estimated Business Valuation (Fair Market Value)", panelX + 12, panelY + 12, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(28)
    .fillColor("#FFFFFF")
    .text(moneyComma(netAssetValueFMV, data.currencySymbol, data.currencyCode), panelX + 12, panelY + 32, { lineBreak: false });

  doc
    .moveTo(panelX + 12, panelY + 68)
    .lineTo(panelX + panelW - 12, panelY + 68)
    .lineWidth(1)
    .strokeColor("#60A5FA")
    .stroke();

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#DBEAFE")
    .text("Method: Asset Method", panelX + 12, panelY + 74, { lineBreak: false });

  // Disclaimer
  const narrative = "This valuation estimate is generated from your asset and liability data, showing both Book Value and Fair Market Value. The Estimated Business Valuation uses the Fair Market Value calculation. This is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";
  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#111827")
    .text(narrative, PAGE.marginX, panelY + panelH + 12, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "justify",
      lineGap: 1.3,
    });

  // Page number
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#111827").text("3", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawQuestionnaireResponsesPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  // This function is defined later in the file
}

function drawEarlyDisclaimerPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");

  // Draw intaleks logo at top
  drawIntaleksLogo(doc);

  let y = 120;

  // Main title
  doc.font(fonts.bold).fontSize(16).fillColor("#000000").text("BUSINESS VALUATION DISCLAIMER", 0, y, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
  y += 40;

  // Red disclaimer subtitle
  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#DC2626")
    .text("DISCLAIMER - GUIDANCE ONLY (NOT LEGAL, FINANCIAL, OR PROFESSIONAL ADVICE)", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });
  y += 35;

  // Main intro paragraph
  const intro = 'The valuation estimate generated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832), trading as Intaleks ("Intaleks") is a general informational guide only. It is based on automated modelling, user-provided inputs, and available data sources.';
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#000000")
    .text(intro, PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 2,
    });
  y += 65;

  // "This valuation is not:" section
  doc.font(fonts.bold).fontSize(11).fillColor("#000000").text("This valuation is not:", PAGE.marginX, y, { lineBreak: false });
  y += 20;

  const bullets = ["A certified business valuation", "A legal valuation for court, taxation, or regulatory purposes", "Financial, accounting, investment, or legal advice", "A substitute for professional valuation services"];

  bullets.forEach((bullet) => {
    doc
      .font(fonts.regular)
      .fontSize(11)
      .fillColor("#000000")
      .text(`• ${bullet}`, PAGE.marginX + 20, y, {
        width: PAGE.width - PAGE.marginX * 2 - 20,
        lineBreak: false,
      });
    y += 18;
  });
  y += 15;

  // Estimates disclaimer
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#000000")
    .text("The results are estimates only and may not reflect actual market value or current economic conditions. No action or decision should be made based solely on this valuation output.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 2,
    });
  y += 55;

  // Professional valuation requirement
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#000000")
    .text("For legal proceedings, taxation matters, lending requirements, compliance purposes, or formal business transactions, you must obtain a qualified, independent, and certified professional valuation.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 2,
    });
  y += 55;

  // Limitation of Liability section
  doc.font(fonts.bold).fontSize(11).fillColor("#000000").text("Limitation of Liability", PAGE.marginX, y, { lineBreak: false });
  y += 18;
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#000000")
    .text("Intaleks accepts no liability for any loss, decision, or action taken in reliance on the valuation estimate.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 2,
    });

  // Important legal notice box - positioned at bottom of page
  const noticeX = PAGE.marginX;
  const noticeY = PAGE.height - 160; // Moved up more to create more space from page number
  const noticeW = PAGE.width - PAGE.marginX * 2;
  const noticeH = 70; // Increased height for better bottom spacing

  doc.rect(noticeX, noticeY, noticeW, noticeH).fillAndStroke("#FEE2E2", "#DC2626");

  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor("#DC2626")
    .text("IMPORTANT LEGAL NOTICE", noticeX + 15, noticeY + 15, {
      lineBreak: false,
    });

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280") // Lighter gray color instead of black
    .text("The Platform provides automated valuation estimates only and is NOT a certified valuation and CANNOT be used for legal, tax, court, or regulatory purposes.", noticeX + 15, noticeY + 35, {
      width: noticeW - 30, // Equal 15px padding on both sides
      lineGap: 1.2,
    });

  // Page number - positioned with more space below the notice box
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#000000").text("2", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}
function drawBusinessStrengthAssessmentPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");

  drawIntaleksLogo(doc);

  doc.font(fonts.semibold).fontSize(16).fillColor("#111827").text("Business strength assessment", PAGE.marginX, 94, {
    lineBreak: false,
  });

  const score = getScoreOutOf50(data);
  const band = getStrengthBand(score);

  const centerX = PAGE.width / 2;
  const centerY = 300;
  const radius = 132;

  // Fill base circle by score band color.
  doc.circle(centerX, centerY, radius).fill(band.color);

  // Overlay gray wedge for the unscored portion.
  const remainingRatio = Math.max(0, Math.min(1, (50 - score) / 50));
  if (remainingRatio > 0) {
    const startAngle = 0;
    const endAngle = remainingRatio * Math.PI * 2;
    doc.save();
    doc.fillColor("#E5E7EB");

    // Draw remaining portion using path
    doc.path(`M ${centerX} ${centerY} L ${centerX + radius} ${centerY}`);
    for (let angle = startAngle; angle <= endAngle; angle += 0.1) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      doc.lineTo(x, y);
    }
    doc.closePath().fill();
    doc.restore();
  }

  const scoreY = 438;
  const leftScore = `${score}/`;
  doc.font(fonts.regular).fontSize(26);
  const leftWidth = doc.widthOfString(leftScore);
  const rightScore = "50";
  const rightWidth = doc.widthOfString(rightScore);
  const totalWidth = leftWidth + rightWidth;
  const startX = centerX - totalWidth / 2;

  doc.font(fonts.regular).fontSize(26).fillColor("#111827").text(leftScore, startX, scoreY, { lineBreak: false });
  doc
    .font(fonts.regular)
    .fontSize(26)
    .fillColor("#C4C4C4")
    .text(rightScore, startX + leftWidth, scoreY, { lineBreak: false });

  drawLegendRow(doc, fonts, PAGE.marginX + 14, 498, PAGE.width - PAGE.marginX * 2 - 28);

  // Multiple calculation formula section (now shared with questionnaire page)
  drawMultipleCalculationFormulaSection(doc, fonts, 550);

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#111827").text("5", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawQuestionnaireQAPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts, pageNumber: number): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");

  drawIntaleksLogo(doc);

  // Page title
  doc.font(fonts.semibold).fontSize(16).fillColor("#111827").text("Questionnaire Responses", PAGE.marginX, 94, {
    lineBreak: false,
  });

  // Subtitle with score
  const score = getScoreOutOf50(data);
  doc.font(fonts.regular).fontSize(10).fillColor("#6B7280").text(`Your responses to the 10 business strength questions (Total Score: ${score}/50)`, PAGE.marginX, 115, {
    lineBreak: false,
  });

  const responses = data.questionnaireResponses;

  if (!responses) {
    doc.font(fonts.regular).fontSize(11).fillColor("#9CA3AF").text("No questionnaire responses available.", PAGE.marginX, 150, {
      lineBreak: false,
    });

    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(8).fillColor("#111827").text(pageNumber.toString(), 0, footerY, {
      width: PAGE.width,
      align: "center",
      lineBreak: false,
    });
    return;
  }

  // Two-column layout for better space utilization
  const leftColumnX = PAGE.marginX;
  const rightColumnX = PAGE.width / 2 + 10;
  const columnWidth = (PAGE.width - PAGE.marginX * 2 - 20) / 2;
  let leftY = 145;
  let rightY = 145;

  // Display questions in two columns
  questionDefinitions.forEach((question, index) => {
    const userScore = responses[question.key];
    const selectedOption = question.options.find((opt) => opt.value === userScore);

    // Determine which column to use
    const isLeftColumn = index < 5;
    const currentX = isLeftColumn ? leftColumnX : rightColumnX;
    let currentY = isLeftColumn ? leftY : rightY;

    // Score color based on value
    const scoreColor = userScore >= 4 ? "#22C55E" : userScore >= 3 ? "#EAB308" : userScore >= 2 ? "#F97316" : "#EF4444";
    const scoreBg = userScore >= 4 ? "#F0FDF4" : userScore >= 3 ? "#FEF9C3" : userScore >= 2 ? "#FFF7ED" : "#FEF2F2";

    // Question container - more compact design
    const questionHeight = 50;

    // Question header with score circle and title
    doc.roundedRect(currentX, currentY, columnWidth, questionHeight, 6).fill("#F9FAFB");

    // Score circle - smaller and positioned better
    doc.circle(currentX + 15, currentY + 15, 8).fill(scoreColor);

    // Use more precise centering with adjusted positioning
    doc
      .font(fonts.bold)
      .fontSize(8)
      .fillColor("#FFFFFF")
      .text(userScore.toString(), currentX + 11.5, currentY + 11.8, {
        width: 7,
        align: "center",
        lineBreak: false,
      });

    // Question title - more compact
    const titleText = question.title.length > 28 ? question.title.substring(0, 28) + "..." : question.title;
    doc
      .font(fonts.semibold)
      .fontSize(8)
      .fillColor("#111827")
      .text(titleText, currentX + 30, currentY + 8, {
        width: columnWidth - 35,
        lineBreak: false,
        ellipsis: true,
      });

    // Selected answer - compact format
    if (selectedOption) {
      doc
        .font(fonts.regular)
        .fontSize(7)
        .fillColor("#4B5563")
        .text(`${selectedOption.label} (${selectedOption.value}/5)`, currentX + 30, currentY + 19, {
          width: columnWidth - 35,
          lineBreak: false,
          ellipsis: true,
        });

      // Answer description - very compact
      const descText = selectedOption.description.length > 45 ? selectedOption.description.substring(0, 45) + "..." : selectedOption.description;
      doc
        .font(fonts.regular)
        .fontSize(6)
        .fillColor("#6B7280")
        .text(descText, currentX + 30, currentY + 30, {
          width: columnWidth - 35,
          lineBreak: false,
          ellipsis: true,
        });
    }

    // Update Y position for next question
    if (isLeftColumn) {
      leftY = currentY + questionHeight + 8;
    } else {
      rightY = currentY + questionHeight + 8;
    }
  });

  // Summary section at the bottom - more compact and centered
  const summaryY = Math.max(leftY, rightY) + 24;
  drawBusinessStrengthAssessmentPanel(doc, data, fonts, summaryY);

  // Multiple Calculation Formula section directly below assessment, matching reference design
  const formulaTopY = summaryY + 72;
  drawMultipleCalculationFormulaSection(doc, fonts, formulaTopY);

  // Page number
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(8).fillColor("#111827").text(pageNumber.toString(), 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

export async function generateRAVDAScorecardPDF(data: RAVDAData): Promise<Buffer> {
  // Resolve currency symbol from country if not explicitly provided
  const resolvedData: RAVDAData = {
    ...data,
    currencySymbol: data.currencySymbol ?? getCurrencySymbolForCountry(data.country),
    currencyCode: data.currencyCode ?? getCurrencyCodeForCountry(data.country),
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: PAGE.marginX,
      size: "A4",
      bufferPages: true, // Buffer pages to prevent automatic page creation
      autoFirstPage: false, // We'll manually add pages
    });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      buffers.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });

    doc.on("error", (error) => {
      reject(error);
    });

    const fonts = registerInterFonts(doc);
    drawCenteredIntroPage(doc, resolvedData, fonts); // Page 1
    drawEarlyDisclaimerPage(doc, resolvedData, fonts); // Page 2 - Early disclaimer
    if (resolvedData.valuationMethod === "asset") {
      drawAssetSummaryPage(doc, resolvedData, fonts); // Page 3 - Asset summary
    } else if (resolvedData.valuationMethod === "profit") {
      drawValuationSummaryPage(doc, resolvedData, fonts); // Page 3 - Well-formatted valuation summary
    }
    const lastFinancialPageNumber = drawFinancialDataPage(doc, resolvedData, fonts); // Page 4+ - Financial data (may span multiple pages)
    // drawBusinessStrengthAssessmentPage(doc, resolvedData, fonts); // Page 5 - Business Strength Assessment (temporarily hidden)
    drawQuestionnaireQAPage(doc, resolvedData, fonts, lastFinancialPageNumber + 1); // Next page after financial data - Questionnaire Q&A

    doc.end();
  });
}
