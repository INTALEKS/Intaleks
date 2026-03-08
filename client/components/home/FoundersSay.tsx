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
    image: "/testimonials/karen-whitfield.jpg",
    quote: "I'd been running my physiotherapy clinic in for eleven years and finally decided I wanted to sell and semi-retire. I had no idea what it was worth — I'd never thought about it seriously. A formal valuation from an accountant was going to cost me a few thousand dollars before I even knew if it was worth pursuing a sale. I used Intaleks first just to get a realistic ballpark. The report was structured, made sense, and gave me enough confidence to know I was in the right range before I engaged a valuation specialist to take it further. It didn't replace the professional process — but it meant I walked in informed, not guessing.",
    name: "Karen Whitfield",
    title: "Owner & Principal Physiotherapist, Whitfield Physio & Rehabilitation",
    rating: 5,
  },
  {
    id: 2,
    image: "/testimonials/ryan-callahan.jpg",
    quote: "We were six weeks out from our first investor meeting and our lead developer asked what we thought the company was worth. Honestly, neither of us had a number we could defend. We'd bootstrapped for two years and revenue was growing but we'd never formalised anything. I ran the Intaleks calculator on a Sunday afternoon — took me about forty minutes. The output gave us a structured starting point that we could actually talk around with investors. It's not a certified valuation and we were clear about that, but it opened the conversation properly. One investor actually said our self-awareness about the numbers stood out. We closed the round.",
    name: "Ryan Callahan",
    title: "Co-Founder & CEO, Stackform Technologies",
    rating: 5,
  },
  {
    id: 3,
    image: "/testimonials/dale-strickland.jpg",
    quote: "My business partner and I decided to go separate ways after eight years building the company together. We both had different ideas about what the business was worth and things got tense fast. Before either of us spent money on lawyers, I ran an Intaleks report just to get something on paper we could both look at. The report gave us a neutral starting figure that we could use as a basis for a real conversation. We ended up settling without litigation. I genuinely think having that number early stopped the whole thing from blowing up.",
    name: "Dale Strickland",
    title: "Owner & Director, Strickland Civil & Earthworks",
    rating: 5,
  },
  {
    id: 4,
    image: "/testimonials/olivia-marsh.jpg",
    quote: "I built my homeware store from scratch over five years — started with a Shopify store and eventually brought on two staff and a small warehouse. When I started getting interest from a larger retailer about an acquisition, I had absolutely nothing ready. I didn't want to walk into that conversation with a number I'd made up. Intaleks helped me understand which valuation method actually applied to my type of business and gave me a report I could use as a reference point. I was clear with the buyer that it was an indicative figure — they appreciated the honesty. The sale eventually went through and the final number wasn't far off what Intaleks suggested.",
    name: "Olivia Marsh",
    title: "Founder, Haven Home Co.",
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
