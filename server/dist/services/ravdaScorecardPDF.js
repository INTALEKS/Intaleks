"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRAVDAScorecardPDF = generateRAVDAScorecardPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const COLORS = {
    primary: "#3B82F6", // Blue
    secondary: "#60A5FA", // Light Blue
    success: "#10B981", // Green
    warning: "#F59E0B", // Yellow/Orange
    danger: "#EF4444", // Red
    gray: "#6B7280",
    lightGray: "#F3F4F6",
    darkGray: "#374151",
};
const PAGE = {
    margin: 50,
    width: 595,
    contentBottom: 750,
};
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
function getRatingColor(rating) {
    switch (rating.toLowerCase()) {
        case "excellent":
        case "strong":
            return COLORS.success;
        case "good":
            return COLORS.primary;
        case "average":
            return COLORS.warning;
        case "weak":
        case "below average":
            return COLORS.danger;
        default:
            return COLORS.gray;
    }
}
function safeSingleLineText(doc, text, x, y, width, align = "left") {
    doc.text(text, x, y, {
        width,
        align,
        lineBreak: false,
        ellipsis: true,
    });
}
function formatMoneyCompact(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `$${(safeValue / 1000).toFixed(0)}k`;
}
function formatCurrency(value, compact = false) {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (compact) {
        return formatMoneyCompact(safeValue);
    }
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
    }).format(safeValue);
}
function drawHeader(doc, data, yPos) {
    // Add Intaleks logo on the left
    try {
        const logoPath = path_1.default.join(__dirname, "../assets/intaleks.png");
        if (fs_1.default.existsSync(logoPath)) {
            doc.image(logoPath, 50, yPos, { width: 100 });
        }
    }
    catch (error) {
        console.error("Failed to load Intaleks logo:", error);
    }
    // Add company logo on the right (if provided)
    if (data.logoBase64 && data.logoMimeType) {
        try {
            const logoBuffer = Buffer.from(data.logoBase64, "base64");
            doc.image(logoBuffer, 450, yPos, { width: 100, height: 60, fit: [100, 60] });
        }
        catch (error) {
            console.error("Failed to load company logo:", error);
        }
    }
    // Title (centered)
    doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text("Risk & Value Driver Assessment", 50, yPos + 70, { width: 500, align: "center" });
    yPos += 100;
    doc.fontSize(32).font("Helvetica-Bold").fillColor(COLORS.primary).text("RAVDA Scorecard", 50, yPos, { width: 500, align: "center" });
    yPos += 50;
    return yPos;
}
function drawIntroText(doc, yPos) {
    const introText = `This Scorecard uses data analytics to extract vital information highlighting opportunities to improve the performance of your business.

Use the Scorecard to benchmark your business, and start your value improvement journey.`;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.darkGray).text(introText, 50, yPos, { width: 250, align: "left" });
    return yPos + 80;
}
function drawScoreBox(doc, data, xPos, yPos) {
    const boxWidth = 120;
    const boxHeight = 100;
    // YOUR SCORE box
    doc.rect(xPos, yPos, boxWidth, boxHeight).fillAndStroke(COLORS.primary, COLORS.primary);
    doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text("YOUR SCORE", xPos, yPos + 15, { width: boxWidth, align: "center" });
    doc
        .fontSize(36)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text(data.score.toFixed(1), xPos, yPos + 35, { width: boxWidth, align: "center" });
    yPos += boxHeight + 10;
    // YOUR RATING box
    const ratingColor = getRatingColor(data.rating);
    doc.rect(xPos, yPos, boxWidth, boxHeight).fillAndStroke(ratingColor, ratingColor);
    doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text("YOUR RATING", xPos, yPos + 15, { width: boxWidth, align: "center" });
    doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text(data.rating, xPos, yPos + 40, { width: boxWidth, align: "center" });
}
function drawDriverRatings(doc, data, yPos) {
    const boxWidth = 250;
    const boxHeight = 150;
    // Background box
    doc.rect(50, yPos, boxWidth, boxHeight).fillAndStroke(COLORS.lightGray, "#D1D5DB");
    // Header with star icon
    doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
    doc.rect(50, yPos, boxWidth, 30).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
    doc.text("Your Risk & Value Driver Rating ★", 60, yPos + 10, { width: boxWidth - 20 });
    let textY = yPos + 45;
    // STRONG
    if (data.drivers.strong.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.success).text("STRONG", 60, textY);
        textY += 15;
        data.drivers.strong.forEach((driver) => {
            if (textY > yPos + boxHeight - 18) {
                return;
            }
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY, { width: boxWidth - 20, lineBreak: false, ellipsis: true });
            textY += 12;
        });
        textY += 5;
    }
    // AVERAGE
    if (data.drivers.average.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.warning).text("AVERAGE", 60, textY);
        textY += 15;
        data.drivers.average.forEach((driver) => {
            if (textY > yPos + boxHeight - 18) {
                return;
            }
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY, { width: boxWidth - 20, lineBreak: false, ellipsis: true });
            textY += 12;
        });
        textY += 5;
    }
    // WEAK
    if (data.drivers.weak.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.danger).text("WEAK", 60, textY);
        textY += 15;
        data.drivers.weak.forEach((driver) => {
            if (textY > yPos + boxHeight - 18) {
                return;
            }
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY, { width: boxWidth - 20, lineBreak: false, ellipsis: true });
            textY += 12;
        });
    }
    return yPos + boxHeight + 20;
}
function drawValueImprovementChart(doc, data, xPos, yPos) {
    const chartWidth = 250;
    const chartHeight = 200;
    // Background box
    doc.rect(xPos, yPos, chartWidth, chartHeight).fillAndStroke(COLORS.lightGray, "#D1D5DB");
    // Header with chart icon
    doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
    doc.rect(xPos, yPos, chartWidth, 30).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
    doc.text("Value Improvement Opportunity (VIO) ▮▮▮", xPos + 10, yPos + 10, { width: chartWidth - 20 });
    // Chart area
    const chartStartY = yPos + 50;
    const chartBarHeight = 120;
    const barWidth = 60;
    const barSpacing = 20;
    // Calculate max value for scaling
    const maxValue = Math.max(data.currentValue, data.industryStandardValue, data.industryBenchmarkValue);
    // Draw bars
    const bars = [
        { value: data.currentValue, label: "Your\nscore", color: COLORS.primary, score: data.score },
        { value: data.industryStandardValue, label: "Industry\nstandard", color: COLORS.gray, score: data.industryStandard },
        { value: data.industryBenchmarkValue, label: "Industry\nbenchmark", color: "#1E3A8A", score: data.industryBenchmark },
    ];
    bars.forEach((bar, index) => {
        const barX = xPos + 30 + index * (barWidth + barSpacing);
        const barHeight = (bar.value / maxValue) * chartBarHeight;
        const barY = chartStartY + chartBarHeight - barHeight;
        // Draw bar
        doc.rect(barX, barY, barWidth, barHeight).fillAndStroke(bar.color, bar.color);
        // Draw value on bar
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("white")
            .text(bar.score.toFixed(1), barX, barY + barHeight / 2 - 10, { width: barWidth, align: "center" });
        // Draw value label
        const valueLabel = `$${(bar.value / 1000).toFixed(0)}k`;
        doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor(COLORS.darkGray)
            .text(valueLabel, barX, barY - 15, { width: barWidth, align: "center" });
        // Draw label below
        doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor(COLORS.darkGray)
            .text(bar.label, barX, chartStartY + chartBarHeight + 5, { width: barWidth, align: "center" });
    });
    // Draw Y-axis scale
    doc.fontSize(7).font("Helvetica").fillColor(COLORS.gray);
    for (let i = 0; i <= 10; i++) {
        const y = chartStartY + chartBarHeight - (i / 10) * chartBarHeight;
        doc.text(i.toString(), xPos + 10, y - 3);
    }
    // Y-axis label
    doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.darkGray);
    doc.save();
    doc.translate(xPos + 5, chartStartY + chartBarHeight / 2);
    doc.rotate(-90);
    doc.text("RAVDA SCORE RANGES", 0, 0);
    doc.restore();
}
function drawTrackProgress(doc, data, yPos) {
    const boxWidth = 250;
    const boxHeight = 150;
    // Background box
    doc.rect(50, yPos, boxWidth, boxHeight).fillAndStroke(COLORS.lightGray, "#D1D5DB");
    // Header
    doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
    doc.rect(50, yPos, boxWidth, 30).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
    doc.text("Track your Progress  ○-○-○->", 60, yPos + 10, { width: boxWidth - 20 });
    let textY = yPos + 50;
    const progressText = `Each year we would like to complete an annual review of your business using the RAVDA. We will track your score and discuss how we can work together to achieve your life plans.`;
    doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.darkGray)
        .text(progressText, 60, textY, { width: boxWidth - 20, height: 42, align: "left", ellipsis: true });
    textY += 50;
    // Timeline
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("IMPROVEMENT TIMELINE", 60, textY);
    textY += 20;
    // Draw timeline
    const timelineY = textY + 10;
    const timelineWidth = boxWidth - 40;
    const years = [data.currentYear, data.currentYear + 1, data.currentYear + 2, data.currentYear + 3];
    // Timeline line
    doc
        .moveTo(60, timelineY)
        .lineTo(60 + timelineWidth, timelineY)
        .stroke(COLORS.gray);
    // Timeline points
    years.forEach((year, index) => {
        const x = 60 + (index / (years.length - 1)) * timelineWidth;
        if (index === 0) {
            // Current year - filled circle with score
            doc.circle(x, timelineY, 8).fillAndStroke(COLORS.primary, COLORS.primary);
            doc
                .fontSize(10)
                .font("Helvetica-Bold")
                .fillColor(COLORS.primary)
                .text(data.score.toFixed(1), x - 15, timelineY - 25, { width: 30, align: "center" });
            doc
                .fontSize(8)
                .font("Helvetica-Bold")
                .fillColor(COLORS.darkGray)
                .text("NOW", x - 15, timelineY + 15, { width: 30, align: "center" });
        }
        else {
            // Future years - empty circle with question mark
            doc.circle(x, timelineY, 8).stroke(COLORS.gray);
            doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor(COLORS.gray)
                .text("?", x - 15, timelineY - 25, { width: 30, align: "center" });
        }
        doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor(COLORS.gray)
            .text(year.toString(), x - 15, timelineY + 25, { width: 30, align: "center" });
    });
    return yPos + boxHeight + 20;
}
function drawNextSteps(doc, data, xPos, yPos) {
    const boxWidth = 250;
    const boxHeight = 150;
    // Background box
    doc.rect(xPos, yPos, boxWidth, boxHeight).fillAndStroke(COLORS.lightGray, "#D1D5DB");
    // Header
    doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
    doc.rect(xPos, yPos, boxWidth, 30).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
    doc.text("Next Steps  ➜", xPos + 10, yPos + 10, { width: boxWidth - 20 });
    let textY = yPos + 50;
    const introText = `This is the beginning of your journey to understand how to build a benchmark performing business.

Based on your responses and our data analytics, we believe these services will improve your score, profit/cash flow and ultimately grow the value of your business:`;
    doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.darkGray)
        .text(introText, xPos + 10, textY, { width: boxWidth - 20, height: 52, align: "left", ellipsis: true });
    textY += 70;
    // Next steps list
    data.nextSteps.forEach((step, index) => {
        if (textY > yPos + boxHeight - 18) {
            return;
        }
        doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor(COLORS.darkGray)
            .text(`${index + 1}. ${step}`, xPos + 10, textY, { width: boxWidth - 20, lineBreak: false, ellipsis: true });
        textY += 15;
    });
}
function drawFinancialDataPage(doc, data) {
    doc.addPage();
    let yPos = 50;
    const startX = PAGE.margin;
    const metricColWidth = 140;
    const maxYears = 5;
    const years = (data.financialYears || []).slice(0, maxYears);
    const visibleYearCount = Math.max(1, years.length);
    const yearColWidth = (CONTENT_WIDTH - metricColWidth) / visibleYearCount;
    const tableHeaderHeight = 22;
    const metricRowHeight = 18;
    console.log("[PDF] Page 2 start", {
        yPos,
        financialYears: data.financialYears?.length || 0,
        visibleYearCount,
        addbacks: data.addbacks?.length || 0,
    });
    doc.fontSize(20).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Financial Analysis", startX, yPos);
    yPos += 28;
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gray).text("Performance summary from calculator inputs", startX, yPos);
    yPos += 18;
    doc.rect(startX, yPos, CONTENT_WIDTH, 36).fillAndStroke("#F8FAFC", "#E2E8F0");
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.darkGray).text(data.companyName || "N/A", startX + 10, yPos + 9, { width: 220, lineBreak: false, ellipsis: true });
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gray).text(`Industry: ${data.industry || "N/A"}`, startX + 240, yPos + 9, { width: 120, lineBreak: false, ellipsis: true });
    doc.text(`Country: ${data.country || "N/A"}`, startX + 370, yPos + 9, { width: 115, lineBreak: false, ellipsis: true, align: "right" });
    yPos += 50;
    doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Profit & Loss Statement", startX, yPos);
    yPos += 18;
    doc.fontSize(8).font("Helvetica-Bold").fillColor("white");
    doc.rect(startX, yPos, metricColWidth, tableHeaderHeight).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
    doc.text("Metric", startX + 6, yPos + 7, { width: metricColWidth - 12, lineBreak: false, ellipsis: true });
    years.forEach((year, index) => {
        const x = startX + metricColWidth + index * yearColWidth;
        doc.rect(x, yPos, yearColWidth, tableHeaderHeight).fillAndStroke(COLORS.primary, COLORS.primary);
        safeSingleLineText(doc, year, x + 4, yPos + 7, yearColWidth - 8, "right");
    });
    yPos += tableHeaderHeight;
    const metrics = [
        { key: "sales", label: "Sales" },
        { key: "cogs", label: "COGS" },
        { key: "grossProfit", label: "Gross Profit", bold: true, calc: (v) => (v.sales || 0) - (v.cogs || 0) },
        { key: "operatingExpenses", label: "Operating Expenses" },
        { key: "netProfitAndLoss", label: "Net Profit/Loss", bold: true, calc: (v) => (v.grossProfit ?? (v.sales || 0) - (v.cogs || 0)) - (v.operatingExpenses || 0) },
        { key: "interestExpense", label: "Interest Expense" },
        { key: "interestIncome", label: "Interest Income" },
        { key: "ebit", label: "EBIT", bold: true, highlight: true, calc: (v) => (v.netProfitAndLoss ?? ((v.grossProfit ?? (v.sales || 0) - (v.cogs || 0)) - (v.operatingExpenses || 0))) + (v.interestExpense || 0) - (v.interestIncome || 0) },
    ];
    metrics.forEach((metric, rowIndex) => {
        const bgColor = metric.highlight ? "#E8F1FF" : rowIndex % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
        doc.rect(startX, yPos, metricColWidth, metricRowHeight).fillAndStroke(bgColor, "#E5E7EB");
        doc.fontSize(8.5).font(metric.bold ? "Helvetica-Bold" : "Helvetica").fillColor(COLORS.darkGray);
        safeSingleLineText(doc, metric.label, startX + 6, yPos + 5, metricColWidth - 12);
        years.forEach((year, index) => {
            const x = startX + metricColWidth + index * yearColWidth;
            doc.rect(x, yPos, yearColWidth, metricRowHeight).fillAndStroke(bgColor, "#E5E7EB");
            const yearData = data.financialData?.[year] || {};
            const rawValue = yearData[metric.key];
            const value = typeof rawValue === "number" ? rawValue : metric.calc ? metric.calc(yearData) : 0;
            safeSingleLineText(doc, formatCurrency(value), x + 4, yPos + 5, yearColWidth - 8, "right");
        });
        yPos += metricRowHeight;
    });
    yPos += 20;
    const addbacks = (data.addbacks || []).filter((a) => a.reason);
    if (addbacks.length > 0) {
        doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Addbacks", startX, yPos);
        yPos += 18;
        const availableRows = Math.max(2, Math.floor((PAGE.contentBottom - yPos - tableHeaderHeight) / 12));
        const addbackRowHeight = Math.min(18, Math.max(11, Math.floor((PAGE.contentBottom - yPos - tableHeaderHeight) / (addbacks.length + 1))));
        doc.fontSize(8).font("Helvetica-Bold").fillColor("white");
        doc.rect(startX, yPos, metricColWidth, tableHeaderHeight).fillAndStroke(COLORS.darkGray, COLORS.darkGray);
        safeSingleLineText(doc, "Reason", startX + 6, yPos + 7, metricColWidth - 12);
        years.forEach((year, index) => {
            const x = startX + metricColWidth + index * yearColWidth;
            doc.rect(x, yPos, yearColWidth, tableHeaderHeight).fillAndStroke(COLORS.warning, COLORS.warning);
            safeSingleLineText(doc, year, x + 4, yPos + 7, yearColWidth - 8, "right");
        });
        yPos += tableHeaderHeight;
        addbacks.slice(0, availableRows - 1).forEach((addback, rowIndex) => {
            const bgColor = rowIndex % 2 === 0 ? "#FFFBEB" : "#FEF3C7";
            doc.rect(startX, yPos, metricColWidth, addbackRowHeight).fillAndStroke(bgColor, "#F59E0B");
            doc.fontSize(7.5).font("Helvetica").fillColor(COLORS.darkGray);
            safeSingleLineText(doc, addback.reason || "Other", startX + 6, yPos + 3.5, metricColWidth - 12);
            years.forEach((year, index) => {
                const x = startX + metricColWidth + index * yearColWidth;
                doc.rect(x, yPos, yearColWidth, addbackRowHeight).fillAndStroke(bgColor, "#F59E0B");
                const value = addback.values?.[year] || 0;
                safeSingleLineText(doc, formatCurrency(value), x + 4, yPos + 3.5, yearColWidth - 8, "right");
            });
            yPos += addbackRowHeight;
        });
        doc.rect(startX, yPos, metricColWidth, addbackRowHeight).fillAndStroke("#FEF3C7", "#F59E0B");
        doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.darkGray);
        safeSingleLineText(doc, "Total Addbacks", startX + 6, yPos + 4, metricColWidth - 12);
        years.forEach((year, index) => {
            const x = startX + metricColWidth + index * yearColWidth;
            doc.rect(x, yPos, yearColWidth, addbackRowHeight).fillAndStroke("#FEF3C7", "#F59E0B");
            const totalForYear = addbacks.reduce((sum, a) => sum + (a.values?.[year] || 0), 0);
            safeSingleLineText(doc, formatCurrency(totalForYear), x + 4, yPos + 4, yearColWidth - 8, "right");
        });
        yPos += addbackRowHeight;
        if (data.financialYears.length > maxYears) {
            doc.fontSize(7).font("Helvetica-Oblique").fillColor(COLORS.gray).text(`Showing first ${maxYears} years only due to page width constraints.`, startX, yPos + 5, { width: CONTENT_WIDTH });
        }
    }
    console.log("[PDF] Page 2 end", { yPos, safeBottom: PAGE.contentBottom });
}
function drawValuationSummaryPage(doc, data) {
    doc.addPage();
    let yPos = 50;
    doc.fontSize(20).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Valuation Summary", 50, yPos);
    yPos += 30;
    const methodName = data.valuationMethod === "profit" ? "Profit Multiple Method" : data.valuationMethod === "asset" ? "Asset-Based Method" : "DCF Method";
    doc.rect(50, yPos, 500, 28).fillAndStroke("#EEF2FF", "#C7D2FE");
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#1E3A8A").text(`Method: ${methodName}`, 60, yPos + 9, { width: 480, lineBreak: false, ellipsis: true });
    yPos += 42;
    if (data.valuationMethod === "profit") {
        const calcSteps = [
            { label: "Average EBIT", value: data.averageEbit },
            { label: "Total Addbacks", value: data.totalAddbacks },
            { label: "Adjusted EBIT", value: data.adjustedEbit, highlight: true },
            { label: "Valuation Multiple", value: data.calculatedMultiple || 4.0, isMultiple: true },
        ];
        calcSteps.forEach((step, index) => {
            const bgColor = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
            doc.rect(50, yPos, 500, 28).fillAndStroke(bgColor, "#E5E7EB");
            doc.fontSize(10).font(step.highlight ? "Helvetica-Bold" : "Helvetica").fillColor(COLORS.darkGray).text(step.label, 60, yPos + 9);
            const valueText = step.isMultiple ? `${step.value.toFixed(2)}x` : formatCurrency(step.value);
            doc.text(valueText, 280, yPos + 9, { width: 260, align: "right", lineBreak: false, ellipsis: true });
            yPos += 28;
        });
        yPos += 16;
        doc.rect(50, yPos, 500, 76).fillAndStroke("#E8F1FF", "#3B82F6");
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#1D4ED8").text("Estimated Business Value", 60, yPos + 14);
        doc.fontSize(28).font("Helvetica-Bold").fillColor("#1D4ED8").text(formatCurrency(data.finalValuation), 60, yPos + 34, { width: 480, align: "right" });
        yPos += 92;
        doc.fontSize(10).font("Helvetica-Oblique").fillColor(COLORS.gray).text("Formula: Adjusted EBIT × Valuation Multiple", 50, yPos, { width: 500, align: "center" });
    }
    else if (data.valuationMethod === "asset" && data.assets && data.liabilities) {
        doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Assets", 50, yPos);
        yPos += 18;
        const assetItems = [
            { label: "Plant & Equipment", value: data.assets.plantEquipment },
            { label: "Inventory", value: data.assets.inventory },
            { label: "Vehicles", value: data.assets.vehicles },
            { label: "Goodwill", value: data.assets.goodwill },
            { label: "Other Intangibles", value: data.assets.otherIntangible },
        ];
        assetItems.forEach((item, index) => {
            doc.rect(50, yPos, 500, 24).fillAndStroke(index % 2 === 0 ? "#FFFFFF" : "#F8FAFC", "#E5E7EB");
            doc.fontSize(9.5).font("Helvetica").fillColor(COLORS.darkGray).text(item.label, 60, yPos + 8);
            doc.text(formatCurrency(item.value), 280, yPos + 8, { width: 260, align: "right" });
            yPos += 24;
        });
        doc.rect(50, yPos, 500, 28).fillAndStroke("#E8F1FF", "#3B82F6");
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Total Assets", 60, yPos + 9);
        doc.text(formatCurrency(data.totalAssets || 0), 280, yPos + 9, { width: 260, align: "right" });
        yPos += 40;
        doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Liabilities", 50, yPos);
        yPos += 18;
        const liabilityItems = [
            { label: "Loans", value: data.liabilities.loans },
            { label: "Annual Leave", value: data.liabilities.annualLeave },
            { label: "Long Service Leave", value: data.liabilities.longServiceLeave },
            { label: "Other Liabilities", value: data.liabilities.otherLiabilities },
        ];
        liabilityItems.forEach((item, index) => {
            doc.rect(50, yPos, 500, 24).fillAndStroke(index % 2 === 0 ? "#FFFFFF" : "#F8FAFC", "#E5E7EB");
            doc.fontSize(9.5).font("Helvetica").fillColor(COLORS.darkGray).text(item.label, 60, yPos + 8);
            doc.text(formatCurrency(item.value), 280, yPos + 8, { width: 260, align: "right" });
            yPos += 24;
        });
        doc.rect(50, yPos, 500, 28).fillAndStroke("#FEF2F2", "#EF4444");
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Total Liabilities", 60, yPos + 9);
        doc.text(formatCurrency(data.totalLiabilities || 0), 280, yPos + 9, { width: 260, align: "right" });
        yPos += 42;
        doc.rect(50, yPos, 500, 70).fillAndStroke("#E8F1FF", "#3B82F6");
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#1D4ED8").text("Net Asset Value", 60, yPos + 14);
        doc.fontSize(28).font("Helvetica-Bold").fillColor("#1D4ED8").text(formatCurrency(data.finalValuation), 60, yPos + 34, { width: 480, align: "right" });
        yPos += 86;
        doc.fontSize(10).font("Helvetica-Oblique").fillColor(COLORS.gray).text("Formula: Total Assets − Total Liabilities", 50, yPos, { width: 500, align: "center" });
    }
}
function drawFooterDisclaimer(doc, yPos) {
    // Add new page for full disclaimer
    doc.addPage();
    yPos = 50;
    // Title
    doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("BUSINESS VALUATION DISCLAIMER", 50, yPos, { width: 500, align: "center" });
    yPos += 40;
    // Main disclaimer heading
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.danger).text("Disclaimer – Guidance Only (Not Legal, Financial, or Professional Advice)", 50, yPos, { width: 500 });
    yPos += 25;
    // Main disclaimer text
    const mainDisclaimer = `The valuation estimate generated by Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832), trading as Intaleks ("Intaleks") is a general informational guide only. It is based on automated modelling, user-provided inputs, and available data sources.`;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.darkGray).text(mainDisclaimer, 50, yPos, { width: 500, align: "justify", height: 40 });
    yPos += 50;
    // "This valuation is not:" section
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("This valuation is not:", 50, yPos);
    yPos += 20;
    const notItems = ["A certified business valuation", "A legal valuation for court, taxation, or regulatory purposes", "Financial, accounting, investment, or legal advice", "A substitute for professional valuation services"];
    notItems.forEach((item) => {
        doc.fontSize(10).font("Helvetica").fillColor(COLORS.darkGray).text(`• ${item}`, 70, yPos, { width: 480, lineBreak: false, ellipsis: true });
        yPos += 18;
    });
    yPos += 10;
    // Estimates only section
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("The results are estimates only", 50, yPos);
    yPos += 20;
    const estimatesText = `and may not reflect actual market value or current economic conditions. No action or decision should be made based solely on this valuation output.`;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.darkGray).text(estimatesText, 50, yPos, { width: 500, align: "justify", height: 30 });
    yPos += 40;
    // Legal proceedings section
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.danger).text("For legal proceedings, taxation matters, lending requirements, compliance purposes, or formal business transactions,", 50, yPos, { width: 500 });
    yPos += 25;
    const legalText = `you must obtain a qualified, independent, and certified professional valuation.`;
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.danger).text(legalText, 50, yPos, { width: 500 });
    yPos += 40;
    // Liability section
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Limitation of Liability", 50, yPos);
    yPos += 20;
    const liabilityText = `Intaleks accepts no liability for any loss, decision, or action taken in reliance on the valuation estimate.`;
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.darkGray).text(liabilityText, 50, yPos, { width: 500, align: "justify" });
    yPos += 40;
    // Important notice box
    doc.rect(50, yPos, 500, 80).fillAndStroke("#FEF3C7", "#F59E0B");
    doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#92400E")
        .text("⚠️ IMPORTANT LEGAL NOTICE", 60, yPos + 15, { width: 480 });
    doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#92400E")
        .text("The Platform provides automated valuation estimates only and is NOT a certified valuation and CANNOT be used for legal, tax, court, or regulatory purposes.", 60, yPos + 35, { width: 480, align: "justify" });
    yPos += 100;
    // Company information
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.darkGray).text("Perth Business Evaluators Pty Ltd", 50, yPos);
    yPos += 15;
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text("ABN: 51 622 231 832", 50, yPos);
    yPos += 12;
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text("Trading as: Intaleks", 50, yPos);
    yPos += 12;
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text("Email: aleks@executivebusinessevaluers.com.au", 50, yPos);
    yPos += 25;
    // Generated date
    doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor(COLORS.gray)
        .text(`Generated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`, 50, yPos);
    // RAVDA disclaimer on the new disclaimer page
    const ravdaDisclaimer = `The RAVDA is a proprietary tool developed by Intaleks to help business owners understand the key risk and value drivers. A high RAVDA score usually indicates lower risks and potentially a more valuable business. The score is calculated using a combination of your responses and industry data. The score is intended as an introduction to assess key risk and value drivers. There may be omissions or inaccuracies, and the reader needs to make their own enquiries before making any decision. The issuer shall not be held liable for any loss or damage arising from relying on this document.`;
    // Add disclaimer at bottom of the new page
    doc.fontSize(7).font("Helvetica").fillColor(COLORS.gray).text(ravdaDisclaimer, 50, 720, { width: 500, height: 70, align: "left", lineGap: 2, ellipsis: true });
}
async function generateRAVDAScorecardPDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: "A4", bufferPages: true });
        const chunks = [];
        let pageCount = 1;
        doc.on("pageAdded", () => {
            pageCount += 1;
            console.log(`[PDF] pageAdded -> ${pageCount}`);
        });
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
            console.log(`[PDF] generated with ${pageCount} pages`);
            resolve(Buffer.concat(chunks));
        });
        doc.on("error", reject);
        // ===== PAGE 1: RAVDA SCORECARD =====
        console.log("[PDF] Generating Page 1: RAVDA Scorecard");
        let yPos = 50;
        // Header
        yPos = drawHeader(doc, data, yPos);
        // Intro text (left side)
        const introStartY = yPos;
        drawIntroText(doc, introStartY);
        // Score boxes (right side)
        drawScoreBox(doc, data, 350, introStartY);
        yPos = introStartY + 220;
        // Driver Ratings (left) and Value Improvement Chart (right)
        const chartStartY = yPos;
        yPos = drawDriverRatings(doc, data, chartStartY);
        drawValueImprovementChart(doc, data, 320, chartStartY);
        // Track Progress (left) and Next Steps (right)
        const bottomStartY = yPos;
        yPos = drawTrackProgress(doc, data, bottomStartY);
        drawNextSteps(doc, data, 320, bottomStartY);
        // Footer on page 1
        doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.primary).text("Intaleks", 50, 760);
        doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text("Business Valuation & Advisory", 50, 772);
        // ===== PAGE 2: FINANCIAL DATA =====
        if (data.financialYears && data.financialData) {
            console.log("[PDF] Generating Page 2: Financial Data");
            drawFinancialDataPage(doc, data);
        }
        // ===== PAGE 3: VALUATION SUMMARY =====
        console.log("[PDF] Generating Page 3: Valuation Summary");
        drawValuationSummaryPage(doc, data);
        // ===== PAGE 4: DISCLAIMER =====
        console.log("[PDF] Generating Page 4: Disclaimer");
        drawFooterDisclaimer(doc, 720);
        doc.end();
    });
}
