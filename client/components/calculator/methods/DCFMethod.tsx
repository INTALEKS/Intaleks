"use client";

import { SectionHeader } from "../SectionHeader";
import { LabeledInput } from "../LabeledInput";
import { DataTable, TableColumn, TableRowData } from "../DataTable";
import { ValuationResult } from "../ValuationResult";

interface DCFMethodProps {
  discountRate: string;
  growthRate: string;
  cashflows: Record<string, string>;
  onDiscountRateChange: (value: string) => void;
  onGrowthRateChange: (value: string) => void;
  onCashflowChange: (year: string, value: string) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => `${currentYear + i + 1}`);

export function DCFMethod({ discountRate, growthRate, cashflows, onDiscountRateChange, onGrowthRateChange, onCashflowChange }: DCFMethodProps) {
  const rate = parseFloat(discountRate) || 10;
  const growth = parseFloat(growthRate) || 2;

  const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  // Calculate present values
  const calculatePV = (fcf: number, year: number) => {
    const pvFactor = 1 / Math.pow(1 + rate / 100, year);
    return { pvFactor, presentValue: fcf * pvFactor };
  };

  const tableData: TableRowData[] = years.map((year, idx) => {
    const fcf = parseFloat(cashflows[year]) || 0;
    const { pvFactor, presentValue } = calculatePV(fcf, idx + 1);
    return {
      year: `Year ${idx + 1} (${year})`,
      fcf: formatCurrency(fcf),
      pvFactor: pvFactor.toFixed(4),
      presentValue: formatCurrency(presentValue),
    };
  });

  // Terminal value calculation
  const lastYearCashflow = parseFloat(cashflows[years[years.length - 1]]) || 0;
  const terminalValue = rate > growth ? (lastYearCashflow * (1 + growth / 100)) / ((rate - growth) / 100) : 0;
  const terminalPVFactor = 1 / Math.pow(1 + rate / 100, 5);
  const terminalPresentValue = terminalValue * terminalPVFactor;

  tableData.push({
    year: "Terminal Value(TV)",
    fcf: formatCurrency(terminalValue),
    pvFactor: terminalPVFactor.toFixed(4),
    presentValue: formatCurrency(terminalPresentValue),
  });

  const totalPresentValue = tableData.reduce((sum, row, idx) => {
    if (idx < years.length) {
      const fcf = parseFloat(cashflows[years[idx]]) || 0;
      const { presentValue } = calculatePV(fcf, idx + 1);
      return sum + presentValue;
    }
    return sum + terminalPresentValue;
  }, 0);

  const columns: TableColumn[] = [
    { key: "year", header: "Year" },
    { key: "fcf", header: "FCF(AUD)", align: "right" },
    { key: "pvFactor", header: "PV Factor", align: "right" },
    { key: "presentValue", header: "Present Value(AUD)", align: "right" },
  ];

  return (
    <div>
      <SectionHeader title="DISCOUNTED CASHFLOW VALUATION" />
      <div className="border border-t-0 rounded-b-md p-6">
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">INPUT PARAMETERS</h4>
          <LabeledInput label="Discount Rate(%)" value={discountRate} onChange={onDiscountRateChange} suffix="%" placeholder="e.g., 12" />
          <LabeledInput label="Long-Term Growth Rate(%)" value={growthRate} onChange={onGrowthRateChange} suffix="%" placeholder="e.g., 3" />
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">PROJECTED FREE CASHFLOW</h4>
          {years.map((year, idx) => (
            <LabeledInput key={year} label={`Year ${idx + 1} (${year})`} value={cashflows[year] || ""} onChange={(value) => onCashflowChange(year, value)} placeholder={`e.g., ${50000 + idx * 5000}`} />
          ))}
        </div>

        <DataTable columns={columns} data={tableData} highlightLastRow />
      </div>
      <ValuationResult title="Net Business Valuation (DCF Method)" value={formatCurrency(totalPresentValue)} />
    </div>
  );
}
