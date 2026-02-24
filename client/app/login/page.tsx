"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";
import { useAuth } from "@/app/hooks/useAuth";

interface FormErrors {
  email: string;
  password: string;
}

/**
 * Login form component that uses useSearchParams
 * Wrapped in Suspense boundary in the parent component
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });

  const { login, isLoggingIn, loginError } = useAuth(returnUrl || "/");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: "",
      password: "",
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    login({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    });
  };

  return (
    <AuthFormLayout title="Welcome back! Please log in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        {/* Return URL info */}
        {returnUrl && <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm">Please log in to continue</div>}

        {/* Server error display */}
        {loginError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{loginError.message}</div>}

        {/* Email field */}
        <div className="flex flex-col gap-y-1">
          <InputField
            type="email"
            label="Email"
            placeholder="Enter your email"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            error={!!errors.email}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-y-1">
          <InputField
            type="password"
            label="Password"
            placeholder="Enter your password"
            hasIcon
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            error={!!errors.password}
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
        </div>

        {/* Submit button */}
        <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-x-2 mt-2">
          {isLoggingIn && <Loader2 className="animate-spin" />}
          {isLoggingIn ? "Logging in..." : "Log In"}
        </button>

        {/* Link to signup page */}
        <p className="text-center text-gray-600 text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link href={returnUrl ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}` : "/signup"} className="text-blue-500 hover:text-blue-600 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </AuthFormLayout>
  );
}

/**
 * Login page at /login
 * Form with email and password fields
 * Display authentication errors
 * Redirect on success
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthFormLayout title="Welcome back! Please log in">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        </AuthFormLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
