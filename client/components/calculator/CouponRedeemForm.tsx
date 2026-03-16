"use client";

import { useState } from "react";
import { Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRedeemCoupon } from "@/app/hooks/useCoupons";

export function CouponRedeemForm() {
  const [code, setCode] = useState("");
  const redeem = useRedeemCoupon();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    redeem.mutate(trimmed, {
      onSuccess: () => setCode(""),
    });
  };

  return (
    <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1.5">
        <Ticket className="w-4 h-4 text-gray-400" />
        Have a coupon code? Redeem it for full calculator access.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="font-mono uppercase tracking-widest" maxLength={32} disabled={redeem.isPending} />
        <Button type="submit" variant="outline" disabled={!code.trim() || redeem.isPending}>
          {redeem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
        </Button>
      </form>
    </div>
  );
}
