"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <section className="py-6 px-4">
      <div className="w-full md:w-[90%] py-6 px-0 md:p-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-4">Get Valuation Insights</h2>
            <p className="text-gray-600 text-[18px] mb-8 max-w-md">Receive clear, investor-ready insights that help founders make smarter decisions around fundraising, growth, and company value.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                Enter your email
              </label>
              <div className="flex gap-3">
                <Input id="email" type="email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-xs bg-white border-gray-300" required />
                <Button type="submit" className="bg-black hover:bg-gray-800 px-6">
                  Subscribe now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Envelope Image */}
          <div className="relative flex justify-center md:justify-end bg-(--hover-bg) w-full h-full rounded-md">
            <Image src="/newsletter.png" alt="Newsletter" className="object-cover" fill />
          </div>
        </div>
      </div>
    </section>
  );
}
