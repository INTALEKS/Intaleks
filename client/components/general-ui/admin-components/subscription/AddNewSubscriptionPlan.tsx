"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import Trash from "@/app/assets/delete-gray.svg";
import BadgeGray from "@/app/assets/badge-gray.svg";

import { useCreateSubscriptionPlan } from "@/app/hooks/useSubscriptions";
import { dollarsToCents, type BillingPeriod } from "@/app/services/subscriptions";

export default function AddNewSubscriptionPlan() {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "", // User enters in dollars (e.g., "9.99")
    billingPeriod: "MONTHLY" as BillingPeriod,
    features: ["", "", ""],
    active: true,
  });

  const createPlan = useCreateSubscriptionPlan();

  const openModal = () => {
    setOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setOpen(false);
      setFormData({ name: "", price: "", billingPeriod: "MONTHLY", features: ["", "", ""], active: true });
    }, 300);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async () => {
    const priceValue = parseFloat(formData.price);
    if (!formData.name || isNaN(priceValue) || priceValue < 0) return;

    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");
    await createPlan.mutateAsync({
      name: formData.name,
      price: dollarsToCents(priceValue), // Convert to cents
      billingPeriod: formData.billingPeriod,
      features: filteredFeatures.length > 0 ? filteredFeatures : ["Basic access"],
      active: formData.active,
    });
    closeModal();
  };

  const isValidPrice = formData.price === "" || (!isNaN(parseFloat(formData.price)) && parseFloat(formData.price) >= 0);

  return (
    <>
      <div className="min-h-[366px] h-full border flex justify-center items-center flex-col border-black rounded-lg p-8 text-center transition-colors cursor-pointer" onClick={openModal}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-(--text-primary-dark) flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="bg-(--hover-bg) px-2 py-1 rounded-sm text-black font-medium">Create New Plan</p>
        </div>
      </div>

      {/* Modal Overlay */}
      {open && (
        <div className={`bg-black/50 fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center transition-all duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}>
          {/* Modal Content */}
          <div className={`flex w-[325px] pt-[32px] p-[16px] flex-col items-start gap-[16px] relative bg-(--hover-bg) rounded-md transition-all duration-300 transform ${isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`} onClick={(e) => e.stopPropagation()}>
            <button className="w-[40px] h-[40px] p-1 rounded-full flex justify-center items-center shadow-md bg-(--hover-bg) absolute -top-5 left-1/2 transform -translate-x-1/2 hover:bg-gray-200 transition-colors duration-200" onClick={closeModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z" />
              </svg>
            </button>

            <div className="flex items-center justify-between w-full">
              <input type="text" className="bg-(--light-bg) border border-(--primary-border) rounded-sm px-2 py-1 text-sm text-(--text-real-color) outline-none" placeholder="PLAN NAME" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
              <Switch checked={formData.active} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))} />
            </div>

            <div className="flex items-center gap-x-2 w-full">
              <span className="text-3xl font-semibold text-(--placeholder-text)">$</span>
              <input type="number" step="0.01" min="0" className={`w-24 text-3xl font-semibold outline-none bg-transparent ${!isValidPrice ? "text-red-500" : "text-(--placeholder-text)"} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} placeholder="0.00" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} />
              <select className="bg-(--light-bg) border border-(--primary-border) rounded-sm px-2 py-1 text-sm outline-none" value={formData.billingPeriod} onChange={(e) => setFormData((prev) => ({ ...prev, billingPeriod: e.target.value as BillingPeriod }))}>
                <option value="MONTHLY">/month</option>
                <option value="YEARLY">/year</option>
                <option value="ONE_TIME">one-time</option>
              </select>
            </div>

            <div className="w-full flex flex-col gap-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-x-1.5 bg-(--light-bg) border border-(--primary-border) rounded-sm p-1 text-sm text-(--text-real-color) w-full">
                  <Image src={BadgeGray} alt="Badge" width={18} height={18} />
                  <input type="text" placeholder="Add a feature" className="bg-transparent outline-none w-full" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} />
                  <button onClick={() => removeFeature(index)}>
                    <Image src={Trash} alt="Trash" width={18} height={18} />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-6 h-6 flex justify-center items-center rounded-full bg-black self-end" onClick={addFeature}>
              <Plus className="text-white w-4 h-4" />
            </button>

            <button className="bg-(--primary-border-typing) px-3 py-1 rounded-sm text-sm text-white font-bold hover:opacity-90 transition-opacity duration-200 flex items-center gap-2 disabled:opacity-50" onClick={handleSubmit} disabled={createPlan.isPending || !formData.name || !isValidPrice || formData.price === ""}>
              {createPlan.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add New Plan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
