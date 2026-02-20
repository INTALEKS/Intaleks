import PDFDocument from "pdfkit";

export interface FinancialYearData {
  sales: number;
  grossProfit: number; // Calculated: Sales - COGS
  cogs: number;
  operatingExpenses: number; // Renamed from wagesAndCosts
  netProfitAndLoss: number; // Calculated: Gross Profit - Operating Expenses
  interestExpense: number;
  interestIncome: number;
  ebit: number;
}

export interface Addback {
  id: string;
  reason: string;
  values: Record<string, number>; // year -> value mapping
}

export interface ValuationReportData {
  // Company Information
  companyName: string;
  country: string;
  industry: string;
  startedYear?: string;
  employees?: string;
  stage?: "startup" | "1-2-years" | "3-5-years" | "5-10-years" | "10-plus-years";
  logoBase64?: string;
  logoMimeType?: string;
  generatedDate?: string;

  // Financial Data
  financialYears: string[];
  financialData: Record<string, FinancialYearData>;
  addbacks: Addback[];
  totalAddbacks: number;
  averageEbit: number;
  adjustedEbit: number;

  // Valuation Method & Results
  valuationMethod: "asset" | "profit";
  customMultiple?: string;
  finalValuation: number;

  // Questionnaire Data (for RAVDA Scorecard)
  questionnaireScore?: number; // Total score out of 50
  questionnaireCategory?: string; // Excellent, Good, Average, Below Average
  calculatedMultiple?: number; // Multiple from questionnaire
  questionnaireScores?: {
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

  // Asset Method (only if selected)
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
  assetValuation?: number;

  // Profit Method (only if selected)
  capitalizationRate?: number;
  profitValuation?: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export async function generateValuationPDF(data: ValuationReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let yPosition = 50;

    // Company Logo (if provided)
    if (data.logoBase64 && data.logoMimeType) {
      try {
        const logoBuffer = Buffer.from(data.logoBase64, "base64");
        doc.image(logoBuffer, 50, yPosition, { width: 100, height: 100, fit: [100, 100] });
        yPosition += 110;
      } catch (error) {
        console.error("Failed to add logo:", error);
      }
    }

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text("Business Valuation Report", 50, yPosition, { align: "center" });
    yPosition += 40;

    // Company Information Section
    doc.fontSize(16).font("Helvetica-Bold").text("Company Information", 50, yPosition);
    yPosition += 25;
    doc.fontSize(11).font("Helvetica");
    doc.text(`Company Name: ${data.companyName}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Country: ${data.country.charAt(0).toUpperCase() + data.country.slice(1)}`, 50, yPosition);
    yPosition += 20;
    doc.text(`Industry: ${data.industry.charAt(0).toUpperCase() + data.industry.slice(1)}`, 50, yPosition);
    yPosition += 20;

    // Only show optional fields if they have values
    if (data.startedYear) {
      doc.text(`Founded: ${data.startedYear}`, 50, yPosition);
      yPosition += 20;
    }

    if (data.employees) {
      doc.text(`Employees: ${data.employees}`, 50, yPosition);
      yPosition += 20;
    }

    if (data.stage) {
      const stageLabels = {
        startup: "Startup",
        "1-2-years": "1-2 Years",
        "3-5-years": "3-5 Years",
        "5-10-years": "5-10 Years",
        "10-plus-years": "10+ Years",
      };
      doc.text(`Business Stage: ${stageLabels[data.stage]}`, 50, yPosition);
      yPosition += 20;
    }

    yPosition += 10;

    // Financial Data Section
    doc.fontSize(16).font("Helvetica-Bold").text("Financial Data", 50, yPosition);
    yPosition += 25;

    // Financial table header
    doc.fontSize(10).font("Helvetica-Bold");
    const tableStartY = yPosition;
    const colWidth = 80;
    let xPos = 50;

    doc.text("Metric", xPos, yPosition);
    data.financialYears.forEach((year, index) => {
      xPos += colWidth;
      doc.text(year, xPos, yPosition, { width: colWidth, align: "right" });
    });
    yPosition += 20;

    // Draw table lines
    doc
      .moveTo(50, yPosition - 5)
      .lineTo(50 + colWidth * (data.financialYears.length + 1), yPosition - 5)
      .stroke();

    // Financial data rows
    const metrics = [
      { key: "sales", label: "Sales" },
      { key: "cogs", label: "COGS" },
      { key: "grossProfit", label: "Gross Profit" },
      { key: "operatingExpenses", label: "Operating Expenses" },
      { key: "netProfitAndLoss", label: "Net Profit" },
      { key: "interestExpense", label: "Interest Expense" },
      { key: "interestIncome", label: "Interest Income" },
      { key: "ebit", label: "EBIT" },
    ];

    doc.fontSize(9).font("Helvetica");
    metrics.forEach((metric) => {
      xPos = 50;
      doc.text(metric.label, xPos, yPosition);

      data.financialYears.forEach((year) => {
        xPos += colWidth;
        const value = data.financialData[year]?.[metric.key as keyof FinancialYearData] || 0;
        doc.text(formatCurrency(value), xPos, yPosition, { width: colWidth, align: "right" });
      });
      yPosition += 15;
    });

    yPosition += 20;

    // Addbacks Section - filter valid addbacks
    const validAddbacks = data.addbacks.filter((a) => {
      const hasValidReason = a.reason && a.reason.trim() !== "" && a.reason !== "Enter reason";
      const hasValidValue = Object.values(a.values || {}).some((val) => val > 0);
      return hasValidReason && hasValidValue;
    });

    if (validAddbacks.length > 0) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(16).font("Helvetica-Bold").text("Addbacks/Adjustments", 50, yPosition);
      yPosition += 25;

      const years = data.financialYears || [];

      validAddbacks.forEach((addback, idx) => {
        doc.fontSize(10).font("Helvetica");
        doc.text(`${idx + 1}. ${addback.reason}:`, 70, yPosition);
        yPosition += 15;

        years.forEach((year) => {
          const value = addback.values?.[year] || 0;
          if (value > 0) {
            doc.fontSize(9).font("Helvetica");
            doc.text(`   ${year}: ${formatCurrency(value)}`, 90, yPosition);
            yPosition += 14;
          }
        });

        yPosition += 4;

        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
      });

      yPosition += 10;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`Total Addbacks: ${formatCurrency(data.totalAddbacks)}`, 70, yPosition);
      yPosition += 30;
    }

