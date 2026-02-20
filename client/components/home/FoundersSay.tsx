"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: number;
  image: string;
  quote: string;
  name: string;
  title: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    image: "https://plus.unsplash.com/premium_photo-1671000049833-9c15fbddf393?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm91bmRlcnN8ZW58MHx8MHx8fDA%3D",
    quote: "TheBizEvaluer helped us clearly understand our company's true value ahead of investor discussions. Their valuation was detailed, easy to follow, and aligned with how investors actually think. It gave us confidence going into fundraising and helped us justify our numbers with clarity.",
    name: "John Nelson",
    title: "Founder Akira",
    rating: 4,
  },
  {
    id: 2,
    image: "https://plus.unsplash.com/premium_photo-1741378216126-26f1040f4f55?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZvdW5kZXJzfGVufDB8fDB8fHww",
    quote: "The valuation report was incredibly thorough and professional. It helped us secure our Series A funding with confidence. The team was responsive and made the entire process seamless.",
    name: "Sarah Chen",
    title: "CEO TechFlow",
    rating: 5,
  },
  {
    id: 3,
    image: "https://plus.unsplash.com/premium_photo-1741291649401-f8a9e88528ba?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Zm91bmRlcnN8ZW58MHx8MHx8fDA%3D",
    quote: "We used TheBizEvaluer before our acquisition talks. The detailed analysis gave us leverage in negotiations and helped us achieve a fair valuation. Highly recommended for any founder.",
    name: "Michael Roberts",
    title: "Founder Nexus Labs",
    rating: 5,
  },
];

export function FoundersSay() {
  const [currentIndex, setCurrentIndex] = useState(1);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const getVisibleIndices = () => {
    const prev = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    const next = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    return [prev, currentIndex, next];
  };

  const visibleIndices = getVisibleIndices();
  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="founders-say" className="py-12 md:py-16 px-4">
      <div className="w-full md:w-[90%] p-6 md:p-8 rounded-md mx-auto bg-gray-100">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 md:mb-4">What our clients say about Intaleks</h2>
        <p className="text-gray-600 text-center mb-8 md:mb-12 max-w-2xl mx-auto text-sm md:text-base">Real feedback from clients who value clarity, accuracy, and confidence in their business decisions.</p>

        {/* Image Carousel */}
        <div className="relative flex items-center justify-center mb-6 md:mb-8">
          {/* Mobile: Single image */}
          <div className="md:hidden flex justify-center">
            <div className="relative overflow-hidden rounded-lg shadow-lg w-64 h-80 sm:w-72 sm:h-96">
              <Image src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} fill className="object-cover" />
            </div>
          </div>

          {/* Tablet and Desktop: Carousel with 3 images */}
          <div className="hidden md:flex items-center justify-center h-96 gap-4 w-full">
            {/* Left Arrow */}
            <button onClick={handlePrev} className="absolute bottom-0 left-[30%] z-10 p-2 rounded-sm bg-white shadow-md hover:bg-gray-50 transition-colors" aria-label="Previous testimonial">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Images */}
            <div className="flex items-center justify-center gap-4 w-[90vw]">
              {visibleIndices.map((idx, position) => {
                const testimonial = testimonials[idx];
                const isCenter = position === 1;
                return (
                  <div key={testimonial.id} className={`relative overflow-hidden rounded-lg transition-all duration-300 ${isCenter ? "w-88 h-96 z-10 shadow-lg" : "w-64 h-72 opacity-70 grayscale"}`}>
                    <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                  </div>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button onClick={handleNext} className="absolute bottom-0 right-[30%] z-10 p-2 rounded-sm bg-white shadow-md hover:bg-gray-50 transition-colors" aria-label="Next testimonial">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-32 md:w-48 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / testimonials.length) * 100}%` }} />
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="text-center">
          <p className="text-gray-700 mb-3 md:mb-4 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">&ldquo;{currentTestimonial.quote}&rdquo;</p>
          <p className="font-semibold text-gray-900 text-base md:text-lg">{currentTestimonial.name}</p>
          <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">{currentTestimonial.title}</p>

          {/* Star Rating */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${star <= currentTestimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`} />
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="md:hidden flex justify-center gap-2 mt-6">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-blue-500 w-6" : "bg-gray-300"}`} aria-label={`Go to testimonial ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
