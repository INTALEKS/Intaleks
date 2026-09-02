"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateValuationPDF = generateValuationPDF;
const ravdaScorecardPDF_1 = require("./ravdaScorecardPDF");
/**
 * Generate comprehensive valuation PDF from calculator data
 */
async function generateValuationPDF(data) {
    // Convert 50-point questionnaire score to 10-point RAVDA score
    const ravdaScore = data.questionnaireScore ? (data.questionnaireScore / 50) * 10 : 5.0;
    // Determine rating based on score
    let rating = "Average";
    if (ravdaScore >= 8.5)
        rating = "Excellent";
    else if (ravdaScore >= 7.0)
        rating = "Strong";
    else if (ravdaScore >= 5.5)
        rating = "Good";
    else if (ravdaScore < 4.0)
        rating = "Weak";
    // Categorize questionnaire scores into Strong/Average/Weak
    const drivers = {
        strong: [],
        average: [],
        weak: [],
    };
    if (data.questionnaireScores) {
        const scores = data.questionnaireScores;
        const categories = [
            { name: "Owner Dependence", score: scores.ownerDependence },
            { name: "Recurring Revenue", score: scores.recurringRevenue },
            { name: "Customer Concentration", score: scores.customerConcentration },
            { name: "Management Depth", score: scores.managementDepth },
            { name: "Growth Rate", score: scores.growthRate },
            { name: "Competitive Advantage", score: scores.competitiveAdvantage },
            { name: "Revenue Diversification", score: scores.revenueDiversification },
            { name: "Systems Scalability", score: scores.systemsScalability },
            { name: "Margin Stability", score: scores.marginStability },
            { name: "External Risk", score: scores.externalRisk },
        ];
        categories.forEach((cat) => {
            if (cat.score >= 4)
                drivers.strong.push(cat.name);
            else if (cat.score >= 3)
                drivers.average.push(cat.name);
            else
                drivers.weak.push(cat.name);
        });
    }
    else {
        // Default categorization if no questionnaire data
        drivers.average = ["Owner Dependence", "Recurring Revenue", "Customer Concentration", "Management Depth", "Growth Rate", "Competitive Advantage", "Revenue Diversification", "Systems Scalability", "Margin Stability", "External Risk"];
    }
    // Calculate industry benchmarks (mock data - should come from database)
    const industryStandard = 6.5;
    const industryBenchmark = 8.5;
    // Calculate value improvement opportunity
    const currentValue = data.finalValuation;
    const industryStandardValue = currentValue * (industryStandard / ravdaScore);
    const industryBenchmarkValue = currentValue * (industryBenchmark / ravdaScore);
    // Generate next steps based on weak areas
    const nextSteps = [];
    if (drivers.weak.length > 0) {
        nextSteps.push(`Improve ${drivers.weak[0]}`);
        if (drivers.weak.length > 1) {
            nextSteps.push(`Address ${drivers.weak[1]}`);
        }
    }
    if (nextSteps.length < 2) {
        nextSteps.push("Financial planning consultation");
        nextSteps.push("Business growth strategy review");
    }
    const ravdaData = {
        companyName: data.companyName,
        score: ravdaScore,
        rating,
        industry: data.industry,
        country: data.country,
        industryStandard,
        industryBenchmark,
        generatedDate: data.generatedDate ||
            new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        logoBase64: data.logoBase64,
        logoMimeType: data.logoMimeType,
        drivers,
        currentValue,
        industryStandardValue,
        industryBenchmarkValue,
        currentYear: new Date().getFullYear(),
        nextSteps,
        // Financial data
        financialYears: data.financialYears,
        financialData: data.financialData,
        addbacks: data.addbacks,
        totalAddbacks: data.totalAddbacks,
        averageEbit: data.averageEbit,
        adjustedEbit: data.adjustedEbit,
        adjustedEbitPerYear: data.adjustedEbitPerYear,
        totalAddbacksPerYear: data.totalAddbacksPerYear,
        ownerSalaryData: data.ownerSalaryData,
        superRate: data.superRate,
        valuationMethod: data.valuationMethod,
        finalValuation: data.finalValuation,
        assetValuation: data.assetValuation,
        profitValuation: data.profitValuation,
        calculatedMultiple: data.calculatedMultiple,
        multipleSource: data.multipleSource,
        // Questionnaire data
        questionnaireScore: data.questionnaireScore,
        questionnaireResponses: data.questionnaireScores,
        // Company info
        startedYear: data.startedYear,
        employees: data.employees,
        stage: data.stage,
        // Asset method data
        assets: data.assets,
        liabilities: data.liabilities,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        // Equity value data (China & Indonesia only)
        totalDebt: data.totalDebt,
        cashEquivalents: data.cashEquivalents,
        equityValue: data.equityValue,
        currencySymbol: data.currencySymbol,
        daysInPeriod: data.daysInPeriod,
        currencyCode: data.currencyCode,
    };
    return (0, ravdaScorecardPDF_1.generateRAVDAScorecardPDF)(ravdaData);
}
