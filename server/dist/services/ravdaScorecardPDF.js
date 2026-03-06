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
const FONT_BOLD = "Inter-Bold";
function formatGeneratedDate(input) {
    if (!input) {
        const now = new Date();
        const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
        return `${month} ${now.getDate()}, ${now.getFullYear()}`;
    }
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
        const month = parsed.toLocaleString("en-US", { month: "short" }).toUpperCase();
        return `${month} ${parsed.getDate()}, ${parsed.getFullYear()}`;
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
function registerInterFonts(doc) {
    const candidates = [path_1.default.join(__dirname, "../assets/fonts/InterVariable.ttf"), path_1.default.join(__dirname, "../../assets/fonts/InterVariable.ttf")];
    const interPath = candidates.find((candidate) => fs_1.default.existsSync(candidate));
    if (!interPath) {
        return { regular: "Helvetica", bold: "Helvetica-Bold" };
    }
    doc.registerFont(FONT_REGULAR, interPath);
    doc.registerFont(FONT_BOLD, interPath);
    return { regular: FONT_REGULAR, bold: FONT_BOLD };
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
function drawCenteredIntroPage(doc, data, fonts) {
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    const generatedText = `Report generated ${formatGeneratedDate(data.generatedDate)}`;
    doc.font(fonts.regular).fontSize(9.5).fillColor("#6B7280").text(generatedText, PAGE.marginX, 58, {
        lineBreak: false,
    });
    drawIntaleksLogo(doc);
    const hasCompanyLogo = drawCompanyLogo(doc, data);
    const title = data.companyName || "Company";
    const titleMaxWidth = PAGE.width - PAGE.marginX * 2 - 20;
    const titleSize = fitTitleFontSize(doc, title, fonts.regular, 36, hasCompanyLogo ? 62 : 74, titleMaxWidth);
    const titleY = hasCompanyLogo ? 390 : 298;
    doc
        .font(fonts.regular)
        .fontSize(titleSize)
        .fillColor("#1E78D7")
        .text(title, PAGE.marginX, titleY, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
        ellipsis: true,
    });
    doc
        .font(fonts.regular)
        .fontSize(16)
        .fillColor("#111827")
        .text(sanitizeCountry(data.country), PAGE.marginX, titleY + 92, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
    });
    const baseMultiple = Number.isFinite(data.calculatedMultiple) && typeof data.calculatedMultiple === "number" ? (data.calculatedMultiple % 1 === 0 ? data.calculatedMultiple.toFixed(0) : data.calculatedMultiple.toFixed(1)) : undefined;
    const industryLine = `Industry: ${toDisplayLabel(data.industry) || "N/A"}${baseMultiple ? ` (Base: ${baseMultiple}x)` : ""}`;
    doc
        .font(fonts.regular)
        .fontSize(17)
        .fillColor("#111827")
        .text(industryLine, PAGE.marginX, titleY + 146, {
        width: PAGE.width - PAGE.marginX * 2,
        align: "center",
        lineBreak: false,
    });
    const narrative = "This valuation estimate is generated from your financial performance and selected valuation method. It is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text(narrative, 160, 575, {
        width: 275,
        align: "center",
        lineGap: 2,
    });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("1", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
}
function drawTableOfContentPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    doc.font(fonts.bold).fontSize(16).fillColor("#0F172A").text("Table of Content", PAGE.marginX, 120, {
        lineBreak: false,
    });
    const financialMethod = data.valuationMethod === "asset" ? "Asset method" : "Profit method";
    const entries = [
        { label: "Business strength Assessment", page: "3" },
        { label: `Financial data (${financialMethod})`, page: "4" },
        { label: "Valuation Summary Report(TL;DR)", page: "5" },
        { label: "Business Valuation Disclaimer", page: "6" },
        { label: "Outro", page: "7" },
    ];
    let y = 180;
    entries.forEach((entry) => {
        doc
            .font(fonts.regular)
            .fontSize(13)
            .fillColor("#0F172A")
            .text(entry.label, PAGE.marginX, y, {
            width: PAGE.width - PAGE.marginX * 2 - 70,
            lineBreak: false,
            ellipsis: true,
        });
        doc
            .font(fonts.regular)
            .fontSize(13)
            .fillColor("#0F172A")
            .text(entry.page, PAGE.width - PAGE.marginX - 24, y, {
            width: 24,
            align: "right",
            lineBreak: false,
        });
        y += 30;
    });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("2", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
}
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
function drawLegendRow(doc, fonts, x, y, width) {
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
function drawBusinessStrengthPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    doc.font(fonts.bold).fontSize(13).fillColor("#111827").text("Business strength assessment", PAGE.marginX, 110, {
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
    // Formula box
    const boxX = PAGE.marginX;
    const boxY = 550;
    const boxWidth = PAGE.width - PAGE.marginX * 2;
    const boxHeight = 110;
    doc.rect(boxX, boxY, boxWidth, boxHeight).fill("#F3F4F6");
    // Info icon and title
    doc;
    // Info icon
    doc
        .circle(boxX + 20, boxY + 25, 8)
        .lineWidth(1.8)
        .strokeColor("#1E78D7")
        .stroke();
    doc
        .font(fonts.bold)
        .fontSize(11)
        .fillColor("#1E78D7")
        .text("i", boxX + 17.5, boxY + 20.5, { lineBreak: false });
    // Title on same line as icon
    doc
        .font(fonts.bold)
        .fontSize(11)
        .fillColor("#111827")
        .text("Multiple Calculation Formula", boxX + 34, boxY + 19, { lineBreak: false });
    // Description with inline bold text
    const descY = boxY + 48;
    doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#111827")
        .text("Your final multiple is calculated as: ", boxX + 14, descY, { lineBreak: false, continued: true });
    doc.font(fonts.bold).text("Base Multiple x Score Factor", { lineBreak: false });
    // Legend row
    drawLegendRow(doc, fonts, boxX + 14, descY + 20, boxWidth - 28);
    // Example text
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#9CA3AF")
        .text("Example: If your industry base multiple is 5.0x and you scire 35 points, your multiple = 5.0 x 0.8 = 4.0x", boxX + 14, descY + 45, {
        width: boxWidth - 28,
        lineBreak: true,
    });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("3", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
}
function money(value) {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return `$${Math.round(safe)}`;
}
function moneyComma(value) {
    const safe = Number.isFinite(value) ? Number(value) : 0;
    return `$${Math.round(safe).toLocaleString("en-US")}`;
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
function drawAssetMethodFinancialPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation method", PAGE.marginX, 94, { lineBreak: false });
    doc.rect(PAGE.marginX, 128, PAGE.width - PAGE.marginX * 2, 40).fill("#2F80ED");
    doc
        .font(fonts.bold)
        .fontSize(16)
        .fillColor("#FFFFFF")
        .text("ASSET BASED VALUATION METHOD", PAGE.marginX + 10, 140, { lineBreak: false });
    const assets = data.assets || { plantEquipment: 0, inventory: 0, vehicles: 0, goodwill: 0, otherIntangible: 0 };
    const liabilities = data.liabilities || { loans: 0, annualLeave: 0, longServiceLeave: 0, otherLiabilities: 0 };
    const totalAssets = typeof data.totalAssets === "number" ? data.totalAssets : assets.plantEquipment + assets.inventory + assets.vehicles + assets.goodwill + assets.otherIntangible;
    const totalLiabilities = typeof data.totalLiabilities === "number" ? data.totalLiabilities : liabilities.loans + liabilities.annualLeave + liabilities.longServiceLeave + liabilities.otherLiabilities;
    const netValuation = typeof data.finalValuation === "number" ? data.finalValuation : totalAssets - totalLiabilities;
    doc.font(fonts.bold).fontSize(13).fillColor("#111827").text("ASSETS (FAIR MARKET VALUE)", 70, 194, { lineBreak: false });
    let y = 216;
    drawInputRow(doc, fonts, y, "Plant and Equipments(FMV)", assets.plantEquipment);
    y += 37;
    drawInputRow(doc, fonts, y, "Inventory(FMV)", assets.inventory);
    y += 37;
    drawInputRow(doc, fonts, y, "Vehicles(FMV)", assets.vehicles);
    y += 37;
    drawInputRow(doc, fonts, y, "Goodwill(FMV)", assets.goodwill);
    y += 37;
    drawInputRow(doc, fonts, y, "Other intangible Assets(FMV)", assets.otherIntangible);
    doc.font(fonts.bold).fontSize(12).fillColor("#111827").text("Total Assets", 86, 409, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(12)
        .fillColor("#111827")
        .text(money(totalAssets), PAGE.width - PAGE.marginX - 70, 409, { width: 70, align: "right", lineBreak: false });
    doc.font(fonts.bold).fontSize(13).fillColor("#111827").text("LIABILITIES", 70, 458, { lineBreak: false });
    y = 480;
    drawInputRow(doc, fonts, y, "Loans", liabilities.loans);
    y += 37;
    drawInputRow(doc, fonts, y, "Annual Leave Provision", liabilities.annualLeave);
    y += 37;
    drawInputRow(doc, fonts, y, "Long Service Leave Provision", liabilities.longServiceLeave);
    y += 37;
    drawInputRow(doc, fonts, y, "Other Liabilities", liabilities.otherLiabilities);
    doc.font(fonts.bold).fontSize(12).fillColor("#111827").text("Total Liabilities", 86, 637, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(12)
        .fillColor("#111827")
        .text(money(totalLiabilities), PAGE.width - PAGE.marginX - 70, 637, { width: 70, align: "right", lineBreak: false });
    const summaryX = 74;
    const summaryY = 688;
    const summaryW = PAGE.width - summaryX * 2;
    const summaryH = 72;
    doc.roundedRect(summaryX, summaryY, summaryW, summaryH, 6).fill("#F3F4F6");
    doc
        .font(fonts.bold)
        .fontSize(13)
        .fillColor("#111827")
        .text("Net Business Valuation (Asset Method)", summaryX, summaryY + 11, { width: summaryW, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(24)
        .fillColor("#000000")
        .text(money(netValuation), summaryX, summaryY + 33, { width: summaryW, align: "center", lineBreak: false });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("4", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
}
function formatYearLabel(year) {
    const match = year.match(/(\d{4})/);
    return match ? match[1] : year;
}
function financialValue(data, year, key) {
    return data.financialData?.[year]?.[key] ?? 0;
}
function drawProfitMethodFinancialPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    const years = (data.financialYears || []).slice(0, 3);
    const [y1 = "Year 1", y2 = "Year 2", y3 = "Year 3"] = years;
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation Method", PAGE.marginX, 94, { lineBreak: false });
    const yearRows = [y1, y2, y3];
    let yearY = 129;
    yearRows.forEach((year, idx) => {
        const label = `Year ${idx + 1}:`;
        doc
            .font(fonts.regular)
            .fontSize(11)
            .fillColor("#111827")
            .text(label, 56, yearY + 8, { lineBreak: false });
        doc.roundedRect(108, yearY, 442, 30, 4).fillAndStroke("#F3F4F6", "#E5E7EB");
        doc
            .font(fonts.regular)
            .fontSize(11.5)
            .fillColor("#111827")
            .text(formatYearLabel(year), 116, yearY + 9, { lineBreak: false });
        yearY += 43;
    });
    // Accounting table heading
    const tableX = PAGE.marginX;
    const tableY = 270;
    const tableW = PAGE.width - PAGE.marginX * 2;
    doc.rect(tableX, tableY, tableW, 20).fill("#2F80ED");
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#FFFFFF")
        .text("ACCOUNTING PROFIT AND LOSS", tableX + 6, tableY + 6, { lineBreak: false });
    // Header row
    const metricW = 120;
    const colW = (tableW - metricW) / 3;
    const headerY = tableY + 32;
    doc.rect(tableX, headerY, tableW, 32).fill("#E5E7EB");
    doc
        .font(fonts.bold)
        .fontSize(8.5)
        .fillColor("#374151")
        .text("METRIC", tableX + 4, headerY + 12, { lineBreak: false });
    // Column headers with two lines
    doc
        .font(fonts.bold)
        .fontSize(8.5)
        .fillColor("#374151")
        .text("2 YEAR PREVIOUS", tableX + metricW + 4, headerY + 4, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#6B7280")
        .text(`(${formatYearLabel(y1)})`, tableX + metricW + 4, headerY + 15, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8.5)
        .fillColor("#374151")
        .text("1 YEAR PREVIOUS", tableX + metricW + colW + 4, headerY + 4, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#6B7280")
        .text(`(${formatYearLabel(y2)})`, tableX + metricW + colW + 4, headerY + 15, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8.5)
        .fillColor("#374151")
        .text("LAST FINANCIAL", tableX + metricW + colW * 2 + 4, headerY + 4, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(8.5)
        .fillColor("#374151")
        .text("YEAR", tableX + metricW + colW * 2 + 4, headerY + 13, { width: colW - 8, align: "center", lineBreak: false });
    doc
        .font(fonts.regular)
        .fontSize(8)
        .fillColor("#6B7280")
        .text(`(${formatYearLabel(y3)})`, tableX + metricW + colW * 2 + 4, headerY + 20, { width: colW - 8, align: "center", lineBreak: false });
    const metricRows = [
        { label: "Sales", key: "sales" },
        { label: "Gross profit", key: "grossProfit" },
        { label: "COGS", key: "cogs" },
        { label: "Wages & on Costs", key: "operatingExpenses" },
        { label: "Net profit and Loss", key: "netProfitAndLoss" },
        { label: "Interest Expense", key: "interestExpense" },
        { label: "Interest Income", key: "interestIncome" },
    ];
    let rowY = headerY + 35;
    metricRows.forEach((row) => {
        doc
            .font(fonts.regular)
            .fontSize(10)
            .fillColor("#111827")
            .text(row.label, tableX + 4, rowY + 6, { lineBreak: false });
        [y1, y2, y3].forEach((year, idx) => {
            const x = tableX + metricW + idx * colW;
            doc.roundedRect(x + 1, rowY + 1, colW - 2, 19, 3).fillAndStroke("#F3F4F6", "#E5E7EB");
            doc
                .font(fonts.regular)
                .fontSize(9.5)
                .fillColor("#9CA3AF")
                .text(money(financialValue(data, year, row.key)), x + 5, rowY + 6, {
                width: colW - 10,
                align: "left",
                lineBreak: false,
            });
        });
        rowY += 22;
    });
    // EBIT row
    doc.rect(tableX, rowY + 2, tableW, 21).fill("#BFDBFE");
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#1F2937")
        .text("EBIT CALCULATED", tableX + 4, rowY + 8, { lineBreak: false });
    [y1, y2, y3].forEach((year, idx) => {
        const x = tableX + metricW + idx * colW;
        doc
            .font(fonts.bold)
            .fontSize(10)
            .fillColor("#1F2937")
            .text(money(financialValue(data, year, "ebit")), x + 5, rowY + 8, {
            width: colW - 10,
            align: "left",
            lineBreak: false,
        });
    });
    // Addbacks section
    const addbacksTitleY = rowY + 48;
    doc.rect(tableX, addbacksTitleY, tableW, 20).fill("#2F80ED");
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#FFFFFF")
        .text("ADDBACKS/ADJUSTMENTS", tableX + 6, addbacksTitleY + 6, { lineBreak: false });
    const addHeadY = addbacksTitleY + 32;
    const addCol1 = 150;
    const addCol2 = 210;
    const addCol3 = tableW - addCol1 - addCol2;
    doc.rect(tableX, addHeadY, tableW, 20).fill("#E5E7EB");
    doc
        .font(fonts.bold)
        .fontSize(9)
        .fillColor("#374151")
        .text("ADDBACK", tableX + 4, addHeadY + 6, { lineBreak: false });
    doc.text("ADDBACK REASON", tableX + addCol1 + 4, addHeadY + 6, { lineBreak: false });
    doc.text("ADDBACK VALUE", tableX + addCol1 + addCol2 + 4, addHeadY + 6, { lineBreak: false });
    const addbacks = (data.addbacks || []).slice(0, 6);
    // Filter out empty addbacks - only show those with reason and value
    const validAddbacks = addbacks.filter((item) => {
        if (!item)
            return false;
        const hasReason = item.reason && item.reason.trim() !== "";
        const value = Object.values(item.values || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
        const hasValue = value > 0;
        return hasReason || hasValue;
    });
    let addY = addHeadY + 22;
    validAddbacks.forEach((item, i) => {
        const name = `Addback ${i + 1}`;
        // Format reason: replace hyphens with spaces and capitalize words
        const formattedReason = (item.reason || "")
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        const value = Object.values(item.values || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
        doc
            .font(fonts.regular)
            .fontSize(9.5)
            .fillColor("#111827")
            .text(name, tableX + 4, addY + 6, { lineBreak: false });
        doc.roundedRect(tableX + addCol1 + 1, addY + 1, addCol2 - 2, 19, 3).fillAndStroke("#F3F4F6", "#E5E7EB");
        doc
            .font(fonts.regular)
            .fontSize(8.8)
            .fillColor("#111827")
            .text(formattedReason, tableX + addCol1 + 6, addY + 6, { width: addCol2 - 12, lineBreak: false, ellipsis: true });
        doc.roundedRect(tableX + addCol1 + addCol2 + 1, addY + 1, addCol3 - 2, 19, 3).fillAndStroke("#F3F4F6", "#E5E7EB");
        doc
            .font(fonts.regular)
            .fontSize(9.2)
            .fillColor("#111827")
            .text(money(value), tableX + addCol1 + addCol2 + 6, addY + 6, {
            width: addCol3 - 12,
            lineBreak: false,
        });
        addY += 22;
    });
    doc.rect(tableX, addY + 2, tableW, 21).fill("#BFDBFE");
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#1F2937")
        .text("TOTAL ADDBACKS", tableX + 6, addY + 8, { lineBreak: false });
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor("#1F2937")
        .text(money(data.totalAddbacks || 0), tableX + tableW - 120, addY + 8, { width: 110, align: "right", lineBreak: false });
    const footerY = PAGE.height - PAGE.marginX - 20;
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("4", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
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
function drawProfitSummaryPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    drawIntaleksLogo(doc);
    const years = (data.financialYears || []).slice(0, 3);
    const yearCount = years.length || 1;
    const sumBy = (key) => years.reduce((sum, year) => sum + (data.financialData?.[year]?.[key] || 0), 0);
    const avgSales = sumBy("sales") / yearCount;
    const avgCogs = sumBy("cogs") / yearCount;
    const avgEbit = typeof data.averageEbit === "number" ? data.averageEbit : sumBy("ebit") / yearCount;
    const avgAddbacks = yearCount > 0 ? (data.totalAddbacks || 0) / yearCount : 0;
    const avgAdjustedEbit = typeof data.adjustedEbit === "number" ? data.adjustedEbit : avgEbit + avgAddbacks;
    const valuationMultiple = typeof data.calculatedMultiple === "number" ? data.calculatedMultiple : 0;
    const strengthScore = getScoreOutOf50(data);
    const strengthRating = getStrengthRating(strengthScore);
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation Report Summary", PAGE.marginX, 94, { lineBreak: false });
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Business Valuation Report", 0, 135, { width: PAGE.width, align: "center", lineBreak: false });
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
    // metric cards
    const cardsY1 = 210;
    const gap = 12;
    const x0 = PAGE.marginX + 26;
    drawMetricCard(doc, fonts, x0, cardsY1, "Average Sales", money(avgSales));
    drawMetricCard(doc, fonts, x0 + 150 + gap, cardsY1, "Average COGS", money(avgCogs));
    drawMetricCard(doc, fonts, x0 + (150 + gap) * 2, cardsY1, "Average EBIT", money(avgEbit));
    const cardsY2 = 284;
    drawMetricCard(doc, fonts, x0, cardsY2, "Average Addbacks", money(avgAddbacks));
    drawMetricCard(doc, fonts, x0 + 150 + gap, cardsY2, "Average Adjusted EBIT", money(avgAdjustedEbit));
    drawMetricCard(doc, fonts, x0 + (150 + gap) * 2, cardsY2, "Valuation Multiple", `${valuationMultiple.toFixed(2)}x`);
    // business strength assessment block
    const assessmentY = 356;
    const assessmentW = 150 * 3 + gap * 2;
    const assessmentH = 52;
    doc.roundedRect(x0, assessmentY, assessmentW, assessmentH, 8).fillAndStroke("#FFFFFF", "#DBEAFE");
    doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#6B7280")
        .text("Business Strength Assessment", x0 + 12, assessmentY + 10, { lineBreak: false });
    doc.font(fonts.bold).fontSize(18).fillColor("#2563EB").text(`${strengthScore}/50`, x0 + 12, assessmentY + 26, { lineBreak: false });
    doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#6B7280")
        .text("Rating", x0 + assessmentW - 90, assessmentY + 10, { width: 72, align: "right", lineBreak: false });
    doc.roundedRect(x0 + assessmentW - 78, assessmentY + 24, 66, 20, 10).fill(strengthRating.bg);
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor(strengthRating.text)
        .text(strengthRating.label, x0 + assessmentW - 78, assessmentY + 30, { width: 66, align: "center", lineBreak: false });
    // blue valuation panel
    const panelX = PAGE.marginX + 26;
    const panelY = 424;
    const panelW = PAGE.width - (PAGE.marginX + 26) * 2;
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
        .text(moneyComma(data.finalValuation), panelX + 12, panelY + 34, { lineBreak: false });
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
        .text(`Method: ${data.valuationMethod === "asset" ? "Asset Method" : "Profit Method"}`, panelX + 12, panelY + 88, { lineBreak: false });
    // Trophy image
    const trophyPath = path_1.default.join(__dirname, "../assets/win.png");
    if (fs_1.default.existsSync(trophyPath)) {
        doc.image(trophyPath, panelX + panelW - 52, panelY + 20, { width: 40 });
    }
    const narrative = "This valuation estimate is generated from your financial performance, adjusted EBIT and selected valuation method. It is an automated, model-based estimate designed to support planning, discussions with advisors, and high-level decision-making. It is not a certified valuation and should not be used for tax, legal, lending, or regulatory purposes.";
    doc
        .font(fonts.regular)
        .fontSize(9)
        .fillColor("#111827")
        .text(narrative, PAGE.marginX, 566, {
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
function drawAssetSummaryPage(doc, data, fonts) {
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
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Valuation Report Summary", PAGE.marginX, 94, { lineBreak: false });
    doc.font(fonts.bold).fontSize(16).fillColor("#111827").text("Business Valuation Report", 0, 135, { width: PAGE.width, align: "center", lineBreak: false });
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
    const assessmentW = 150 * 3 + gap * 2;
    const assessmentH = 52;
    doc.roundedRect(x0, assessmentY, assessmentW, assessmentH, 8).fillAndStroke("#FFFFFF", "#DBEAFE");
    doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#6B7280")
        .text("Business Strength Assessment", x0 + 12, assessmentY + 10, { lineBreak: false });
    doc.font(fonts.bold).fontSize(18).fillColor("#2563EB").text(`${strengthScore}/50`, x0 + 12, assessmentY + 26, { lineBreak: false });
    doc
        .font(fonts.regular)
        .fontSize(10)
        .fillColor("#6B7280")
        .text("Rating", x0 + assessmentW - 90, assessmentY + 10, { width: 72, align: "right", lineBreak: false });
    doc.roundedRect(x0 + assessmentW - 78, assessmentY + 24, 66, 20, 10).fill(strengthRating.bg);
    doc
        .font(fonts.bold)
        .fontSize(10)
        .fillColor(strengthRating.text)
        .text(strengthRating.label, x0 + assessmentW - 78, assessmentY + 30, { width: 66, align: "center", lineBreak: false });
    const panelX = PAGE.marginX + 26;
    const panelY = 356;
    const panelW = PAGE.width - (PAGE.marginX + 26) * 2;
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
    const trophyPath = path_1.default.join(__dirname, "../assets/win.png");
    if (fs_1.default.existsSync(trophyPath)) {
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
function drawDisclaimerPage(doc, data, fonts) {
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
    doc.font(fonts.regular).fontSize(10).fillColor("#111827").text("6", 0, footerY, {
        width: PAGE.width,
        align: "center",
        lineBreak: false,
    });
}
function drawOutroPage(doc, data, fonts) {
    doc.addPage();
    doc.rect(0, 0, PAGE.width, PAGE.height).fill("#FFFFFF");
    const logoPngPath = path_1.default.join(__dirname, "../assets/intaleks.png");
    const logoJpgPath = path_1.default.join(__dirname, "../assets/intaleks.jpg");
    const logoPath = fs_1.default.existsSync(logoPngPath) ? logoPngPath : logoJpgPath;
    const centerX = PAGE.width / 2;
    const logoY = 382;
    if (fs_1.default.existsSync(logoPath)) {
        const width = 260;
        doc.image(logoPath, centerX - width / 2, logoY, { width });
    }
    else {
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
async function generateRAVDAScorecardPDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: PAGE.marginX, size: "A4" });
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
        drawCenteredIntroPage(doc, data, fonts);
        drawTableOfContentPage(doc, data, fonts);
        drawBusinessStrengthPage(doc, data, fonts);
        if (data.valuationMethod === "asset") {
            drawAssetMethodFinancialPage(doc, data, fonts);
            drawAssetSummaryPage(doc, data, fonts);
            drawDisclaimerPage(doc, data, fonts);
            drawOutroPage(doc, data, fonts);
        }
        else if (data.valuationMethod === "profit") {
            drawProfitMethodFinancialPage(doc, data, fonts);
            drawProfitSummaryPage(doc, data, fonts);
            drawDisclaimerPage(doc, data, fonts);
            drawOutroPage(doc, data, fonts);
        }
        doc.end();
    });
}
