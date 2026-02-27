"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Navbar, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/app/hooks/useAuthState";
import { useActiveSubscriptionPlans } from "@/app/hooks/useSubscriptions";
import { Loader2, Check, Mail, Camera } from "lucide-react";
import { toast } from "sonner";
import { ApiClient } from "@/app/services/api";

type TabType = "details" | "subscriptions" | "contact";

interface UserData {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  avatar?: string | null;
  subscriptionStatus?: string;
  subscription?: {
    id: string;
    name: string;
    price: number;
    billingPeriod: string;
    features: string[];
  } | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "details";

  const { user, isAuthentiating, isAuthenticated, refetch } = useAuthState();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Redirect if not authenticated
  if (!isAuthentiating && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (isAuthentiating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "details" as TabType, label: "My Details" },
    { key: "subscriptions" as TabType, label: "Subscriptions" },
    { key: "contact" as TabType, label: "Contact Admin" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown as horizontal tabs */}
          <div className="lg:w-48 lg:shrink-0">
            {/* Mobile tabs */}
            <nav className="flex lg:hidden overflow-x-auto gap-2 pb-2 mb-4 border-b">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors", activeTab === tab.key ? "bg-blue-500 text-white font-semibold" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Desktop sidebar */}
            <nav className="hidden lg:block space-y-1">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("block w-full text-left px-3 py-2 text-sm rounded-md transition-colors", activeTab === tab.key ? "font-semibold text-black" : "text-gray-600 hover:text-black")}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">Settings</h1>

