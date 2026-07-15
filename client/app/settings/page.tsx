"use client";

import { useState, useRef, Suspense, useEffect } from "react";
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
import { InvoiceList } from "@/components/InvoiceList";
import { Loader2, Check, Mail, Camera, Copy, ExternalLink, FileText, Users, CheckCircle, Clock, XCircle, Plus, Award, Download, ChevronRight } from "lucide-react";
import { ApiClient } from "@/app/services/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TabType = "details" | "subscriptions" | "invoices" | "contact" | "referrals";

interface UserData {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
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
    { key: "invoices" as TabType, label: "Invoices" },
    { key: "contact" as TabType, label: "Contact Admin" },
    { key: "referrals" as TabType, label: "Referral Program" },
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
            {activeTab === "invoices" && <InvoicesTab />}
            {activeTab === "contact" && <ContactAdminTab user={user} />}
            {activeTab === "referrals" && <ReferralsTab user={user} />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// My Details Tab Component
function MyDetailsTab({ user, onProfileUpdate }: { user: UserData | null; onProfileUpdate: () => void }) {
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "");
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

      // Get current names - use input values if not empty, otherwise use user data
      const currentFirstName = firstName.trim() ? firstName.trim() : user?.firstName || user?.name?.split(" ")[0] || "User";
      const currentLastName = lastName.trim() ? lastName.trim() : user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "Name";

      // Validate we have at least a first name
      if (!currentFirstName) {
        toast.error("Please set your first name before uploading an avatar");
        return;
      }

      // Update profile with new avatar
      await ApiClient.updateProfile(currentFirstName, currentLastName, avatarUrl);

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
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (firstName.trim().length > 100 || lastName.trim().length > 100) {
      toast.error("First name and last name must be less than 100 characters");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await ApiClient.updateProfile(firstName.trim(), lastName.trim(), user?.avatar || undefined);
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
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" className="mt-1 bg-gray-100 border-0" />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" className="mt-1 bg-gray-100 border-0" />
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
  const allPlans = (plans as SubscriptionPlan[] | undefined) || [];
  const otherPlans = allPlans.filter((p) => p.id !== currentPlan?.id);

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
      {/* Current Plan */}
      {hasActiveSubscription && currentPlan && (
        <>
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded">{currentPlan?.name?.toUpperCase() || "VISITOR"}</span>
              <span className="text-xs text-green-600 font-medium">Active</span>
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
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </div>
        </>
      )}

      {/* Available Plans */}
      {!hasActiveSubscription && allPlans.length > 0 && (
        <>
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {allPlans.map((plan) => (
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

      {/* No subscription message */}
      {!hasActiveSubscription && allPlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscription plans available at the moment.</p>
        </div>
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

// Invoices Tab Component
function InvoicesTab() {
  return (
    <div>
      <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Payment History & Invoices</h2>
      <p className="text-gray-600 mb-6">View and manage your payment history and download invoices for your subscription payments.</p>
      <InvoiceList />
    </div>
  );
}

// Professional Referral Program Tab Component
function ReferralsTab({ user }: { user: UserData | null }) {
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [reapplyMode, setReapplyMode] = useState(false);

  // Form state
  const [professionalType, setProfessionalType] = useState("Accountant");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");

  const isActiveSubscriber = user?.subscriptionStatus === "ACTIVE";

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getProfessionalReferralProfile();
      if (res.success && res.data) {
        setProfile(res.data.profile);
        setApplication(res.data.application);

        // If approved, fetch referred clients
        if (res.data.profile) {
          const clientsRes = await ApiClient.getReferredClients();
          if (clientsRes.success) {
            setClients(clientsRes.data || []);
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to load referral details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActiveSubscriber) {
      fetchReferralData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await ApiClient.applyForProfessionalReferral({
        professionalType,
        companyName: companyName.trim(),
        website: website.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || "Application submitted successfully!");
        setReapplyMode(false);
        fetchReferralData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!profile?.code) return;
    const referralLink = `${window.location.origin}/signup?ref=${profile.code}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!profile?.code) return;
    navigator.clipboard.writeText(profile.code);
    setCopiedCode(true);
    toast.success("Promo code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // State 1: User is not active subscriber
  if (!isActiveSubscriber) {
    return (
      <div className="bg-white border rounded-xl p-6 lg:p-8 max-w-2xl shadow-sm">
        <Award className="w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Professional Referral Program</h2>
        <p className="text-gray-600 mb-6 text-sm lg:text-base leading-relaxed">
          Our Professional Referral Program is designed specifically for lawyers, accountants, financial advisors, and other business consultants. Provide your clients with a <strong>25% discount</strong> on their lifetime valuation report subscription and gain direct, secure access to view and download their completed valuation reports.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 font-medium">
            Subscription Required
          </p>
          <p className="text-xs text-blue-600 mt-1">
            To maintain program integrity and enable you to understand our tool firsthand, you must have an active subscription to join.
          </p>
        </div>
        <button
          onClick={() => {
            const pricing = document.getElementById("pricing");
            if (pricing) pricing.scrollIntoView({ behavior: "smooth" });
            else window.location.href = "/#pricing";
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors duration-200"
        >
          View Subscription Plans
        </button>
      </div>
    );
  }

  // State 2: Active subscriber, show Application Form (if not applied or in reapply mode)
  const hasApplied = !!application;
  const isPending = application?.status === "PENDING";
  const isApproved = application?.status === "APPROVED" || !!profile;
  const isRejected = application?.status === "REJECTED";

  if (!hasApplied || (isRejected && reapplyMode)) {
    return (
      <div className="bg-white border rounded-xl p-6 lg:p-8 max-w-2xl shadow-sm">
        <Award className="w-12 h-12 text-blue-500 mb-4" />
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Apply for Referral Program</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please fill out the form below. Once approved, you will receive a unique referral link and code to share with your clients.
        </p>

        <form onSubmit={handleSubmitApplication} className="space-y-4">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="prof-type">Professional Designation</Label>
            <Select value={professionalType} onValueChange={setProfessionalType}>
              <SelectTrigger id="prof-type" className="w-full bg-white border border-gray-200">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accountant">Accountant</SelectItem>
                <SelectItem value="Lawyer">Lawyer / Legal Counsel</SelectItem>
                <SelectItem value="Business Advisor">Business Advisor / Consultant</SelectItem>
                <SelectItem value="M&A Broker">M&A Broker / Advisor</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="company-name">Company / Practice Name</Label>
            <Input
              id="company-name"
              type="text"
              placeholder="e.g. Sterling Accountants"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-x-2 pt-2">
            {isRejected && (
              <button
                type="button"
                onClick={() => setReapplyMode(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium px-5 py-2 rounded-lg text-sm flex items-center gap-x-2 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    );
  }

  // State 3: Pending review
  if (isPending) {
    return (
      <div className="bg-white border rounded-xl p-6 lg:p-8 max-w-2xl text-center shadow-sm">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-600 mb-6 text-sm lg:text-base leading-relaxed">
          Thank you for applying to the Intaleks Professional Referral Program! Our admin team is manually reviewing your application. We will update you with our feedback as soon as possible.
        </p>
        <div className="bg-gray-50 border rounded-lg p-4 inline-block text-left text-xs text-gray-600 space-y-1">
          <p><strong>Practice:</strong> {application.companyName}</p>
          <p><strong>Role:</strong> {application.professionalType}</p>
          <p><strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  // State 4: Rejected with feedback
  if (isRejected && !reapplyMode) {
    return (
      <div className="bg-white border rounded-xl p-6 lg:p-8 max-w-2xl shadow-sm">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Application Declined</h2>
        <p className="text-gray-600 mb-6 text-sm">
          We appreciate your interest. Unfortunately, your professional referral application was declined by the administrator.
        </p>

        {application.feedback && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1">Admin Feedback</p>
            <p className="text-sm leading-relaxed">{application.feedback}</p>
          </div>
        )}

        <button
          onClick={() => setReapplyMode(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Modify & Re-apply
        </button>
      </div>
    );
  }

  // State 5: Approved & Active Profile Dashboard
  return (
    <div className="space-y-6">
      {/* Overview stats & Link cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats card */}
        <div className="bg-white border rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <Users className="w-5 h-5 text-blue-500 mb-1" />
            <h3 className="text-sm font-semibold text-gray-500">Referred Clients</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{clients.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total linked accounts</p>
        </div>

        {/* Promo code card */}
        <div className="bg-white border rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <Award className="w-5 h-5 text-green-500 mb-1" />
            <h3 className="text-sm font-semibold text-gray-500">Referral Discount Code</h3>
          </div>
          <div className="flex items-center justify-between mt-3 bg-gray-50 border rounded-lg px-3 py-1.5">
            <span className="font-mono text-sm font-bold text-gray-800">{profile?.code}</span>
            <button
              onClick={handleCopyCode}
              className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center gap-x-0.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Clients get 25% discount</p>
        </div>

        {/* Link card */}
        <div className="bg-white border rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <ExternalLink className="w-5 h-5 text-purple-500 mb-1" />
            <h3 className="text-sm font-semibold text-gray-500">Referral Link</h3>
          </div>
          <button
            onClick={handleCopyLink}
            className="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-x-1.5 transition-colors border border-blue-100"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? "Link Copied" : "Copy Referral Link"}
          </button>
          <p className="text-xs text-gray-500 mt-2">Auto-applies code during checkout</p>
        </div>
      </div>

      {/* Clients Management List */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Referred Clients Directory</h2>
          <p className="text-xs text-gray-500">View your referred clients, their inputs, and download their valuation reports.</p>
        </div>

        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">No referred clients yet</p>
            <p className="text-xs text-gray-400 mt-1">Share your link or code to start onboarding your clients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold border-b">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3">Subscription Status</th>
                  <th className="px-5 py-3">Valuations</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">
                        {client.firstName || client.lastName
                          ? `${client.firstName || ""} ${client.lastName || ""}`.trim()
                          : "User"}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{client.email}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {new Date(client.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          client.subscriptionStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {client.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-900">
                      {client.valuationDocuments.length} reports
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-blue-500 hover:text-blue-600 font-semibold text-xs inline-flex items-center gap-x-0.5"
                      >
                        View Client Data <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Sheet / Modal */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Client Profile: {selectedClient.firstName || selectedClient.lastName
                  ? `${selectedClient.firstName || ""} ${selectedClient.lastName || ""}`.trim()
                  : "User"}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">{selectedClient.email}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              {/* Valuation Documents */}
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Valuation Reports</h3>
                {selectedClient.valuationDocuments.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">No valuation reports generated by this client yet.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedClient.valuationDocuments.map((doc: any) => (
                      <div key={doc.id} className="border rounded-xl p-4 bg-gray-50/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{doc.companyName}</h4>
                            <p className="text-xs text-gray-500 capitalize">
                              {doc.industry} &bull; {doc.country} &bull; {doc.method} Method
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-xs text-gray-400 block">Valuation Amount</span>
                            <span className="font-extrabold text-blue-600 text-base">
                              ${doc.valuation.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>

                        {/* Financial Inputs & Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Left: Questionnaire Scores */}
                          {doc.questionnaireResponse ? (
                            <div className="space-y-2">
                              <h5 className="font-bold text-gray-700">Questionnaire Scores & Factors</h5>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 border rounded-lg p-2.5 bg-white shadow-sm">
                                <div>Total Score: <span className="font-semibold">{doc.questionnaireResponse.totalScore}/50</span></div>
                                <div>Multiple Category: <span className="font-semibold capitalize text-blue-600">{doc.questionnaireResponse.multipleCategory}</span></div>
                                <div>Calculated Multiple: <span className="font-semibold">{doc.questionnaireResponse.calculatedMultiple}x</span></div>
                                <div>Growth Rate: <span className="font-semibold">{doc.questionnaireResponse.growthRate}/5</span></div>
                                <div>Recurring Rev: <span className="font-semibold">{doc.questionnaireResponse.recurringRevenue}/5</span></div>
                                <div>Owner Dep: <span className="font-semibold">{doc.questionnaireResponse.ownerDependence}/5</span></div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No questionnaire data associated.</p>
                          )}

                          {/* Right: Actions / Download */}
                          <div className="flex flex-col justify-end items-start md:items-end gap-2">
                            <span className="text-xs text-gray-400">
                              Generated {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                            {doc.fileUrl ? (
                              <a
                                href={doc.fileUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-x-1.5 transition-colors shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" /> Download PDF Report
                              </a>
                            ) : (
                              <span className="text-xs text-red-500 italic font-medium">PDF report not ready</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button onClick={() => setSelectedClient(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
