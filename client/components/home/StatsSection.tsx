"use client";

import { useEffect, useState, useRef } from "react";

interface Stat {
  value: string;
  label: string;
  description: string;
  bgColor?: "gray" | "lightBlue" | "cyan";
}

interface StatsSectionProps {
  title: React.ReactNode;
  stats: Stat[];
}

// Hook for counting animation
function useCountUp(end: number, duration: number = 1500, shouldStart: boolean = false) {
  // Start at 70% of final value to avoid showing zeros
  const initialCount = Math.floor(end * 0.7);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!shouldStart) {
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function - easeOutQuart
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldStart]);

  return count;
}

// Parse value string to extract number and suffix
function parseStatValue(value: string): { number: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);
  if (match) {
    return {
      prefix: match[1] || "",
      number: parseInt(match[2], 10),
      suffix: match[3] || "",
    };
  }
  return { prefix: "", number: 0, suffix: value };
}

// Animated stat card component
function AnimatedStatCard({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
  const { prefix, number, suffix } = parseStatValue(stat.value);
  const animatedNumber = useCountUp(number, 1500, isVisible);

  const getBgClass = (bgColor?: string) => {
    switch (bgColor) {
      case "lightBlue":
        return "bg-blue-200/60";
      case "cyan":
        return "bg-cyan-200/60";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className={`rounded-xl p-8 text-center ${getBgClass(stat.bgColor)}`}>
      <p className="text-5xl md:text-6xl font-bold text-gray-900 tabular-nums">
        {prefix}
        {animatedNumber.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-4">{stat.label}</p>
      <p className="text-gray-600 text-sm mt-2">{stat.description}</p>
    </div>
  );
}

export function StatsSection({ title, stats }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Only animate once
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible (earlier animation)
        rootMargin: "0px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <AnimatedStatCard key={idx} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
