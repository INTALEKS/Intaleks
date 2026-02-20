"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";
import { useAdminAuth } from "@/app/hooks/useAuth";

export default function AdminLogin() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: false, password: false });

  const { isLoggingIn, login } = useAdminAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError({ email: false, password: false });

    const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email);
    if (!loginData.email || !validateEmail) {
      setError((prev) => ({ ...prev, email: true }));
      return;
    }

    if (!loginData.password) {
      setError((prev) => ({ ...prev, password: true }));
      return;
    }

    login(loginData);
  };

  return (
    <AuthFormLayout title="Welcome! Please login to admin dashboard">
      <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
        <InputField
          type="email"
          label="Email"
          placeholder="Enter your email"
          onChange={(e) =>
            setLoginData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          error={!!error.email}
        />
        <InputField
          type="password"
          label="Password"
          placeholder="Enter your password"
          hasIcon
          onChange={(e) =>
            setLoginData((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
          error={!!error.password}
        />

        <Link href="/admin/auth/forgot-password" className="self-end text-(--text-primary-dark) text-sm">
          Forgot your password?
        </Link>

        <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-x-2">
          {isLoggingIn && <Loader2 className="animate-spin" />}
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthFormLayout>
  );
}
