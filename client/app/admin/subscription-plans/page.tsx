"use client";

import { Loader2 } from "lucide-react";
import SubscriptionPlan from "@/components/general-ui/admin-components/subscription/SubscriptionPlan";
import AddNewSubscriptionPlan from "@/components/general-ui/admin-components/subscription/AddNewSubscriptionPlan";
import { useSubscriptionPlans } from "@/app/hooks/useSubscriptions";

export default function SubscriptionPlansPage() {
  const { data: plans, isLoading, error } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">Failed to load subscription plans</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription plans and pricing</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <SubscriptionPlan plan={plan} key={plan.id} />
        ))}
        <AddNewSubscriptionPlan />
      </div>
    </div>
  );
}