    // Valuation Summary
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(16).font("Helvetica-Bold").text("Valuation Summary", 50, yPosition);
    yPosition += 25;
    doc.fontSize(11).font("Helvetica");
    doc.text(`Average EBIT: ${formatCurrency(data.averageEbit)}`, 70, yPosition);
    yPosition += 20;
    if (data.totalAddbacks > 0) {
      doc.text(`Total Addbacks: ${formatCurrency(data.totalAddbacks)}`, 70, yPosition);
      yPosition += 20;
    }
    doc.text(`Adjusted EBIT: ${formatCurrency(data.adjustedEbit)}`, 70, yPosition);
    yPosition += 30;

    // Method-specific details
    const methodNames = {
      asset: "Asset-Based Valuation",
      profit: "Profit Multiplier Method",
    };

    doc.fontSize(16).font("Helvetica-Bold").text(methodNames[data.valuationMethod], 50, yPosition);
    yPosition += 25;

    if (data.valuationMethod === "asset" && data.assets && data.liabilities) {
      doc.fontSize(11).font("Helvetica");
      doc.text("Assets:", 70, yPosition);
      yPosition += 20;
      doc.fontSize(10);
      doc.text(`Plant & Equipment: ${formatCurrency(data.assets.plantEquipment)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Inventory: ${formatCurrency(data.assets.inventory)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Vehicles: ${formatCurrency(data.assets.vehicles)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Goodwill: ${formatCurrency(data.assets.goodwill)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Other Intangible: ${formatCurrency(data.assets.otherIntangible)}`, 90, yPosition);
      yPosition += 20;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`Total Assets: ${formatCurrency(data.totalAssets || 0)}`, 90, yPosition);
      yPosition += 30;

      doc.fontSize(11).font("Helvetica");
      doc.text("Liabilities:", 70, yPosition);
      yPosition += 20;
      doc.fontSize(10);
      doc.text(`Loans: ${formatCurrency(data.liabilities.loans)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Annual Leave: ${formatCurrency(data.liabilities.annualLeave)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Long Service Leave: ${formatCurrency(data.liabilities.longServiceLeave)}`, 90, yPosition);
      yPosition += 15;
      doc.text(`Other Liabilities: ${formatCurrency(data.liabilities.otherLiabilities)}`, 90, yPosition);
      yPosition += 20;
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`Total Liabilities: ${formatCurrency(data.totalLiabilities || 0)}`, 90, yPosition);
      yPosition += 30;
    } else if (data.valuationMethod === "profit") {
      doc.fontSize(11).font("Helvetica");
      if (data.capitalizationRate !== undefined) {
        doc.text(`Capitalization Rate: ${data.capitalizationRate}%`, 70, yPosition);
        yPosition += 20;
      }
      if (data.customMultiple) {
        doc.text(`Industry Multiple: ${data.customMultiple}x`, 70, yPosition);
        yPosition += 20;
      }
    }

    // Final Valuation - Highlighted
    yPosition += 20;
    doc.fontSize(18).font("Helvetica-Bold").text("Estimated Business Valuation", 50, yPosition);
    yPosition += 30;
    doc.fontSize(28).fillColor("#2563eb").text(formatCurrency(data.finalValuation), 50, yPosition);
    doc.fillColor("#000000");

    // Footer
    yPosition += 60;
    doc.fontSize(9).font("Helvetica").fillColor("#666666");
    const reportDate = data.generatedDate || new Date().toLocaleDateString("en-AU");
    doc.text(`Report generated on ${reportDate}`, 50, yPosition, { align: "center" });
    doc.text("This valuation is an estimate and should not be considered as financial advice.", 50, yPosition + 15, { align: "center" });

    doc.end();
  });
}
