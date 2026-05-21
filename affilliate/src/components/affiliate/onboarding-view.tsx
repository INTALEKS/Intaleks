"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  LogOut,
  Building2,
  Globe,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Rocket
} from "lucide-react";

import { useUser } from "@/components/auth/access-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

function getMainAppUrl() {
  return process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://intaleks.com";
}

export function OnboardingView() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  
  // Form fields
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [paypal, setPaypal] = useState("");
  const [paypalError, setPaypalError] = useState("");

  const appStatus = user?.affiliateApplication?.status; // "pending" | "approved" | "rejected" | undefined

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // silently ignore
    }
    window.location.href = `${getMainAppUrl()}/login`;
  }

  async function handleInstantActivate() {
    setLoading(true);
    try {
      const res = await api.post("/api/users/affiliate/activate");
      if (res.data?.success) {
        toast.success("Affiliate account activated instantly!");
        // Small delay to allow toast to show
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(res.data?.message || "Activation failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred during activation");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    setPaypalError("");

    if (!paypal.trim()) {
      setPaypalError("PayPal email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypal.trim())) {
      setPaypalError("Please enter a valid PayPal email address");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/affiliate/apply", {
        company: company.trim(),
        website: website.trim(),
        paypal: paypal.trim(),
      });

      if (res.data?.success) {
        toast.success("Application submitted successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(res.data?.message || "Submission failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred during submission");
    } finally {
      setLoading(false);
    }
  }

  // --- RENDERING STATES ---

  // State B: Pending Review
  if (appStatus === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--affiliate-bg)] p-4 text-[var(--affiliate-navy)] selection:bg-[var(--affiliate-sky)] selection:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--affiliate-bg-accent),transparent_50%)] pointer-events-none" />
        
        <div className="relative w-full max-w-md">
          {/* Logo Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold tracking-tight text-[var(--affiliate-navy)]">intaleks</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--affiliate-muted)]">Affiliate Portal</p>
          </div>

          <Card className="overflow-hidden rounded-2xl border-[var(--affiliate-border)] bg-white shadow-xl shadow-slate-100">
            <div className="h-1.5 bg-gradient-to-r from-[var(--affiliate-blue)] to-[var(--affiliate-sky)]" />
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--affiliate-bg-accent)] text-[var(--affiliate-blue)] animate-pulse">
                <Clock className="size-6" />
              </div>
              <CardTitle className="text-xl font-semibold">Application Under Review</CardTitle>
              <CardDescription className="text-xs text-[var(--affiliate-muted)]">
                Our administrative team is currently verifying your profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-[var(--affiliate-bg-accent)] p-4 text-center text-xs text-[var(--affiliate-muted-dark)] border border-[var(--affiliate-border-strong)]/30">
                <p className="font-medium text-[var(--affiliate-blue-strong)] mb-1">We are on it!</p>
                We are reviewing your website and PayPal details to establish your partner account. Activation typically occurs in less than 24 hours.
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider text-[var(--affiliate-muted)] font-semibold">Verification Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--affiliate-green)]" />
                    <span className="text-xs font-medium text-[var(--affiliate-navy)]">Application Submitted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-[var(--affiliate-blue)] border-t-transparent animate-spin" />
                    <span className="text-xs font-medium text-[var(--affiliate-navy)]">Admin Details Review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HelpCircle className="size-4 shrink-0 text-[var(--affiliate-muted)]" />
                    <span className="text-xs font-medium text-[var(--affiliate-muted)]">Account & Code Generation</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--affiliate-border)]">
                <Button 
                  variant="outline" 
                  className="w-full text-xs gap-2 py-5 cursor-pointer"
                  onClick={() => window.open(getMainAppUrl(), "_blank")}
                >
                  Return to Main App
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-xs gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State C: Rejected
  if (appStatus === "rejected" && !showApplyForm) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--affiliate-bg)] p-4 text-[var(--affiliate-navy)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--affiliate-bg-accent),transparent_50%)] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Logo Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold tracking-tight text-[var(--affiliate-navy)]">intaleks</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--affiliate-muted)]">Affiliate Portal</p>
          </div>

          <Card className="overflow-hidden rounded-2xl border-[var(--affiliate-border)] bg-white shadow-xl shadow-slate-100">
            <div className="h-1.5 bg-rose-500" />
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <XCircle className="size-6" />
              </div>
              <CardTitle className="text-xl font-semibold text-rose-950">Application Unapproved</CardTitle>
              <CardDescription className="text-xs text-[var(--affiliate-muted)]">
                We were unable to approve your affiliate request at this time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl bg-rose-50/50 p-4 text-xs text-rose-800 border border-rose-100 leading-relaxed">
                <p className="font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> Why was it unapproved?
                </p>
                Applications are commonly rejected if the website provided is unverified, missing, or lacks relevant content. We also require a correct, active PayPal address to deliver commission payments.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  className="w-full text-xs gap-2 py-5 bg-[var(--affiliate-navy)] hover:bg-[var(--affiliate-blue-strong)] text-white cursor-pointer"
                  onClick={() => setShowApplyForm(true)}
                >
                  <Sparkles className="size-4 text-[var(--affiliate-sky)]" />
                  Submit a New Application
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs py-5 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4 mr-2" />
                  Sign out of Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State A: Choose Flow / Application Form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--affiliate-bg)] p-4 text-[var(--affiliate-navy)] selection:bg-[var(--affiliate-sky)] selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--affiliate-bg-accent),transparent_50%)] pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {/* Logo Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--affiliate-navy)]">intaleks</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--affiliate-muted)]">Affiliate Partner Program</p>
        </div>

        {!showApplyForm ? (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto mb-2">
              <h2 className="text-xl font-semibold tracking-tight">Unlock Your Earning Potential</h2>
              <p className="mt-1.5 text-xs text-[var(--affiliate-muted)] leading-relaxed">
                Join the Intaleks Partner Program. Earn high-ticket recurring commissions by recommending our AI-driven solutions to your network.
              </p>
            </div>

            {/* Split cards options */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Option A: Instant */}
              <Card className="flex flex-col overflow-hidden rounded-2xl border-[var(--affiliate-border)] bg-white shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-1 bg-[var(--affiliate-blue)]" />
                <CardHeader className="pb-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[var(--affiliate-bg-accent)] text-[var(--affiliate-blue)]">
                    <Rocket className="size-5 animate-pulse" />
                  </div>
                  <CardTitle className="text-base font-semibold">Fast-Track Activation</CardTitle>
                  <CardDescription className="text-xs text-[var(--affiliate-muted)]">
                    Start promoting immediately with standard terms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-xs text-[var(--affiliate-muted-dark)] leading-relaxed">
                    Instantly activate your profile and unlock standard marketing links. Generates a randomized referral code tied directly to your profile. Recommended for most individual publishers.
                  </p>
                  <Button 
                    className="w-full text-xs py-5 bg-[var(--affiliate-navy)] hover:bg-[var(--affiliate-blue-strong)] text-white cursor-pointer"
                    disabled={loading}
                    onClick={handleInstantActivate}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Activating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Instant Activation
                        <ArrowRight className="size-3.5" />
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Option B: Review Application */}
              <Card className="flex flex-col overflow-hidden rounded-2xl border-[var(--affiliate-border)] bg-white shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-1 bg-[var(--affiliate-sky)]" />
                <CardHeader className="pb-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[var(--affiliate-bg-accent)] text-[var(--affiliate-blue)]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">Custom Partner Program</CardTitle>
                  <CardDescription className="text-xs text-[var(--affiliate-muted)]">
                    Submit application for tailored terms and codes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-xs text-[var(--affiliate-muted-dark)] leading-relaxed">
                    For structured marketing teams, large agencies, and professional influencers. Fill out a short application details form. Offers custom commission tiers and customized promo codes upon approval.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full text-xs py-5 border-[var(--affiliate-border-strong)] hover:bg-[var(--affiliate-bg-accent)] hover:text-[var(--affiliate-blue-strong)] cursor-pointer"
                    onClick={() => setShowApplyForm(true)}
                  >
                    Apply for Custom Program
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Logout link */}
            <div className="text-center pt-2">
              <button 
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:underline transition-all cursor-pointer font-medium"
                onClick={handleLogout}
              >
                <LogOut className="size-3.5" />
                Sign out of account
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Custom Partner application form */}
            <Card className="overflow-hidden rounded-2xl border-[var(--affiliate-border)] bg-white shadow-xl shadow-slate-100">
              <div className="h-1.5 bg-gradient-to-r from-[var(--affiliate-blue)] to-[var(--affiliate-sky)]" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Partner Application Details</CardTitle>
                <CardDescription className="text-xs text-[var(--affiliate-muted)]">
                  Provide your business information to customize your onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs font-semibold text-[var(--affiliate-navy)] flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-[var(--affiliate-muted)]" />
                      Company / Organization Name
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="e.g. Acme Media Corp (Optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="border-[var(--affiliate-border)] text-xs py-5 rounded-lg focus-visible:ring-[var(--affiliate-blue)]"
                    />
                  </div>

                  {/* Website URL */}
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-xs font-semibold text-[var(--affiliate-navy)] flex items-center gap-1.5">
                      <Globe className="size-3.5 text-[var(--affiliate-muted)]" />
                      Website or Content Channel URL
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yoursite.com (Optional)"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="border-[var(--affiliate-border)] text-xs py-5 rounded-lg focus-visible:ring-[var(--affiliate-blue)]"
                    />
                  </div>

                  {/* PayPal Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="paypal" className="text-xs font-semibold text-[var(--affiliate-navy)] flex items-center gap-1.5">
                      <Mail className="size-3.5 text-[var(--affiliate-blue)]" />
                      PayPal Email <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="paypal"
                      type="email"
                      required
                      placeholder="payments@yourdomain.com"
                      value={paypal}
                      onChange={(e) => {
                        setPaypal(e.target.value);
                        if (paypalError) setPaypalError("");
                      }}
                      className={`border-[var(--affiliate-border)] text-xs py-5 rounded-lg focus-visible:ring-[var(--affiliate-blue)] ${
                        paypalError ? "border-rose-400 focus-visible:ring-rose-400" : ""
                      }`}
                    />
                    {paypalError && (
                      <p className="text-[10px] text-rose-500 font-medium">{paypalError}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-[var(--affiliate-border)]">
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="w-full text-xs py-5 bg-[var(--affiliate-navy)] hover:bg-[var(--affiliate-blue-strong)] text-white cursor-pointer"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting Application...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Submit Application Request
                          <ArrowRight className="size-3.5" />
                        </span>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      className="w-full text-xs text-[var(--affiliate-muted)] hover:bg-[var(--affiliate-bg-accent)] hover:text-[var(--affiliate-navy)] cursor-pointer"
                      disabled={loading}
                      onClick={() => {
                        setShowApplyForm(false);
                        setPaypalError("");
                      }}
                    >
                      Cancel & Go Back
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
