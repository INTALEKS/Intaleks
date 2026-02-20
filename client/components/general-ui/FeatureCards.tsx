"use client";

import Image from "next/image";

interface Feature {
  /** Lucide icon component or image path */
  image: string;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
}

interface FeatureCardsProps {
  features: Feature[];
}

export function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="">
            <div className="w-20 h-20 mb-4">
              <Image src={feature.image} alt={feature.title} width={80} height={80} className="object-contain" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
