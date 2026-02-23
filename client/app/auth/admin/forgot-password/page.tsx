"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";
import { AuthApi } from "@/lib/auth-api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AuthApi.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message);
      // For testing: show token (remove in production)
      if (data.token) {
        setResetToken(data.token);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });

  const handlePasswordReset = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  return (
    <AuthFormLayout title="Reset your password using your admin email">
      <InputField type="email" label="Email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={forgotPasswordMutation.isPending} />

      <button onClick={handlePasswordReset} disabled={forgotPasswordMutation.isPending} className="w-full cursor-pointer bg-(--primary-border-typing) hover:bg-(--primary-border-typing)/90 transition-colors duration-200 text-white font-semibold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {forgotPasswordMutation.isPending ? "Sending..." : "Reset Password"}
      </button>

      {resetToken && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold mb-2">Testing Mode - Reset Token:</p>
          <code className="text-xs text-yellow-900 break-all block bg-yellow-100 p-2 rounded">{resetToken}</code>
          <p className="text-xs text-yellow-700 mt-2">Use this token on the reset password page. In production, this would be sent via email.</p>
        </div>
      )}
    </AuthFormLayout>
  );
}
