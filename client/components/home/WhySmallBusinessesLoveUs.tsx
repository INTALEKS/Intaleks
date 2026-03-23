// "use client";

import Image from "next/image";

interface Feature {
  number: string;
  title: string;
  description: string;
  image: string;
}

const features: Feature[] = [
  {
    number: "01",
    title: "Fast and Easy",
    description: "No lengthy paperwork, no complicated spreadsheets. In just a few clicks, get a valuation that's easy to understand and ready to use.",
    image: "/fast-and-easy.png",
  },
  {
    number: "02",
    title: "Accurate and Reliable",
    description: "Intaleks is built on proven valuation methods. Unlike guesswork or inflated claims, our platform gives you trustworthy insights based on real business data.",
    image: "/accurate-and-reliable.png",
  },
  {
    number: "03",
    title: "Affordable and Accessible",
    description: "Professional valuations can be expensive and time-consuming. Intaleks puts this power in your hands at a fraction of the cost, making it accessible for any small business owner.",
    image: "/affordable-and-accessible.png",
  },
];

export function WhySmallBusinessesLoveUs() {
  return (
    <section id="why-love-us" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why small businesses love us</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.number} className="flex flex-col bg-[#F7F7F7] p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-black mb-2 self-start">{feature.number}</div>
                <Image src={feature.image} alt={feature.title} width={70} height={70} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-800 tetx-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
