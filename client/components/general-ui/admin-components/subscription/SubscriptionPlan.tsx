"use client";

import { useState } from "react";
import Image from "next/image";

import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import BadgeIcon from "@/app/assets/badge.svg";
import EditIcon from "@/app/assets/edit.svg";
import DeleteIcon from "@/app/assets/delete.svg";

import { useActivateSubscriptionPlan, useDeactivateSubscriptionPlan, useDeleteSubscriptionPlan, useUpdateSubscriptionPlan } from "@/app/hooks/useSubscriptions";
import { formatPrice, centsToDollars, dollarsToCents, type SubscriptionPlan as SubscriptionPlanType, type BillingPeriod } from "@/app/services/subscriptions";

interface PlanProps {
  plan: SubscriptionPlanType;
}

export default function SubscriptionPlan({ plan }: PlanProps) {
  const [hoverPlan, setHoverPlan] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: plan.name,
    price: centsToDollars(plan.price).toString(), // Convert cents to dollars for editing
    billingPeriod: plan.billingPeriod,
    features: plan.features,
  });

  const activatePlan = useActivateSubscriptionPlan();
  const deactivatePlan = useDeactivateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await activatePlan.mutateAsync(plan.id);
    } else {
      await deactivatePlan.mutateAsync(plan.id);
    }
  };

  const handleDelete = async () => {
    await deletePlan.mutateAsync(plan.id);
    setIsDeleteOpen(false);
  };

  const handleUpdate = async () => {
    const priceValue = parseFloat(editData.price);
    if (isNaN(priceValue) || priceValue < 0) return;

    await updatePlan.mutateAsync({
      id: plan.id,
      input: {
        name: editData.name,
        price: dollarsToCents(priceValue),
        billingPeriod: editData.billingPeriod,
        features: editData.features,
      },
    });
    setIsEditOpen(false);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...editData.features];
    newFeatures[index] = value;
    setEditData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setEditData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    setEditData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const isToggling = activatePlan.isPending || deactivatePlan.isPending;
  const isValidPrice = !isNaN(parseFloat(editData.price)) && parseFloat(editData.price) >= 0;

  return (
    <>
      <div className="relative h-full" onMouseEnter={() => setHoverPlan(true)} onMouseLeave={() => setHoverPlan(false)}>
        <div className={`bg-(--slate-dark) absolute right-3 flex items-center rounded-tl-sm rounded-tr-sm duration-300 ease-in-out transition-all transform ${hoverPlan ? "-top-8 opacity-100 scale-100" : "-top-4 opacity-0 scale-95 pointer-events-none"}`}>
          <button className="flex items-center justify-center w-10 h-8 rounded-l-sm" onClick={() => setIsEditOpen(true)}>
            <Image src={EditIcon} alt="Edit" width={18} height={18} />
          </button>

          <button className="flex items-center justify-center w-10 h-8 rounded-r-sm" onClick={() => setIsDeleteOpen(true)}>
            <Image src={DeleteIcon} alt="Delete" width={18} height={18} />
          </button>
        </div>

        <div className="bg-(--hover-bg) p-4 rounded-lg relative z-3 transition-all duration-300 ease-in-out transform h-full">
          <div className="flex justify-between items-center">
            <h3 className="text-[12px] font-semibold mb-2 bg-(--yellow-bg) px-2 py-1 rounded-sm text-(--slate-dark)">{plan.name}</h3>
            <Switch checked={plan.active} onCheckedChange={handleToggle} disabled={isToggling} className={`${plan.active ? "data-[state=checked]:bg-(--primary-border-typing)" : "data-[state=unchecked]:bg-(--text-primary-dark)"}`} />
          </div>

          <div className="text-5xl font-bold text-black py-8">{plan.price === 0 ? "Free" : formatPrice(plan.price, plan.billingPeriod)}</div>

          <ul className="text-sm text-gray-600 space-y-4">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-x-1.5">
                <Image src={BadgeIcon} alt="Badge Icon" width={17} height={17} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>Update the subscription plan details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={editData.name} onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" min="0" placeholder="9.99" value={editData.price} onChange={(e) => setEditData((prev) => ({ ...prev, price: e.target.value }))} className={!isValidPrice ? "border-red-500" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingPeriod">Billing Period</Label>
              <select id="billingPeriod" className="w-full border rounded-md px-3 py-2 text-sm" value={editData.billingPeriod} onChange={(e) => setEditData((prev) => ({ ...prev, billingPeriod: e.target.value as BillingPeriod }))}>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONE_TIME">One-time</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              {editData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} placeholder="Feature description" />
                  <Button variant="outline" size="icon" onClick={() => removeFeature(index)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeature}>
                Add Feature
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updatePlan.isPending || !isValidPrice}>
              {updatePlan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>Are you sure you want to delete the &quot;{plan.name}&quot; plan? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePlan.isPending}>
              {deletePlan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
