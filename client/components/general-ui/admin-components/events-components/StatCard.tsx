"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp } from "lucide-react";

// Animated counter hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// Stats Card Component
export default function StatCard({ title, value, icon: Icon, change, changeText }: { title: string; value: number; icon: React.ElementType; change: number; changeText: string }) {
  const animatedValue = useCountUp(value, 1200);

  return (
    <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-between gap-2 h-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black uppercase">{title}</span>
        <Icon className="h-5 w-5 text-black" />
      </div>
      <span className="text-4xl font-bold tabular-nums">{animatedValue.toLocaleString()}</span>
      <div className="flex items-center gap-1 text-xs text-black">
        <TrendingUp className="h-3 w-3 text-green-500" />
        <span>{change}%</span>
        <span>{changeText}</span>
      </div>
    </div>
  );
}
