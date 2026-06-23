import Image from "next/image";

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

interface HowItWorksProps {
  steps: Step[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works — Five Simple Steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="bg-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[200px]">
              <div className="flex justify-between items-start">
                <span className="text-3xl font-bold text-gray-800">{String(step.number).padStart(2, "0")}</span>
                {step.icon && (
                  <div className="w-14 h-14 shrink-0">
                    <Image src={step.icon} alt={step.title} width={56} height={56} className="object-contain" />
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
