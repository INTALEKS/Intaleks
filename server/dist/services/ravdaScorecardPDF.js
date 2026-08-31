"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRAVDAScorecardPDF = generateRAVDAScorecardPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PAGE = {
    width: 595,
    height: 842,
    marginX: 50,
};
const FONT_REGULAR = "Inter";
const FONT_MEDIUM = "Inter-Medium";
const FONT_SEMIBOLD = "Inter-SemiBold";
const FONT_BOLD = "Inter-Bold";
const REPORT_NAVY = "#1E3157";
const REPORT_NAVY_ALT = "#294878";
const REPORT_GOLD = "#C99022";
const REPORT_LIGHT = "#F5F7F9";
const REPORT_TOTAL = "#EAF0F6";
const REPORT_BORDER = "#D6DEE8";
const REPORT_MUTED = "#6B7280";
const COUNTRY_CURRENCY_MAP = {
    australia: { symbol: "$", code: "AUD" },
    "united states": { symbol: "$", code: "USD" },
    "united kingdom": { symbol: "£", code: "GBP" },
    canada: { symbol: "$", code: "CAD" },
    china: { symbol: "¥", code: "CNY" },
    indonesia: { symbol: "Rp", code: "IDR" },
};
/** Returns a formatted currency string, e.g. "$50 AUD", "£50", "¥50" */
function formatMoney(value, symbol, code) {
    const safe = Number.isFinite(value) ? Math.round(value) : 0;
    const formatted = safe.toLocaleString("en-US");
    // Append ISO code for dollar currencies to disambiguate
    const suffix = code === "AUD" || code === "CAD" || code === "USD" ? ` ${code}` : "";
    return `${symbol}${formatted}${suffix}`;
}
/** Returns a formatted currency string without the ISO code suffix — used in table cells */
function formatMoneyNoCode(value, symbol) {
    const safe = Number.isFinite(value) ? Math.round(value) : 0;
    return `${symbol}${safe.toLocaleString("en-US")}`;
}
function getCurrencySymbolForCountry(country) {
    if (!country)
        return "$";
    return COUNTRY_CURRENCY_MAP[country.toLowerCase()]?.symbol ?? "$";
}
function getCurrencyCodeForCountry(country) {
    if (!country)
        return "AUD";
    return COUNTRY_CURRENCY_MAP[country.toLowerCase()]?.code ?? "AUD";
}
function formatGeneratedDate(input) {
    if (!input) {
        const now = new Date();
        const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
        return `${now.getDate()} ${month}, ${now.getFullYear()}`;
    }
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    const parsed = dateOnlyMatch
        ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
        : new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
        const month = parsed.toLocaleString("en-US", { month: "short" }).toUpperCase();
        return `${parsed.getDate()} ${month}, ${parsed.getFullYear()}`;
    }
    return input.toUpperCase();
}
function toDisplayLabel(value) {
    if (!value)
        return "";
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}
function sanitizeCountry(value) {
    if (!value)
        return "";
    // Remove regional indicator emoji flags and trim extra spaces
    const cleaned = value.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").trim();
    return toDisplayLabel(cleaned);
}
function fitTitleFontSize(doc, text, fontName, min, max, width) {
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
function drawIntaleksLogo(doc) {
    const pngPath = path_1.default.join(__dirname, "../assets/intaleks.png");
    const jpgPath = path_1.default.join(__dirname, "../assets/intaleks.jpg");
    const logoPath = fs_1.default.existsSync(pngPath) ? pngPath : jpgPath;
    if (!fs_1.default.existsSync(logoPath)) {
        return;
    }
    const width = 110;
    const x = PAGE.width - PAGE.marginX - width;
    doc.image(logoPath, x, 50, { width });
}
function drawClientLogo(doc, data) {
    const logoX = (PAGE.width - 150) / 2; // Centered horizontally
    const logoY = 120; // Moved down from 80 to 120
    // If client uploaded a logo via frontend, use it
    if (data.logoBase64 && data.logoMimeType) {
        try {
            // Convert base64 to buffer and add to PDF
            const logoBuffer = Buffer.from(data.logoBase64, "base64");
            doc.image(logoBuffer, logoX, logoY, { width: 150, height: 100, fit: [150, 100] });
            return;
        }
        catch (error) {
            console.error("Error loading client logo:", error);
            // Fall through - no logo will be displayed
        }
    }
    // No logo provided - skip rendering entirely (logo is optional)
}
function registerInterFonts(doc) {
    const fontsDir = [path_1.default.join(__dirname, "../assets/fonts"), path_1.default.join(__dirname, "../../assets/fonts")].find((dir) => fs_1.default.existsSync(dir));
    if (!fontsDir) {
        return {
            regular: "Helvetica",
            medium: "Helvetica",
            semibold: "Helvetica-Bold",
            bold: "Helvetica-Bold",
        };
    }
    const regularPath = path_1.default.join(fontsDir, "Inter-Regular.ttf");
    const mediumPath = path_1.default.join(fontsDir, "Inter-Medium.ttf");
    const semiboldPath = path_1.default.join(fontsDir, "Inter-SemiBold.ttf");
    const boldPath = path_1.default.join(fontsDir, "Inter-Bold.ttf");
    // Register static Inter fonts with different weights
    if (fs_1.default.existsSync(regularPath)) {
        doc.registerFont(FONT_REGULAR, regularPath);
    }
    if (fs_1.default.existsSync(mediumPath)) {
        doc.registerFont(FONT_MEDIUM, mediumPath);
    }
    if (fs_1.default.existsSync(semiboldPath)) {
        doc.registerFont(FONT_SEMIBOLD, semiboldPath);
    }
    if (fs_1.default.existsSync(boldPath)) {
        doc.registerFont(FONT_BOLD, boldPath);
    }
    return {
        regular: FONT_REGULAR,
        medium: FONT_MEDIUM,
        semibold: FONT_SEMIBOLD,
        bold: FONT_BOLD,
    };
}
function drawPlaceholderCompanyLogo(doc) {
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
function drawCompanyLogo(doc, data) {
    if (data.logoBase64) {
        try {
            const logoBuffer = Buffer.from(data.logoBase64, "base64");
            const width = 120;
            const height = 90;
            const x = (PAGE.width - width) / 2;
            doc.image(logoBuffer, x, 300, { fit: [width, height], align: "center", valign: "center" });
            return true;
        }
        catch {
            // fallback handled below
        }
    }
    // Do not render fallback icon; sample styling shows text-only when no company logo is provided.
    return false;
}
function drawPageHeader(doc, data, fonts) {
    const pngPath = path_1.default.join(__dirname, "../assets/intaleks.png");
    const logoWidth = 90;
    if (fs_1.default.existsSync(pngPath)) {
        doc.image(pngPath, PAGE.marginX, 35, { width: logoWidth });
    }
    const title = `${data.companyName || "Company"} · Valuation Guidance Report`;
    doc
        .font(fonts.regular)
        .fontSize(8.5)
        .fillColor("#6B7280")
        .text(title, PAGE.width - PAGE.marginX - 250, 42, {
        width: 250,
        align: "right",
        lineBreak: false,
    });
    doc
        .moveTo(PAGE.marginX, 62)
        .lineTo(PAGE.width - PAGE.marginX, 62)
        .lineWidth(0.5)
        .strokeColor("#E5E7EB")
        .stroke();
}
function drawPageFooter(doc, fonts, pageNumber) {
    const footerY = PAGE.height - PAGE.marginX - 16;
    doc
        .font(fonts.regular)
        .fontSize(7.5)
        .fillColor("#9CA3AF")
        .text("Confidential - prepared for planning and advisory discussion only", PAGE.marginX, footerY, {
        lineBreak: false,
    });
    const pageStr = `Page ${pageNumber}`;
    doc
        .font(fonts.regular)
        .fontSize(7.5)
        .fillColor("#9CA3AF")
        .text(pageStr, PAGE.width - PAGE.marginX - 50, footerY, {
        width: 50,
        align: "right",
        lineBreak: false,
    });
}
function drawGuidanceCoverPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    const headerBarHeight = 35;
    doc.rect(0, 0, PAGE.width, headerBarHeight).fill("#0F172A");
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("BUSINESS VALUATION GUIDANCE REPORT", PAGE.width - PAGE.marginX - 220, 14, {
        align: "right",
        width: 220,
        lineBreak: false,
    });
    const pngPath = path_1.default.join(__dirname, "../assets/intaleks.png");
    if (fs_1.default.existsSync(pngPath)) {
        doc.image(pngPath, PAGE.marginX, 55, { width: 110 });
    }
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#B45309")
        .text("BUSINESS VALUATION GUIDANCE REPORT", PAGE.width - PAGE.marginX - 220, 90, {
        align: "right",
        width: 220,
        lineBreak: false,
    });
    const bullPath = path_1.default.join(__dirname, "../assets/win.png");
    const clientEBVLogoPath = path_1.default.join(__dirname, "../../client/public/Executive-Business-Valuers.png");
    const eBVLogoPath = path_1.default.join(__dirname, "../assets/Executive-Business-Valuers.png");
    let logoToUse = bullPath;
    if (!fs_1.default.existsSync(logoToUse) && fs_1.default.existsSync(clientEBVLogoPath))
        logoToUse = clientEBVLogoPath;
    if (!fs_1.default.existsSync(logoToUse) && fs_1.default.existsSync(eBVLogoPath))
        logoToUse = eBVLogoPath;
    if (fs_1.default.existsSync(logoToUse)) {
        doc.image(logoToUse, (PAGE.width - 80) / 2, 125, { width: 80, height: 80, fit: [80, 80] });
    }
    const companyName = data.companyName || "Your Company";
    const titleY = 225;
    doc
        .font(fonts.bold)
        .fontSize(32)
        .fillColor("#0F172A")
        .text(companyName, PAGE.marginX, titleY, {
        width: PAGE.width - PAGE.marginX * 2,
        lineBreak: false,
        ellipsis: true,
    });
    doc
        .moveTo(PAGE.marginX, titleY + 45)
        .lineTo(PAGE.width - PAGE.marginX, titleY + 45)
        .lineWidth(2)
        .strokeColor("#D97706")
        .stroke();
    const baseMultiple = typeof data.calculatedMultiple === "number" ? (data.calculatedMultiple % 1 === 0 ? data.calculatedMultiple.toFixed(0) : data.calculatedMultiple.toFixed(1)) : "0";
    const approachVal = data.valuationMethod === "both" ? "Asset and Profit Methods - two valuation perspectives" : data.valuationMethod === "asset" ? "Asset Method - fair market value basis" : "Profit Method - earnings multiple basis";
    const metadata = [
        { label: "Report date", value: formatGeneratedDate(data.generatedDate) },
        { label: "Jurisdiction", value: sanitizeCountry(data.country || "Australia") },
        { label: "Industry", value: `${toDisplayLabel(data.industry)} (base multiple ${baseMultiple}x)` },
        { label: "Valuation approach", value: approachVal },
    ];
    let metaY = titleY + 60;
    const rowHeight = 24;
    metadata.forEach((item) => {
        doc
            .moveTo(PAGE.marginX, metaY + rowHeight)
            .lineTo(PAGE.width - PAGE.marginX, metaY + rowHeight)
            .lineWidth(0.5)
            .strokeColor("#E5E7EB")
            .stroke();
        doc
            .font(fonts.regular)
            .fontSize(9.5)
            .fillColor("#4B5563")
            .text(item.label, PAGE.marginX + 8, metaY + 6, { width: 140, lineBreak: false });
        doc
            .font(fonts.semibold)
            .fontSize(9.5)
            .fillColor("#111827")
            .text(item.value, PAGE.marginX + 160, metaY + 6, { width: PAGE.width - PAGE.marginX * 2 - 168, lineBreak: false });
        metaY += rowHeight + 4;
    });
    const boxY = metaY + 16;
    const boxW = PAGE.width - PAGE.marginX * 2;
    const isCombined = data.valuationMethod === "both";
    const boxH = isCombined ? 132 : 95;
    doc.rect(PAGE.marginX, boxY, boxW, 4).fill("#D97706");
    doc.rect(PAGE.marginX, boxY + 4, boxW, boxH - 4).fill("#0F172A");
    const score = getScoreOutOf50(data);
    const strengthRating = getStrengthRating(score);
    if (isCombined) {
        const assetValue = data.assetValuation ?? 0;
        const profitValue = data.profitValuation ?? data.finalValuation ?? 0;
        const innerX = PAGE.marginX + 16;
        const innerW = boxW - 32;
        const columnW = (innerW - 24) / 2;
        const rightX = innerX + columnW + 24;
        doc
            .font(fonts.bold)
            .fontSize(8.5)
            .fillColor("#FCD34D")
            .text("TWO VALUATION PERSPECTIVES", innerX, boxY + 16, { width: innerW, align: "center", lineBreak: false });
        doc
            .moveTo(innerX + columnW + 12, boxY + 39)
            .lineTo(innerX + columnW + 12, boxY + 96)
            .lineWidth(0.75)
            .strokeColor("#475569")
            .stroke();
        const drawMethodValue = (x, label, value, basis) => {
            doc.font(fonts.semibold).fontSize(8).fillColor("#BFDBFE").text(label, x, boxY + 42, {
                width: columnW,
                align: "center",
                lineBreak: false,
            });
            doc.font(fonts.bold).fontSize(20).fillColor("#FFFFFF").text(moneyComma(value, data.currencySymbol, data.currencyCode), x, boxY + 57, {
                width: columnW,
                align: "center",
                lineBreak: false,
            });
            doc.font(fonts.regular).fontSize(7.5).fillColor("#CBD5E1").text(basis, x, boxY + 84, {
                width: columnW,
                align: "center",
                lineBreak: false,
            });
        };
        drawMethodValue(innerX, "ASSET METHOD", assetValue, "Fair market value of assets less liabilities");
        drawMethodValue(rightX, "PROFIT METHOD", profitValue, "Adjusted EBIT x selected earnings multiple");
        doc
            .font(fonts.regular)
            .fontSize(8.5)
            .fillColor("#DBEAFE")
            .text(`Business Strength Assessment ${score} / 50 (${strengthRating.label})`, innerX, boxY + 109, {
            width: innerW,
            align: "center",
            lineBreak: false,
        });
    }
    else {
        const singleValue = data.valuationMethod === "asset"
            ? data.assetValuation ?? data.finalValuation
            : data.profitValuation ?? data.finalValuation;
        const methodDetail = data.valuationMethod === "asset" ? "Asset Method" : "Profit Method";
        doc
            .font(fonts.bold)
            .fontSize(8.5)
            .fillColor("#FCD34D")
            .text("ESTIMATED BUSINESS VALUATION - FAIR MARKET VALUE", PAGE.marginX + 16, boxY + 16, { lineBreak: false });
        doc
            .font(fonts.bold)
            .fontSize(26)
            .fillColor("#FFFFFF")
            .text(moneyComma(singleValue, data.currencySymbol, data.currencyCode), PAGE.marginX + 16, boxY + 30, { lineBreak: false });
        doc
            .font(fonts.regular)
            .fontSize(9)
            .fillColor("#DBEAFE")
            .text(`${methodDetail} - Business Strength Assessment ${score} / 50 (${strengthRating.label})`, PAGE.marginX + 16, boxY + 66, { lineBreak: false });
    }
    const disclaimerY = boxY + boxH + 20;
    const disclaimerText = "IMPORTANT — GUIDANCE ONLY. This report is an automated valuation guidance estimate produced by Perth Business Evaluators Pty Ltd (ABN 51 622 231 832) trading as Intaleks. It is not a certified business valuation and is not financial, accounting, investment, or legal advice. Results are estimates only and may not reflect actual market value or current economic conditions.\n\n" +
        "This report cannot be used for legal, tax, court, lending, or regulatory purposes. For those matters, obtain a qualified, independent, certified professional valuation. Intaleks accepts no liability for any loss, decision, or action taken in reliance on this estimate.";
    doc
        .font(fonts.regular)
        .fontSize(8.5)
        .fillColor("#374151")
        .text(disclaimerText, PAGE.marginX, disclaimerY, {
        width: PAGE.width - PAGE.marginX * 2,
        lineGap: 2.5,
        align: "justify",
    });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#4B5563")
        .text("Perth Business Evaluators Pty Ltd (ABN 51 622 231 832) trading as Intaleks", PAGE.marginX, footerY - 26, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
    });
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#4B5563")
        .text("Level 35, 100 Barangaroo Avenue, Sydney NSW 2000", PAGE.marginX, footerY - 14, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
    });
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#4B5563")
        .text(`Phone: +61 2 8088 0798  ·  Email: admin@intaleks.com`, PAGE.marginX, footerY - 2, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
    });
}
const questionDefinitions = [
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
function getScoreOutOf50(data) {
    if (typeof data.questionnaireScore === "number" && Number.isFinite(data.questionnaireScore)) {
        return Math.max(0, Math.min(50, Math.round(data.questionnaireScore)));
    }
    if (typeof data.score === "number" && Number.isFinite(data.score)) {
        return Math.max(0, Math.min(50, Math.round(data.score * 5)));
    }
    return 25;
}
function getStrengthBand(scoreOutOf50) {
    if (scoreOutOf50 >= 40)
        return { color: "#22C55E", factorText: "100% (1.0x)" };
    if (scoreOutOf50 >= 30)
        return { color: "#EAB308", factorText: "80% (0.8x)" };
    if (scoreOutOf50 >= 20)
        return { color: "#F97316", factorText: "50% (0.5x)" };
    return { color: "#EF4444", factorText: "30% (0.3x)" };
}
function getStrengthRating(scoreOutOf50) {
    if (scoreOutOf50 >= 40)
        return { label: "Excellent", bg: "#DCFCE7", text: "#166534" };
    if (scoreOutOf50 >= 30)
        return { label: "Good", bg: "#FEF3C7", text: "#92400E" };
    if (scoreOutOf50 >= 20)
        return { label: "Average", bg: "#FFEDD5", text: "#9A3412" };
    return { label: "Below Average", bg: "#FEE2E2", text: "#991B1B" };
}
function getValuationMultipleColors(scoreOutOf50) {
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
function drawLegendRow(doc, fonts, x, y, width) {
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
    const getTotalWidth = (size, gap) => {
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
function money(value, currencySymbol = "$", currencyCode = "AUD") {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return formatMoney(safe, currencySymbol, currencyCode);
}
function moneyComma(value, currencySymbol = "$", currencyCode = "AUD") {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return formatMoney(safe, currencySymbol, currencyCode);
}
/** Currency format without ISO code suffix — for use in table cells */
function moneyCell(value, currencySymbol = "$") {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return formatMoneyNoCode(safe, currencySymbol);
}
function drawInputRow(doc, fonts, y, label, value) {
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
function parseColumnHeader(year) {
    // Format with date: "Year N - DD/MM/YYYY"
    const withDate = year.match(/^(.+?)\s*-\s*(\d{2}\/\d{2}\/\d{4})$/);
    if (withDate)
        return { line1: withDate[1].trim(), line2: withDate[2].trim() };
    // Default: use column label as-is (e.g., "Year 1", "Year 2", "Year 3", "Year 4")
    return { line1: year, line2: "" };
}
function formatYearLabel(year) {
    const { line1 } = parseColumnHeader(year);
    return line1;
}
function financialValue(data, year, key) {
    return data.financialData?.[year]?.[key] ?? 0;
}
function drawBusinessStrengthAssessmentPanel(doc, data, fonts, assessmentY) {
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
function drawMultipleCalculationFormulaSection(doc, fonts, topY) {
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
function drawValuationSummaryPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawPageHeader(doc, data, fonts);
    const years = (data.financialYears || []).slice(0, 3);
    const yearCount = years.length || 1;
    const sumBy = (key) => years.reduce((sum, year) => sum + (data.financialData?.[year]?.[key] || 0), 0);
    const avgSales = sumBy("sales") / yearCount;
    const avgCogs = sumBy("cogs") / yearCount;
    const avgEbit = typeof data.averageEbit === "number" ? data.averageEbit : sumBy("ebit") / yearCount;
    const avgAddbacks = yearCount > 0 ? (data.totalAddbacks || 0) / yearCount : 0;
    const avgAdjustedEbit = typeof data.adjustedEbit === "number" ? data.adjustedEbit : avgEbit + avgAddbacks;
    const valuationMultiple = typeof data.calculatedMultiple === "number" ? data.calculatedMultiple : 0;
    const profitValuation = data.profitValuation ?? data.finalValuation ?? 0;
    const strengthScore = getScoreOutOf50(data);
    const strengthRating = getStrengthRating(strengthScore);
    const valuationMultipleColors = getValuationMultipleColors(strengthScore);
    drawReportSectionTitle(doc, fonts, "Valuation summary", "Profit Method", "The profit method estimates value from sustainable earnings by applying the selected valuation multiple to average adjusted EBIT.");
    // Metric cards - Row 1 (increased spacing from method description)
    const cardsY1 = 186;
    const cardW = 160;
    const gap = 10;
    const x0 = PAGE.marginX;
    // Average Sales - Blue
    drawColoredMetricCard(doc, fonts, x0, cardsY1, cardW, "Average Sales", money(avgSales, data.currencySymbol, data.currencyCode), "", REPORT_LIGHT, REPORT_BORDER, REPORT_NAVY);
    // Average COGS - Gray
    drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY1, cardW, "Average COGS", money(avgCogs, data.currencySymbol, data.currencyCode), "", REPORT_LIGHT, REPORT_BORDER, REPORT_NAVY);
    // Average EBIT - fixed indigo (distinct from valuation multiple band colors)
    drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY1, cardW, "Average EBIT", money(avgEbit, data.currencySymbol, data.currencyCode), "", REPORT_LIGHT, REPORT_BORDER, REPORT_NAVY);
    // Metric cards - Row 2
    const cardsY2 = cardsY1 + 74;
    // Average Addbacks - Neutral gray
    drawColoredMetricCard(doc, fonts, x0, cardsY2, cardW, "Average Addbacks", money(avgAddbacks, data.currencySymbol, data.currencyCode), "", REPORT_LIGHT, REPORT_BORDER, REPORT_NAVY);
    // Average Adjusted EBIT - Purple (distinct from both EBIT and Valuation Multiple)
    drawColoredMetricCard(doc, fonts, x0 + cardW + gap, cardsY2, cardW, "Average Adjusted EBIT", money(avgAdjustedEbit, data.currencySymbol, data.currencyCode), "", REPORT_TOTAL, REPORT_GOLD, REPORT_NAVY);
    // Valuation Multiple - dynamic color following strength rating bands
    drawColoredMetricCard(doc, fonts, x0 + (cardW + gap) * 2, cardsY2, cardW, "Valuation Multiple", `${valuationMultiple.toFixed(2)}x`, "", REPORT_TOTAL, REPORT_GOLD, REPORT_GOLD);
    const panelBottom = drawLegacyValuationPanel(doc, data, fonts, cardsY2 + 86, profitValuation, "Profit Method");
    doc
        .font(fonts.regular)
        .fontSize(8.5)
        .fillColor("#30343B")
        .text("This automated guidance estimate is based on the financial information, addbacks, business strength assessment and valuation multiple shown in this report. It supports planning and advisor discussions, but is not a certified valuation for tax, legal, lending or regulatory purposes.", PAGE.marginX, panelBottom + 16, { width: PAGE.width - PAGE.marginX * 2, lineGap: 2, align: "justify" });
    drawPageFooter(doc, fonts, 3);
}
function drawReportSectionTitle(doc, fonts, eyebrow, title, description) {
    doc.font(fonts.semibold).fontSize(8.5).fillColor(REPORT_GOLD).text(eyebrow.toUpperCase(), PAGE.marginX, 78, {
        lineBreak: false,
    });
    doc.font(fonts.bold).fontSize(21).fillColor(REPORT_NAVY).text(title, PAGE.marginX, 96, { lineBreak: false });
    doc.rect(PAGE.marginX, 128, 65, 2).fill(REPORT_GOLD);
    if (description) {
        doc.font(fonts.regular).fontSize(8.5).fillColor("#30343B").text(description, PAGE.marginX, 148, {
            width: PAGE.width - PAGE.marginX * 2,
            lineGap: 1.5,
        });
    }
    return description ? 176 : 148;
}
function drawLegacyValuationPanel(doc, data, fonts, y, value, method) {
    const width = PAGE.width - PAGE.marginX * 2;
    const height = 88;
    const score = getScoreOutOf50(data);
    const rating = getStrengthRating(score);
    doc.rect(PAGE.marginX, y, width, 4).fill(REPORT_GOLD);
    doc.rect(PAGE.marginX, y + 4, width, height - 4).fill(REPORT_NAVY);
    doc.font(fonts.bold).fontSize(8).fillColor(REPORT_GOLD).text("ESTIMATED BUSINESS VALUATION - FAIR MARKET VALUE", PAGE.marginX + 20, y + 20, {
        lineBreak: false,
    });
    doc.font(fonts.bold).fontSize(20).fillColor("#FFFFFF").text(moneyComma(value, data.currencySymbol, data.currencyCode), PAGE.marginX + 20, y + 36, {
        lineBreak: false,
    });
    doc.font(fonts.regular).fontSize(8.5).fillColor("#D6DEEA").text(`Method: ${method}`, PAGE.marginX + 20, y + 62, {
        lineBreak: false,
    });
    doc.font(fonts.regular).fontSize(8).fillColor("#D6DEEA").text("Business strength", PAGE.width - PAGE.marginX - 120, y + 28, {
        width: 100,
        align: "right",
        lineBreak: false,
    });
    doc.font(fonts.bold).fontSize(14).fillColor("#FFFFFF").text(`${score} / 50`, PAGE.width - PAGE.marginX - 120, y + 42, {
        width: 100,
        align: "right",
        lineBreak: false,
    });
    doc.font(fonts.regular).fontSize(8.5).fillColor(REPORT_GOLD).text(rating.label, PAGE.width - PAGE.marginX - 120, y + 61, {
        width: 100,
        align: "right",
        lineBreak: false,
    });
    return y + height;
}
function drawFinancialDataPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawPageHeader(doc, data, fonts);
    let currentPageNumber = doc.bufferedPageRange().count;
    drawReportSectionTitle(doc, fonts, "Supporting data", "Valuation Inputs", "The figures below reflect the information provided as part of this valuation guidance report.");
    // Year selection section - show column type and period date
    const years = (data.financialYears || []).slice(0, 3);
    let yearY = 166;
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
    const tableY = yearY + 10;
    const tableW = PAGE.width - PAGE.marginX * 2;
    const tableX = PAGE.marginX;
    // Table header
    doc.rect(tableX, tableY, tableW, 24).fill(REPORT_NAVY);
    doc
        .font(fonts.bold)
        .fontSize(11)
        .fillColor("#FFFFFF")
        .text("ACCOUNTING PROFIT AND LOSS", tableX + 12, tableY + 7, { lineBreak: false });
    // Column headers
    const headerY = tableY + 24;
    doc.rect(tableX, headerY, tableW, 32).fill(REPORT_NAVY_ALT);
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
        .fillColor("#FFFFFF")
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
            doc.fillColor("#FFFFFF").text(line1, line1X, headerY + 6, { lineBreak: false, continued: false });
            // Reset cursor to prevent interference
            doc.x = savedX;
            doc.y = savedY;
            doc.fillColor("#FFFFFF").text(line2, line2X, headerY + 18, { lineBreak: false, continued: false });
            // Reset cursor again
            doc.x = savedX;
            doc.y = savedY;
        }
        else {
            // Single line - manually center
            doc.font(fonts.bold).fontSize(9);
            const lineWidth = doc.widthOfString(line1);
            const lineX = colX + (colW - lineWidth) / 2;
            // Save cursor position
            const savedX = doc.x;
            const savedY = doc.y;
            doc.fillColor("#FFFFFF").text(line1, lineX, headerY + 12, { lineBreak: false, continued: false });
            // Reset cursor
            doc.x = savedX;
            doc.y = savedY;
        }
    });
    // Financial data rows
    const financialRows = [
        { label: "Sales", key: "sales" },
        { label: "Other Income", key: "otherIncome" },
        { label: "COGS", key: "cogs" },
        { label: "Gross Profit", key: "grossProfit" },
        { label: "Operating Expenses", key: "operatingExpenses" },
        { label: "Net Profit and Loss", key: "netProfitAndLoss" },
        { label: "Interest Expense", key: "interestExpense" },
        { label: "Interest Income", key: "interestIncome" },
    ];
    const rowHeight = 26;
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
    doc.rect(tableX, rowY, tableW, rowHeight).fill(REPORT_TOTAL);
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
        if (addback.reason && addback.reason.trim().length > 0)
            return true;
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
    doc.rect(tableX, actualAddbacksY, tableW, 24).fill(REPORT_NAVY);
    doc
        .font(fonts.bold)
        .fontSize(11)
        .fillColor("#FFFFFF")
        .text("ADDBACKS / ADJUSTMENTS", tableX + 12, actualAddbacksY + 7, { lineBreak: false });
    // Addbacks table headers
    const addHeaderY = actualAddbacksY + 24;
    doc.rect(tableX, addHeaderY, tableW, 32).fill(REPORT_NAVY_ALT);
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
        .fillColor("#FFFFFF")
        .text("ADDBACK", tableX + 12, addHeaderY + 12, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#FFFFFF")
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
            doc.fillColor("#FFFFFF").text(line1, line1X, addHeaderY + 6, { lineBreak: false, continued: false });
            // Reset cursor to prevent interference
            doc.x = savedX;
            doc.y = savedY;
            doc.fillColor("#FFFFFF").text(line2, line2X, addHeaderY + 18, { lineBreak: false, continued: false });
            // Reset cursor again
            doc.x = savedX;
            doc.y = savedY;
        }
        else {
            // Single line - manually center
            doc.font(fonts.bold).fontSize(9);
            const lineWidth = doc.widthOfString(line1);
            const lineX = colX + (addYearColW - lineWidth) / 2;
            // Save cursor position
            const savedX = doc.x;
            const savedY = doc.y;
            doc.fillColor("#FFFFFF").text(line1, lineX, addHeaderY + 12, { lineBreak: false, continued: false });
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
            }
            else {
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
        doc.rect(tableX, addRowY, tableW, rowHeight).fill(REPORT_TOTAL);
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
    }
    else {
        // If no addbacks, show a message
        const noAddbackY = addHeaderY + 32;
        doc.rect(tableX, noAddbackY, tableW, rowHeight).fill("#F9FAFB");
        doc
            .font(fonts.regular)
            .fontSize(10)
            .fillColor("#6B7280")
            .text("No addbacks provided", tableX + 12, noAddbackY + 10, { width: tableW - 24, align: "center", lineBreak: false });
    }
    drawPageFooter(doc, fonts, currentPageNumber);
    return currentPageNumber; // Return the last page number used
}
function drawMetricCard(doc, fonts, x, y, title, value) {
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
function drawColoredMetricCard(doc, fonts, x, y, w, label, value, emoji, bgColor, borderColor, textColor) {
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
function drawAssetSummaryPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawPageHeader(doc, data, fonts);
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
    const tableStart = drawReportSectionTitle(doc, fonts, "Valuation summary", "Asset Method", "The asset method values the business as everything it owns minus everything it owes, calculated on a fair market value basis.");
    // Asset & Liability breakdown table with BV and FMV columns
    const tableY = tableStart;
    const tableX = PAGE.marginX;
    const tableW = PAGE.width - PAGE.marginX * 2;
    const labelColW = tableW * 0.4;
    const valueColW = (tableW - labelColW) / 2; // Split remaining space for BV and FMV
    // Keep the comprehensive asset and liability tables on one A4 page, leaving
    // the footer clear of the final valuation panel.
    const rowH = 18;
    const gridColor = "#D1D5DB";
    // Assets header
    doc.rect(tableX, tableY, tableW, 20).fill(REPORT_NAVY);
    doc
        .font(fonts.bold)
        .fontSize(9)
        .fillColor("#FFFFFF")
        .text("ASSETS", tableX + 10, tableY + 6, { lineBreak: false });
    // Column headers
    const headerY = tableY + 20;
    doc.rect(tableX, headerY, tableW, 22).fill(REPORT_NAVY_ALT);
    doc.rect(tableX, headerY, labelColW, 22).stroke(gridColor);
    doc.rect(tableX + labelColW, headerY, valueColW, 22).stroke(gridColor);
    doc.rect(tableX + labelColW + valueColW, headerY, valueColW, 22).stroke(gridColor);
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Asset Category", tableX + 10, headerY + 8, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Book Value", tableX + labelColW + 8, headerY + 8, { width: valueColW - 16, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Fair Market Value", tableX + labelColW + valueColW + 8, headerY + 8, { width: valueColW - 16, align: "center", lineBreak: false });
    // Asset rows
    const assetRows = [
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
        const bg = row.highlight ? REPORT_TOTAL : idx % 2 === 0 ? "#FFFFFF" : REPORT_LIGHT;
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
    doc.rect(tableX, liabHeaderY, tableW, 20).fill(REPORT_NAVY);
    doc
        .font(fonts.bold)
        .fontSize(9)
        .fillColor("#FFFFFF")
        .text("LIABILITIES", tableX + 10, liabHeaderY + 6, { lineBreak: false });
    // Column headers for liabilities
    const liabColHeaderY = liabHeaderY + 20;
    doc.rect(tableX, liabColHeaderY, tableW, 22).fill(REPORT_NAVY_ALT);
    doc.rect(tableX, liabColHeaderY, labelColW, 22).stroke(gridColor);
    doc.rect(tableX + labelColW, liabColHeaderY, valueColW, 22).stroke(gridColor);
    doc.rect(tableX + labelColW + valueColW, liabColHeaderY, valueColW, 22).stroke(gridColor);
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Liability Category", tableX + 10, liabColHeaderY + 8, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Book Value", tableX + labelColW + 8, liabColHeaderY + 8, { width: valueColW - 16, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("Fair Market Value", tableX + labelColW + valueColW + 8, liabColHeaderY + 8, { width: valueColW - 16, align: "center", lineBreak: false });
    // Liability rows
    const liabilityRows = [
        { label: "Liabilities", bv: Number(liabilities.liabilities_bv) || 0, fmv: Number(liabilities.liabilities_fmv) || 0 },
        { label: "Accounts Payable", bv: Number(liabilities.accountsPayable_bv) || 0, fmv: Number(liabilities.accountsPayable_fmv) || 0 },
        { label: "Loans & Debt", bv: Number(liabilities.loansAndDebt_bv) || 0, fmv: Number(liabilities.loansAndDebt_fmv) || 0 },
        { label: "Other Liabilities", bv: Number(liabilities.otherLiabilities_bv) || 0, fmv: Number(liabilities.otherLiabilities_fmv) || 0 },
        { label: "TOTAL LIABILITIES", bv: totalLiabilitiesBV, fmv: totalLiabilitiesFMV, highlight: true },
    ];
    rowY = liabColHeaderY + 22;
    liabilityRows.forEach((row, idx) => {
        const bg = row.highlight ? REPORT_TOTAL : idx % 2 === 0 ? "#FFFFFF" : REPORT_LIGHT;
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
    doc.rect(tableX, navFMVY, tableW, 24).fill(REPORT_LIGHT);
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
        .fillColor(REPORT_GOLD)
        .text(moneyComma(netAssetValueFMV, data.currencySymbol, data.currencyCode), tableX + labelColW + valueColW + 8, navFMVY + 8, { width: valueColW - 16, align: "center", lineBreak: false });
    const panelBottom = drawLegacyValuationPanel(doc, data, fonts, navFMVY + 38, netAssetValueFMV, "Asset Method");
    doc
        .font(fonts.regular)
        .fontSize(7.7)
        .fillColor("#30343B")
        .text("This automated guidance estimate is generated from the asset and liability information supplied, showing both book value and fair market value. It supports planning and advisor discussions, but is not a certified valuation for tax, legal, lending or regulatory purposes.", PAGE.marginX, panelBottom + 10, { width: PAGE.width - PAGE.marginX * 2, lineGap: 1.2, align: "justify" });
    drawPageFooter(doc, fonts, 2);
}
function drawBusinessStrengthAssessmentPage(doc, data, fonts) {
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
function drawQuestionnaireQAPage(doc, data, fonts, pageNumber) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    // Page title
    doc.font(fonts.semibold).fontSize(16).fillColor("#111827").text("Business Strength Assessment", PAGE.marginX, 94, {
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
        }
        else {
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
function drawLegacyQuestionnairePage(doc, data, fonts, pageNumber) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawPageHeader(doc, data, fonts);
    const score = getScoreOutOf50(data);
    const rating = getStrengthRating(score);
    const responses = data.questionnaireResponses || {
        ownerDependence: 3,
        recurringRevenue: 3,
        customerConcentration: 3,
        managementDepth: 3,
        growthRate: 3,
        competitiveAdvantage: 3,
        revenueDiversification: 3,
        systemsScalability: 3,
        marginStability: 3,
        externalRisk: 3,
    };
    drawReportSectionTitle(doc, fonts, "Business strength assessment", "Questionnaire Responses", "Responses to the ten business strength questions, contributing to a total score of " +
        score +
        " / 50 (rating: " +
        rating.label +
        ").");
    const x = PAGE.marginX;
    const y = 176;
    const width = PAGE.width - PAGE.marginX * 2;
    const columns = [28, 150, 92, 48, width - 318];
    const headers = ["#", "Factor", "Assessment", "Score", "Notes"];
    let cursorX = x;
    doc.rect(x, y, width, 24).fill(REPORT_NAVY);
    headers.forEach((header, index) => {
        doc.font(fonts.bold).fontSize(8).fillColor("#FFFFFF").text(header, cursorX + 8, y + 8, {
            width: columns[index] - 16,
            lineBreak: false,
        });
        cursorX += columns[index];
    });
    let rowY = y + 24;
    questionDefinitions.forEach((question, index) => {
        const response = Number(responses[question.key]) || 0;
        const option = question.options.find((item) => item.value === response);
        const label = question.title.replace(/^\d+\.\s*/, "");
        const assessmentColor = response >= 4 ? "#0A9F4B" : response === 3 ? REPORT_GOLD : "#C2413B";
        doc.rect(x, rowY, width, 32).fill(index % 2 === 0 ? "#FFFFFF" : REPORT_LIGHT);
        doc.moveTo(x, rowY + 32).lineTo(x + width, rowY + 32).lineWidth(0.4).strokeColor(REPORT_BORDER).stroke();
        cursorX = x;
        doc.font(fonts.regular).fontSize(8).fillColor(REPORT_MUTED).text(String(index + 1), cursorX + 8, rowY + 11, {
            width: columns[0] - 16,
            lineBreak: false,
        });
        cursorX += columns[0];
        doc.font(fonts.bold).fontSize(8).fillColor("#252A32").text(label, cursorX + 8, rowY + 10, {
            width: columns[1] - 16,
            lineBreak: false,
            ellipsis: true,
        });
        cursorX += columns[1];
        doc.font(fonts.semibold).fontSize(8).fillColor(assessmentColor).text(option?.label || "Not provided", cursorX + 8, rowY + 10, {
            width: columns[2] - 16,
            lineBreak: false,
            ellipsis: true,
        });
        cursorX += columns[2];
        doc.font(fonts.bold).fontSize(8).fillColor(assessmentColor).text(response + " / 5", cursorX + 8, rowY + 10, {
            width: columns[3] - 16,
            lineBreak: false,
        });
        cursorX += columns[3];
        doc.font(fonts.regular).fontSize(7.2).fillColor(REPORT_MUTED).text(option?.description || "-", cursorX + 8, rowY + 7, {
            width: columns[4] - 16,
            height: 22,
            lineGap: 0.5,
            ellipsis: true,
        });
        rowY += 32;
    });
    const panelY = rowY + 24;
    doc.rect(x, panelY, width, 4).fill(REPORT_GOLD);
    doc.rect(x, panelY + 4, width, 58).fill(REPORT_NAVY);
    doc.font(fonts.bold).fontSize(8).fillColor("#D6DEEA").text("BUSINESS STRENGTH ASSESSMENT", x + 20, panelY + 18, {
        lineBreak: false,
    });
    doc.font(fonts.bold).fontSize(23).fillColor("#FFFFFF").text(score + " / 50", x + 20, panelY + 31, {
        lineBreak: false,
    });
    doc.font(fonts.regular).fontSize(8).fillColor("#D6DEEA").text("Rating", x + width - 125, panelY + 18, {
        width: 95,
        align: "right",
        lineBreak: false,
    });
    doc.font(fonts.bold).fontSize(17).fillColor(REPORT_GOLD).text(rating.label, x + width - 165, panelY + 34, {
        width: 135,
        align: "right",
        lineBreak: false,
    });
    const formulaY = panelY + 92;
    doc.font(fonts.bold).fontSize(12).fillColor(REPORT_NAVY).text("Multiple calculation formula", x, formulaY, {
        lineBreak: false,
    });
    doc.font(fonts.regular).fontSize(8.5).fillColor("#30343B").text("The final multiple is calculated as Base Multiple x Score Factor:", x, formulaY + 20, {
        lineBreak: false,
    });
    const formulaTableY = formulaY + 38;
    const formulaColW = width / 4;
    const bands = [
        ["Excellent", "40-50 points", "100% (1.0x)"],
        ["Good", "30-39 points", "80% (0.8x)"],
        ["Average", "20-29 points", "50% (0.5x)"],
        ["Below average", "<20 points", "30% (0.3x)"],
    ];
    const activeBandIndex = score >= 40 ? 0 : score >= 30 ? 1 : score >= 20 ? 2 : 3;
    bands.forEach((band, index) => {
        const colX = x + index * formulaColW;
        doc.rect(colX, formulaTableY, formulaColW, 22).fill(REPORT_NAVY);
        doc.rect(colX, formulaTableY + 22, formulaColW, 34).fill(index % 2 === 0 ? "#FFFFFF" : REPORT_LIGHT);
        doc
            .rect(colX, formulaTableY, formulaColW, 56)
            .lineWidth(index === activeBandIndex ? 1.2 : 0.5)
            .strokeColor(index === activeBandIndex ? REPORT_GOLD : REPORT_BORDER)
            .stroke();
        doc.font(fonts.bold).fontSize(7.8).fillColor("#FFFFFF").text(band[0], colX + 5, formulaTableY + 7, {
            width: formulaColW - 10,
            align: "center",
            lineBreak: false,
        });
        doc.font(fonts.regular).fontSize(7.2).fillColor("#30343B").text(band[1] + "\n" + band[2], colX + 5, formulaTableY + 27, {
            width: formulaColW - 10,
            align: "center",
            lineGap: 1,
        });
    });
    drawPageFooter(doc, fonts, pageNumber);
}
async function generateRAVDAScorecardPDF(data) {
    // Resolve currency symbol from country if not explicitly provided
    const resolvedData = {
        ...data,
        currencySymbol: data.currencySymbol ?? getCurrencySymbolForCountry(data.country),
        currencyCode: data.currencyCode ?? getCurrencyCodeForCountry(data.country),
    };
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({
            margin: PAGE.marginX,
            size: "A4",
            bufferPages: true, // Buffer pages to prevent automatic page creation
            autoFirstPage: false, // We'll manually add pages
        });
        const buffers = [];
        doc.on("data", (chunk) => {
            buffers.push(chunk);
        });
        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on("error", (error) => {
            reject(error);
        });
        const fonts = registerInterFonts(doc);
        drawGuidanceCoverPage(doc, resolvedData, fonts); // Page 1
        if (resolvedData.valuationMethod === "asset" || resolvedData.valuationMethod === "both") {
            drawAssetSummaryPage(doc, resolvedData, fonts); // Page 2 - Asset summary
        }
        if (resolvedData.valuationMethod === "profit" || resolvedData.valuationMethod === "both") {
            drawValuationSummaryPage(doc, resolvedData, fonts); // Page 3 - Profit summary
        }
        const lastFinancialPageNumber = drawFinancialDataPage(doc, resolvedData, fonts); // Page 4+ - Supporting financial inputs
        drawLegacyQuestionnairePage(doc, resolvedData, fonts, lastFinancialPageNumber + 1); // Final page - Business Strength Assessment responses
        doc.end();
    });
}
