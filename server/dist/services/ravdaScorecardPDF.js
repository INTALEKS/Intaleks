"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRAVDAScorecardPDF = generateRAVDAScorecardPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
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
function drawHeader(doc, data, yPos) {
    // Title
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#374151").text("Risk & Value Driver Assessment", 50, yPos);
    yPos += 30;
    doc.fontSize(32).font("Helvetica-Bold").fillColor(COLORS.primary).text("RAVDA Scorecard", 50, yPos);
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
    const boxHeight = 200;
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
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY);
            textY += 12;
        });
        textY += 5;
    }
    // AVERAGE
    if (data.drivers.average.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.warning).text("AVERAGE", 60, textY);
        textY += 15;
        data.drivers.average.forEach((driver) => {
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY);
            textY += 12;
        });
        textY += 5;
    }
    // WEAK
    if (data.drivers.weak.length > 0) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.danger).text("WEAK", 60, textY);
        textY += 15;
        data.drivers.weak.forEach((driver) => {
            doc.fontSize(9).font("Helvetica").fillColor(COLORS.darkGray).text(driver, 60, textY);
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
        .text(progressText, 60, textY, { width: boxWidth - 20, align: "left" });
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
        .text(introText, xPos + 10, textY, { width: boxWidth - 20, align: "left" });
    textY += 70;
    // Next steps list
    data.nextSteps.forEach((step, index) => {
        doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .fillColor(COLORS.darkGray)
            .text(`${index + 1}. ${step}`, xPos + 10, textY, { width: boxWidth - 20 });
        textY += 15;
    });
}
function drawFooterDisclaimer(doc, yPos) {
    const disclaimerText = `The RAVDA is a proprietary tool developed by Intaleks to help business owners understand the key risk and value drivers that an investor is prepared to wait to receive the total return of funds invested in their business. A high RAVDA score usually indicates lower risks and potentially, a more valuable business.

The RAVDA score is calculated using a combination of your responses and industry data. The score is intended to be used as an introduction to assess key risk and value drivers. There may be omissions or inaccuracies, and the reader needs to make their own enquiries and assessment before making any decision or taking any action. The issuer shall not be held liable for any loss or damage arising from relying on this document and by the reader using this document.`;
    doc.fontSize(7).font("Helvetica").fillColor(COLORS.gray).text(disclaimerText, 50, yPos, { width: 500, align: "left", lineGap: 2 });
}
async function generateRAVDAScorecardPDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
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
        // Footer disclaimer
        drawFooterDisclaimer(doc, 720);
        // Footer text
        doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text(`test answers`, 520, 780, { align: "right" });
        doc.end();
    });
}
