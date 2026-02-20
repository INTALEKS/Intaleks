"use client";

interface AddbackExample {
  number: string;
  title: string;
  subtitle: string;
  items: string[];
}

const addbackExamples: AddbackExample[] = [
  {
    number: "01",
    title: "Non-Recurring Costs",
    subtitle: "Expenses that won't continue for a future owner",
    items: ["One-off legal or consulting fees", "Abnormal repairs or emergency maintenance", "Rebranding or major once-off marketing campaigns"],
  },
  {
    number: "02",
    title: "Owner-Related or Discretionary Expenses",
    subtitle: "Costs that benefit the owner personally rather than the business:",
    items: ["Personal vehicle or travel expenses", "Owner's salary above (or below) market rate", "Family members on payroll who don't work in the business"],
  },
  {
    number: "03",
    title: "Non-Cash Items",
    subtitle: "Adjustments that don't impact cash flow:",
    items: ["Depreciation", "Amortisation", "Provisions or write-downs not expected to recur"],
  },
  {
    number: "04",
    title: "Be ready for opportunities",
    subtitle: "Unusual events that distort normal performance:",
    items: ["Large bad debts from a single customer", "Inventory write-offs due to isolated incidents", "Insurance excess from a one-off claim"],
  },
  {
    number: "05",
    title: "Ask questions and get clarity",
    subtitle: "Aligning costs with what a future owner would realistically pay:",
    items: ["Adjusting rent to market value", "Aligning wages to market salaries", "Removing owner bonuses not tied to performance"],
  },
];

interface AddbacksExamplesSectionProps {
  className?: string;
}

export function AddbacksExamplesSection({ className }: AddbacksExamplesSectionProps) {
  return (
    <section className={`bg-gray-100 rounded-2xl p-8 md:p-12 relative ${className || ""}`}>
      {/* Learn Badge */}
      <div className="absolute top-6 right-6">
        <span className="bg-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded">LEARN</span>
      </div>

      {/* Header */}
      <div className="text-center mt-8 mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Common Examples of Addbacks</h2>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {addbackExamples.map((example) => (
          <div key={example.number} className="flex flex-col">
            {/* Number */}
            <span className="text-4xl font-bold text-black mb-2">{example.number}</span>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-1">{example.title}</h3>

            {/* Subtitle */}
            <p className="text-gray-600 text-sm mb-3">{example.subtitle}</p>

            {/* Items */}
            <ul className="text-gray-700 text-sm space-y-1">
              {example.items.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
