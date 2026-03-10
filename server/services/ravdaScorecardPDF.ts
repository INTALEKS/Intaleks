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

export interface RAVDAData {
  companyName: string;
  country?: string;
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
    values: Record<string, number>;
  }>;
  totalAddbacks?: number;
  assets?: {
    plantEquipment: number;
    inventory: number;
    vehicles: number;
    goodwill: number;
    otherIntangible: number;
  };
  liabilities?: {
    loans: number;
    annualLeave: number;
    longServiceLeave: number;
    otherLiabilities: number;
  };
  totalAssets?: number;
  totalLiabilities?: number;
  averageEbit?: number;
  adjustedEbit?: number;
  drivers?: {
    strong: string[];
    average: string[];
    weak: string[];
  };
  logoBase64?: string;
  logoMimeType?: string;
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
      // Fall through to placeholder
    }
  }

  // Fallback: Draw placeholder when no logo is uploaded
  doc.rect(logoX, logoY, 150, 100).fill("#DC2626");

  // Add placeholder text below
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#4B5563")
    .text("CLIENT LOGO", logoX, logoY + 110, {
      width: 150,
      align: "center",
      lineBreak: false,
    });
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

  // Location line (slightly reduced spacing from company name)
  const locationText = `Location: ${sanitizeCountry(data.country)}`;
  doc
    .font(fonts.regular)
    .fontSize(12) // Reduced from 14 to 12
    .fillColor("#000000")
    .text(locationText, PAGE.marginX, titleY + 70, {
      // Reduced from +80 to +70 for slightly less space
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });

  // Industry line with base multiple (slightly reduced spacing from location)
  const baseMultiple = Number.isFinite(data.calculatedMultiple) && typeof data.calculatedMultiple === "number" ? (data.calculatedMultiple % 1 === 0 ? data.calculatedMultiple.toFixed(0) : data.calculatedMultiple.toFixed(1)) : undefined;

  const industryLine = `Industry: ${toDisplayLabel(data.industry) || "N/A"}${baseMultiple ? ` (Base Multiple: ${baseMultiple}x)` : ""}`;
  doc
    .font(fonts.semibold) // Changed from fonts.regular to fonts.semibold for slightly bold
    .fontSize(12) // Reduced from 14 to 12 to match location size
    .fillColor("#000000")
    .text(industryLine, PAGE.marginX, titleY + 95, {
      // Reduced from +110 to +95 for slightly less space
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });

  // Report generated date - split into regular and bold parts (increased space from industry)
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
    .text(regularPart, reportStartX, titleY + 150, {
      // Increased from +130 to +150 for more space from industry
      lineBreak: false,
    });

  // Bold date part
  doc
    .font(fonts.semibold)
    .fontSize(10)
    .fillColor("#000000")
    .text(dateText, reportStartX + reportRegularWidth, titleY + 150, {
      // Increased from +130 to +150 for more space from industry
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

function drawLegendRow(doc: PDFKit.PDFDocument, fonts: PdfFonts, x: number, y: number, width: number): void {
  const legendItems = [
    { color: "#22C55E", text: "40-50 points: 100% (1.0x)" },
    { color: "#EAB308", text: "30-39 points: 80% (0.8x)" },
    { color: "#F97316", text: "20-29 points: 50% (0.5x)" },
    { color: "#EF4444", text: "<20 points: 30% (0.3x)" },
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

function money(value: number | undefined): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return `$${Math.round(safe)}`;
}

function moneyComma(value: number | undefined): string {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return `$${Math.round(safe).toLocaleString("en-US")}`;
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

function formatYearLabel(year: string): string {
  const match = year.match(/(\d{4})/);
  return match ? match[1] : year;
}

function financialValue(data: RAVDAData, year: string, key: "sales" | "grossProfit" | "cogs" | "operatingExpenses" | "netProfitAndLoss" | "interestExpense" | "interestIncome" | "ebit"): number {
  return data.financialData?.[year]?.[key] ?? 0;
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

  // Metric cards - Row 1 (increased spacing from industry line)
  const cardsY1 = 190;
  const cardW = 160;
  const gap = 10;
  const x0 = PAGE.marginX;

  // Average Sales - Blue
  drawColoredMetricCard(doc, fonts, x0, cardsY1, cardW, "Average Sales", money(avgSales), "💰", "#EFF6FF", "#BFDBFE", "#1E40AF");

  // Average COGS - Gray
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY1, cardW, "Average COGS", money(avgCogs), "📊", "#F9FAFB", "#E5E7EB", "#374151");

  // Average EBIT - Green
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY1, cardW, "Average EBIT", money(avgEbit), "📈", "#F0FDF4", "#BBF7D0", "#15803D");

  // Metric cards - Row 2
  const cardsY2 = cardsY1 + 74;

  // Average Addbacks - Purple
  drawColoredMetricCard(doc, fonts, x0, cardsY2, cardW, "Average Addbacks", money(avgAddbacks), "➕", "#FAF5FF", "#E9D5FF", "#7C3AED");

  // Average Adjusted EBIT - Indigo
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY2, cardW, "Average Adjusted EBIT", money(avgAdjustedEbit), "✨", "#EEF2FF", "#C7D2FE", "#4F46E5");

  // Valuation Multiple - Orange
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY2, cardW, "Valuation Multiple", `${valuationMultiple.toFixed(2)}x`, "🎯", "#FFF7ED", "#FED7AA", "#C2410C");

  // Business Strength Assessment
  const assessmentY = cardsY2 + 84;
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

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280")
    .text("Rating", PAGE.marginX + assessmentW - 68, assessmentY + 10, { width: 68, align: "center", lineBreak: false });

  doc.roundedRect(PAGE.marginX + assessmentW - 68, assessmentY + 24, 68, 20, 10).fill(strengthRating.bg);

  doc
    .font(fonts.medium)
    .fontSize(8)
    .fillColor(strengthRating.text)
    .text(strengthRating.label, PAGE.marginX + assessmentW - 68, assessmentY + 30, { width: 68, align: "center", lineBreak: false });

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
    .text(moneyComma(data.finalValuation), panelX + 12, panelY + 34, { lineBreak: false });

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
  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#111827")
    .text(narrative, PAGE.marginX, PAGE.height - 150, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "justify",
      lineGap: 1.4,
    });

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("3", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawFinancialDataPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  // Dynamic title based on valuation method
  const methodTitle = data.valuationMethod === "asset" ? "Asset Method" : "Profit Method";
  doc.font(fonts.semibold).fontSize(16).fillColor("#111827").text(methodTitle, PAGE.marginX, 94, { lineBreak: false });

  // Year selection section
  const years = (data.financialYears || []).slice(0, 3);
  let yearY = 140;

  years.forEach((year, idx) => {
    const label = `Year ${idx + 1}:`;
    doc
      .font(fonts.regular)
      .fontSize(12)
      .fillColor("#111827")
      .text(label, PAGE.marginX, yearY + 8, { lineBreak: false });

    // Year input box
    doc.roundedRect(PAGE.marginX + 80, yearY, PAGE.width - PAGE.marginX * 2 - 80, 32, 4).fillAndStroke("#F3F4F6", "#E5E7EB");
    doc
      .font(fonts.regular)
      .fontSize(12)
      .fillColor("#111827")
      .text(formatYearLabel(year), PAGE.marginX + 90, yearY + 10, { lineBreak: false });

    yearY += 50;
  });

  // Accounting Profit and Loss Table
  const tableY = yearY + 30;
  const tableW = PAGE.width - PAGE.marginX * 2;
  const tableX = PAGE.marginX;

  // Table header
  doc.rect(tableX, tableY, tableW, 24).fill("#4A90E2");
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text("ACCOUNTING PROFIT AND LOSS", tableX + 12, tableY + 7, { lineBreak: false });

  // Column headers
  const headerY = tableY + 24;
  doc.rect(tableX, headerY, tableW, 28).fill("#F8F9FA");

  const metricW = 140;
  const colW = (tableW - metricW) / years.length;

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("METRIC", tableX + 12, headerY + 10, { lineBreak: false });

  years.forEach((year, idx) => {
    const colX = tableX + metricW + idx * colW;
    doc
      .font(fonts.bold)
      .fontSize(10)
      .fillColor("#374151")
      .text(`Year ${formatYearLabel(year)}`, colX + 12, headerY + 10, { width: colW - 24, align: "center", lineBreak: false });
  });

  // Financial data rows
  const financialRows = [
    { label: "Sales", key: "sales" as const },
    { label: "Gross Profit", key: "grossProfit" as const },
    { label: "COGS", key: "cogs" as const },
    { label: "Wages & on Costs", key: "operatingExpenses" as const },
    { label: "Net Profit and Loss", key: "netProfitAndLoss" as const },
    { label: "Interest Expense", key: "interestExpense" as const },
    { label: "Interest Income", key: "interestIncome" as const },
  ];

  let rowY = headerY + 28;
  financialRows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.rect(tableX, rowY, tableW, 24).fill("#FFFFFF");
    } else {
      doc.rect(tableX, rowY, tableW, 24).fill("#F8F9FA");
    }

    doc
      .font(fonts.regular)
      .fontSize(10)
      .fillColor("#111827")
      .text(row.label, tableX + 12, rowY + 8, { lineBreak: false });

    years.forEach((year, yearIdx) => {
      const colX = tableX + metricW + yearIdx * colW;
      const value = financialValue(data, year, row.key);
      doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#111827")
        .text(money(value), colX + 12, rowY + 8, { width: colW - 24, align: "center", lineBreak: false });
    });

    rowY += 24;
  });

  // EBIT Calculated row
  doc.rect(tableX, rowY, tableW, 28).fill("#BFDBFE");
  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#1F2937")
    .text("EBIT CALCULATED", tableX + 12, rowY + 9, { lineBreak: false });

  years.forEach((year, yearIdx) => {
    const colX = tableX + metricW + yearIdx * colW;
    const ebitValue = financialValue(data, year, "ebit");
    doc
      .font(fonts.bold)
      .fontSize(10)
      .fillColor("#1F2937")
      .text(money(ebitValue), colX + 12, rowY + 9, { width: colW - 24, align: "center", lineBreak: false });
  });

  // Addbacks section
  const addbacksY = rowY + 50;
  doc.rect(tableX, addbacksY, tableW, 24).fill("#4A90E2");
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text("ADDBACKS / ADJUSTMENTS", tableX + 12, addbacksY + 7, { lineBreak: false });

  // Addbacks table headers
  const addHeaderY = addbacksY + 24;
  doc.rect(tableX, addHeaderY, tableW, 28).fill("#F8F9FA");

  const addbackW = 80;
  const reasonW = 120;
  const addYearColW = (tableW - addbackW - reasonW) / years.length;

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("ADDBACK", tableX + 12, addHeaderY + 10, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#374151")
    .text("ADDBACK REASON", tableX + addbackW + 12, addHeaderY + 10, { lineBreak: false });

  years.forEach((year, idx) => {
    const colX = tableX + addbackW + reasonW + idx * addYearColW;
    doc
      .font(fonts.bold)
      .fontSize(10)
      .fillColor("#374151")
      .text(`Year ${formatYearLabel(year)}`, colX + 12, addHeaderY + 10, { width: addYearColW - 24, align: "center", lineBreak: false });
  });

  // Addback rows
  const addbacks = (data.addbacks || []).slice(0, 2);
  let addRowY = addHeaderY + 28;

  addbacks.forEach((addback, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.rect(tableX, addRowY, tableW, 24).fill("#FFFFFF");
    } else {
      doc.rect(tableX, addRowY, tableW, 24).fill("#F8F9FA");
    }

    doc
      .font(fonts.regular)
      .fontSize(10)
      .fillColor("#111827")
      .text(`Addback ${idx + 1}`, tableX + 12, addRowY + 8, { lineBreak: false });

    const reason = (addback?.reason || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    doc
      .font(fonts.regular)
      .fontSize(10)
      .fillColor("#111827")
      .text(reason, tableX + addbackW + 12, addRowY + 8, { width: reasonW - 24, lineBreak: false, ellipsis: true });

    years.forEach((year, yearIdx) => {
      const colX = tableX + addbackW + reasonW + yearIdx * addYearColW;
      const value = addback?.values?.[year] || 0;
      doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#111827")
        .text(money(value), colX + 12, addRowY + 8, { width: addYearColW - 24, align: "center", lineBreak: false });
    });

    addRowY += 24;
  });

  // Total addbacks row
  doc.rect(tableX, addRowY, tableW, 28).fill("#BFDBFE");
  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#1F2937")
    .text("TOTAL ADDBACKS", tableX + 12, addRowY + 9, { lineBreak: false });

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor("#1F2937")
    .text(money(data.totalAddbacks || 0), tableX + tableW - 120, addRowY + 9, { width: 100, align: "right", lineBreak: false });

  // Page number
  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("4", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
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

function drawProfitSummaryPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
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

  // Header - Profit Method Summary
  doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Profit Method Summary", PAGE.marginX, 94, { lineBreak: false });

  // Company name
  doc
    .font(fonts.semibold)
    .fontSize(14)
    .fillColor("#4B5563")
    .text(data.companyName || "Your Business", PAGE.marginX, 122, { lineBreak: false });

  // Industry and Country
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#6B7280")
    .text(`${toDisplayLabel(data.industry) || "Retail"} • ${sanitizeCountry(data.country)}`, PAGE.marginX, 140, { lineBreak: false });

  // Metric cards - Row 1
  const cardsY1 = 170;
  const cardW = 160;
  const gap = 10;
  const x0 = PAGE.marginX;

  // Average Sales - Blue
  drawColoredMetricCard(doc, fonts, x0, cardsY1, cardW, "Average Sales", money(avgSales), "💰", "#EFF6FF", "#BFDBFE", "#1E40AF");

  // Average COGS - Gray
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY1, cardW, "Average COGS", money(avgCogs), "📊", "#F9FAFB", "#E5E7EB", "#374151");

  // Average EBIT - Green
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY1, cardW, "Average EBIT", money(avgEbit), "📈", "#F0FDF4", "#BBF7D0", "#15803D");

  // Metric cards - Row 2
  const cardsY2 = cardsY1 + 74;

  // Average Addbacks - Purple
  drawColoredMetricCard(doc, fonts, x0, cardsY2, cardW, "Average Addbacks", money(avgAddbacks), "➕", "#FAF5FF", "#E9D5FF", "#7C3AED");

  // Average Adjusted EBIT - Indigo
  drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY2, cardW, "Average Adjusted EBIT", money(avgAdjustedEbit), "✨", "#EEF2FF", "#C7D2FE", "#4F46E5");

  // Valuation Multiple - Orange
  drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY2, cardW, "Valuation Multiple", `${valuationMultiple.toFixed(2)}x`, "🎯", "#FFF7ED", "#FED7AA", "#C2410C");

  // Business Strength Assessment
  const assessmentY = cardsY2 + 84;
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

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280")
    .text("Rating", PAGE.marginX + assessmentW - 80, assessmentY + 10, { width: 72, align: "right", lineBreak: false });

  doc.roundedRect(PAGE.marginX + assessmentW - 80, assessmentY + 24, 68, 20, 10).fill(strengthRating.bg);

  doc
    .font(fonts.medium)
    .fontSize(8)
    .fillColor(strengthRating.text)
    .text(strengthRating.label, PAGE.marginX + assessmentW - 80, assessmentY + 30, { width: 68, align: "center", lineBreak: false });

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
    .text(moneyComma(data.finalValuation), panelX + 12, panelY + 34, { lineBreak: false });

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
    .text(`Method: Profit Method • Multiple: ${valuationMultiple.toFixed(2)}x`, panelX + 12, panelY + 88, { lineBreak: false });

  const narrative = "This valuation estimate is generated from your financial performance, adjusted EBIT and selected valuation method. It is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";
  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#111827")
    .text(narrative, PAGE.marginX, panelY + panelH + 20, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "left",
      lineGap: 1.4,
    });

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("5", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawAssetSummaryPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  const assets = data.assets || { plantEquipment: 0, inventory: 0, vehicles: 0, goodwill: 0, otherIntangible: 0 };
  const liabilities = data.liabilities || { loans: 0, annualLeave: 0, longServiceLeave: 0, otherLiabilities: 0 };
  const totalAssets = typeof data.totalAssets === "number" ? data.totalAssets : assets.plantEquipment + assets.inventory + assets.vehicles + assets.goodwill + assets.otherIntangible;
  const totalLiabilities = typeof data.totalLiabilities === "number" ? data.totalLiabilities : liabilities.loans + liabilities.annualLeave + liabilities.longServiceLeave + liabilities.otherLiabilities;
  const netAssetValue = typeof data.finalValuation === "number" ? data.finalValuation : totalAssets - totalLiabilities;
  const strengthScore = getScoreOutOf50(data);
  const strengthRating = getStrengthRating(strengthScore);

  doc.font(fonts.semibold).fontSize(14).fillColor("#111827").text("Asset Method Summary", PAGE.marginX, 94, { lineBreak: false });
  // doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Business Valuation Report", 0, 135, { width: PAGE.width, align: "center", lineBreak: false });

  // Company info line with justified spacing
  const infoY = 175;
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

  const cardY = 210;
  const gap = 12;
  const x0 = PAGE.marginX + 26;
  drawMetricCard(doc, fonts, x0, cardY, "Total Assets", moneyComma(totalAssets));
  drawMetricCard(doc, fonts, x0 + 150 + gap, cardY, "Total Liabilities", moneyComma(totalLiabilities));

  const w = 150;
  const h = 62;
  const x3 = x0 + (150 + gap) * 2;
  doc.roundedRect(x3, cardY, w, h, 5).fillAndStroke("#DBEAFE", "#60A5FA");
  doc
    .font(fonts.bold)
    .fontSize(8)
    .fillColor("#111827")
    .text("Net Asset Value", x3, cardY + 14, { width: w, align: "center", lineBreak: false });
  doc
    .font(fonts.bold)
    .fontSize(16)
    .fillColor("#111827")
    .text(moneyComma(netAssetValue), x3, cardY + 32, { width: w, align: "center", lineBreak: false });

  // business strength assessment block
  const assessmentY = 286;
  const assessmentW = PAGE.width - PAGE.marginX * 2;
  const assessmentH = 52;
  doc.roundedRect(PAGE.marginX, assessmentY, assessmentW, assessmentH, 8).fillAndStroke("#FFFFFF", "#DBEAFE");
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
  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#6B7280")
    .text("Rating", PAGE.marginX + assessmentW - 90, assessmentY + 10, { width: 72, align: "right", lineBreak: false });
  doc.roundedRect(PAGE.marginX + assessmentW - 78, assessmentY + 24, 66, 20, 10).fill(strengthRating.bg);
  doc
    .font(fonts.medium)
    .fontSize(8)
    .fillColor(strengthRating.text)
    .text(strengthRating.label, PAGE.marginX + assessmentW - 78, assessmentY + 30, { width: 66, align: "center", lineBreak: false });

  const panelX = PAGE.marginX;
  const panelY = 356;
  const panelW = PAGE.width - PAGE.marginX * 2;
  const panelH = 110;
  doc.roundedRect(panelX, panelY, panelW, panelH, 12).fill("#2F80ED");
  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor("#EAF2FF")
    .text("Estimated Business Valuation", panelX + 12, panelY + 14, { lineBreak: false });
  doc
    .font(fonts.bold)
    .fontSize(32)
    .fillColor("#FFFFFF")
    .text(moneyComma(netAssetValue), panelX + 12, panelY + 34, { lineBreak: false });
  doc
    .moveTo(panelX + 12, panelY + 80)
    .lineTo(panelX + panelW - 12, panelY + 80)
    .lineWidth(1)
    .strokeColor("#5FA6FF")
    .stroke();
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#EAF2FF")
    .text("Method: Asset Method", panelX + 12, panelY + 88, { lineBreak: false });

  // Trophy image
  const trophyPath = path.join(__dirname, "../assets/win.png");
  if (fs.existsSync(trophyPath)) {
    doc.image(trophyPath, panelX + panelW - 52, panelY + 20, { width: 40 });
  }

  const narrative = "This valuation estimate is generated from your financial performance, adjusted EBIT and selected valuation method. It is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";
  doc
    .font(fonts.regular)
    .fontSize(9)
    .fillColor("#111827")
    .text(narrative, PAGE.marginX, 498, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "left",
      lineGap: 1.4,
    });

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("5", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
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
  doc.font(fonts.regular).fontSize(10).fillColor("#000000").text("2", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}
function drawDisclaimerPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
  drawIntaleksLogo(doc);

  let y = 96;
  doc.font(fonts.bold).fontSize(20).fillColor("#1F2937").text("BUSINESS VALUATION DISCLAIMER", 0, y, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
  y += 34;

  doc
    .font(fonts.regular)
    .fontSize(10)
    .fillColor("#FF0000")
    .text("DISCLAIMER - GUIDANCE ONLY (NOT LEGAL, FINANCIAL, OR PROFESSIONAL ADVICE)", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      align: "center",
      lineBreak: false,
    });
  y += 30;

  const intro = 'The valuation estimate generated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832), trading as Intaleks ("Intaleks") is a general informational guide only. It is based on automated modelling, user-provided inputs, and available data sources.';
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#111827")
    .text(intro, PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 1.5,
    });
  y += 66;

  doc.font(fonts.bold).fontSize(13).fillColor("#111827").text("This valuation is not:", PAGE.marginX, y, { lineBreak: false });
  y += 16;
  const bullets = ["• A certified business valuation", "• A legal valuation for court, taxation, or regulatory purposes", "• Financial, accounting, investment, or legal advice", "• A substitute for professional valuation services"];
  bullets.forEach((b) => {
    doc
      .font(fonts.regular)
      .fontSize(11)
      .fillColor("#111827")
      .text(b, PAGE.marginX, y, {
        width: PAGE.width - PAGE.marginX * 2,
        lineBreak: false,
      });
    y += 16;
  });
  y += 12;

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#111827")
    .text("The results are estimates only and may not reflect actual market value or current economic conditions. No action or decision should be made based solely on this valuation output.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 1.5,
    });
  y += 50;

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#111827")
    .text("For legal proceedings, taxation matters, lending requirements, compliance purposes, or formal business transactions, you must obtain a qualified, independent, and certified professional valuation.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 1.5,
    });
  y += 50;

  doc.font(fonts.bold).fontSize(13).fillColor("#111827").text("Limitation of Liability", PAGE.marginX, y, { lineBreak: false });
  y += 14;
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor("#111827")
    .text("Intaleks accepts no liability for any loss, decision, or action taken in reliance on the valuation estimate.", PAGE.marginX, y, {
      width: PAGE.width - PAGE.marginX * 2,
      lineGap: 1.5,
    });
  y += 50;

  const noticeX = PAGE.marginX;
  const noticeY = y;
  const noticeW = PAGE.width - PAGE.marginX * 2;
  const noticeH = 60;
  doc.rect(noticeX, noticeY, noticeW, noticeH).fillAndStroke("#FEE2E2", "#EF4444");
  doc
    .font(fonts.bold)
    .fontSize(10.5)
    .fillColor("#FF0000")
    .text("IMPORTANT LEGAL NOTICE", noticeX + 10, noticeY + 12, {
      lineBreak: false,
    });
  doc
    .font(fonts.regular)
    .fontSize(9.5)
    .fillColor("#111827")
    .text("The Platform provides automated valuation estimates only and is NOT a certified valuation and CANNOT be used for legal, tax, court, or regulatory purposes.", noticeX + 10, noticeY + 30, {
      width: noticeW - 20,
      lineGap: 1.2,
    });

  const generated = data.generatedDate || new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  doc.font(fonts.bold).fontSize(11).fillColor("#111827").text("Perth Business Evaluators Pty", PAGE.marginX, 673, { lineBreak: false });
  doc.font(fonts.regular).fontSize(10).fillColor("#6B7280").text("Ltd ABN: 51 622 231 832", PAGE.marginX, 688, { lineBreak: false });
  doc.font(fonts.regular).fontSize(10).fillColor("#6B7280").text("Trading as: Intaleks", PAGE.marginX, 702, { lineBreak: false });
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("Email: aleks@executivebusinessevaluers.com.au", PAGE.marginX, 716, { lineBreak: false });
  doc.font(fonts.regular).fontSize(10.5).fillColor("#111827").text(`Generated: ${generated}`, PAGE.marginX, 736, { lineBreak: false, oblique: true });

  const ravdaText = "The RAVDA is a proprietary tool developed by Intaleks to help business owners understand the key risk and value drivers. A high RAVDA score usually indicates lower risks and potentially a more valuable business. The score is calculated using a combination of your responses and industry data. The score is intended as an introduction to assess key risk and value drivers. There may be omissions or inaccuracies, and the reader needs to make their own enquiries before making any decision. The issuer shall not be held liable for any loss or damage arising from relying on this document.";
  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#111827")
    .text(ravdaText, PAGE.marginX, 752, {
      width: PAGE.width - PAGE.marginX * 2,
      height: 34,
      ellipsis: true,
      lineGap: 1.2,
    });

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("7", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

function drawOutroPage(doc: PDFKit.PDFDocument, data: RAVDAData, fonts: PdfFonts): void {
  doc.addPage();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");

  const logoPngPath = path.join(__dirname, "../assets/intaleks.png");
  const logoJpgPath = path.join(__dirname, "../assets/intaleks.jpg");
  const logoPath = fs.existsSync(logoPngPath) ? logoPngPath : logoJpgPath;

  const centerX = PAGE.width / 2;
  const logoY = 382;
  if (fs.existsSync(logoPath)) {
    const width = 260;
    doc.image(logoPath, centerX - width / 2, logoY, { width });
  } else {
    doc
      .font(fonts.bold)
      .fontSize(54)
      .fillColor("#111827")
      .text("intaleks", 0, logoY + 20, { width: PAGE.width, align: "center" });
  }

  doc.font(fonts.regular).fontSize(14).fillColor("#9CA3AF").text("intaleks.com", 0, 448, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });

  const generatedText = `Report generated ${formatGeneratedDate(data.generatedDate)}`;
  doc.font(fonts.regular).fontSize(15).fillColor("#111827").text(generatedText, 0, 470, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });

  const footerY = PAGE.height - PAGE.marginX - 20;
  doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("7", 0, footerY, {
    width: PAGE.width,
    align: "center",
    lineBreak: false,
  });
}

export async function generateRAVDAScorecardPDF(data: RAVDAData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: PAGE.marginX, size: "A4" });
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
    drawCenteredIntroPage(doc, data, fonts); // Page 1
    drawEarlyDisclaimerPage(doc, data, fonts); // Page 2 - Early disclaimer
    if (data.valuationMethod === "asset") {
      drawAssetSummaryPage(doc, data, fonts); // Page 3 - Asset summary
    } else if (data.valuationMethod === "profit") {
      drawValuationSummaryPage(doc, data, fonts); // Page 3 - Well-formatted valuation summary
    }
    drawFinancialDataPage(doc, data, fonts); // Page 4 - Financial data with method-specific title

    doc.end();
  });
}
