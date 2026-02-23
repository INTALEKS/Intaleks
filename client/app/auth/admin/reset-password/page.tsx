"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";
import { AuthApi } from "@/lib/auth-api";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => AuthApi.resetPassword(token, password),
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        router.push("/auth/admin/login");
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const handleResetPassword = () => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({ token, password });
  };

  return (
    <AuthFormLayout title="Set your new password">
      <InputField type="text" label="Reset Token" placeholder="Enter reset token" value={token} onChange={(e) => setToken(e.target.value)} disabled={resetPasswordMutation.isPending} />

      <InputField type="password" label="New Password" placeholder="Enter new password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} disabled={resetPasswordMutation.isPending} />

      <InputField type="password" label="Confirm Password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={resetPasswordMutation.isPending} />

      <button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending} className="w-full cursor-pointer bg-(--primary-border-typing) hover:bg-(--primary-border-typing)/90 transition-colors duration-200 text-white font-semibold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
      </button>
    </AuthFormLayout>
  );
}