            {activeTab === "details" && <MyDetailsTab user={user} onProfileUpdate={refetch} />}
            {activeTab === "subscriptions" && <SubscriptionsTab user={user} />}
            {activeTab === "contact" && <ContactAdminTab user={user} />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// My Details Tab Component
function MyDetailsTab({ user, onProfileUpdate }: { user: UserData | null; onProfileUpdate: () => void }) {
  const [name, setName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Upload avatar
      const uploadData = await ApiClient.uploadAvatar(file);
      const avatarUrl = uploadData.data.url;

      // Update profile with new avatar
      await ApiClient.updateProfile(name.trim() || user?.name || "", avatarUrl);

      toast.success("Avatar updated successfully");
      onProfileUpdate();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar";
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (name.trim().length > 100) {
      toast.error("Name must be less than 100 characters");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await ApiClient.updateProfile(name.trim(), user?.avatar || undefined);
      toast.success("Profile updated successfully");
      onProfileUpdate();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword.length > 100) {
      toast.error("New password must be less than 100 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await ApiClient.updatePassword(oldPassword, newPassword);
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Personal Details */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Personal Details</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gray-200 overflow-hidden group cursor-pointer" onClick={handleAvatarClick}>
            {user?.avatar ? <Image src={user.avatar} alt="Profile" width={80} height={80} className="w-full h-full object-cover" /> : <Image src="/user-placeholder.jpg" alt="Profile" width={80} height={80} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">{isUploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-white" />}</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={isUploadingAvatar}>
            {isUploadingAvatar ? "Uploading..." : "Change"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="mt-1 bg-gray-100 border-0" />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="mt-1 bg-gray-100 border-0 text-gray-500" />
          </div>
        </div>

        {/* Mobile Update Profile Button */}
        <div className="lg:hidden mt-6">
          <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="bg-blue-500 hover:bg-blue-600 w-full">
            {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Profile
          </Button>
        </div>
      </div>

      {/* Change Password */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Change Password</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">Old Password</Label>
            <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter your current password" className="mt-1 bg-gray-100 border-0" />
          </div>

          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1 bg-gray-100 border-0" />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter new password again" className="mt-1 bg-gray-100 border-0" />
          </div>

          <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="bg-blue-500 hover:bg-blue-600 w-full">
            {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      </div>

      {/* Desktop Update Profile Button */}
      <div className="hidden lg:flex lg:col-span-2 justify-end">
        <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="bg-blue-500 hover:bg-blue-600">
          {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Update Profile
        </Button>
      </div>
    </div>
  );
}

// Subscriptions Tab Component
function SubscriptionsTab({ user }: { user: UserData | null }) {
  const { data: plans, isLoading } = useActiveSubscriptionPlans();
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const currentPlan = user?.subscription;
  const hasActiveSubscription = user?.subscriptionStatus === "ACTIVE";
  const otherPlans = (plans as SubscriptionPlan[] | undefined)?.filter((p) => p.id !== currentPlan?.id) || [];

  const formatPrice = (price: number) => {
    if (price === 0) return "FREE";
    return `${(price / 100).toFixed(2)}`;
  };

  const getBillingLabel = (period: string) => {
    switch (period) {
      case "MONTHLY":
        return "MONTHLY";
      case "YEARLY":
        return "YEARLY";
      case "ONE_TIME":
        return "ONE-OFF";
      default:
        return period;
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsCheckingOut(planId);
    try {
      const data = await ApiClient.createCheckoutSession(planId, `${window.location.origin}/settings?tab=subscriptions&success=true`, `${window.location.origin}/settings?tab=subscriptions&canceled=true`);

      // Redirect to Stripe checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
      toast.error(errorMessage);
      setIsCheckingOut(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!hasActiveSubscription) return;

    try {
      await ApiClient.cancelSubscription();
      toast.success("Subscription will be canceled at the end of the billing period");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Current Plan
      <h2 className="text-xl font-semibold mb-4">Current plan</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded">{currentPlan?.name?.toUpperCase() || "VISITOR"}</span>
          {hasActiveSubscription && <span className="text-xs text-green-600 font-medium">Active</span>}
        </div>
        <div className="text-4xl font-bold mb-4">${formatPrice(currentPlan?.price || 0)}</div>
        <ul className="space-y-2 mb-6">
          {(currentPlan?.features || ["Basic charts visualization", "Preview company visualization"]).map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {hasActiveSubscription ? (
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelSubscription}>
            Cancel Subscription
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => otherPlans[0] && handleSubscribe(otherPlans[0].id)}>
            Upgrade
          </Button>
        )}
      </div> */}

      {/* Other Plans */}
      {otherPlans.length > 0 && (
        <>
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Other Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {otherPlans.map((plan) => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
                <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded mb-4">{getBillingLabel(plan.billingPeriod)}</span>
                <h3 className="font-semibold mb-2">{plan.name}</h3>
                <div className="text-3xl lg:text-4xl font-bold mb-4">${formatPrice(plan.price)}</div>
                <ul className="space-y-2 mb-6">
                  {(plan.features || []).map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-black hover:bg-gray-800" onClick={() => handleSubscribe(plan.id)} disabled={isCheckingOut === plan.id}>
                  {isCheckingOut === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Contact Admin Tab Component
function ContactAdminTab({ user }: { user: UserData | null }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      await ApiClient.submitContact(name.trim(), email.trim(), message.trim());
      toast.success("Message sent successfully");
      setMessage("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Contact Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Send a Message</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="contactName">Name</Label>
            <Input id="contactName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="mt-1 bg-gray-50 border-gray-200" />
          </div>

          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1 bg-gray-50 border-gray-200" />
          </div>

          <div>
            <Label htmlFor="contactMessage">Your message</Label>
            <Textarea id="contactMessage" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help you?" rows={5} className="mt-1 bg-gray-50 border-gray-200" />
          </div>

          <Button onClick={handleSendMessage} disabled={isSending} className="bg-blue-500 hover:bg-blue-600 w-full">
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6">
        <h3 className="font-semibold mb-4">Contact Info</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Perth Business Evaluators Pty Ltd</p>
            <p className="text-sm text-gray-600">ABN: 51 622 231 832</p>
            <p className="text-sm text-gray-600">Trading as: Intaleks</p>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-700">Email</p>
              <a href="mailto:admin@intaleks.com" className="text-sm text-blue-600 hover:text-blue-700">
                admin@intaleks.com
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Personal data is handled under the Australian Privacy Act 1988 (Cth). These Terms are governed by Western Australian law.</p>
          </div>
        </div>
      </div>

      {/* Office Locations - Removed as not in original footer */}
    </div>
  );
}
