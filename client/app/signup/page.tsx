"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";
import { useAuth } from "@/app/hooks/useAuth";

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

/**
 * Signup page at /signup
 * Form with email, password, confirm password, name fields
 * Client-side validation with inline errors
 * Requirements: 7.1, 7.3, 7.6
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const { register, isRegistering, registerError } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    register({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      name: formData.name.trim() || undefined,
    });
  };

  return (
    <AuthFormLayout title="Create your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        {/* Server error display */}
        {registerError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{registerError.message}</div>}

        {/* Name field (optional) */}
        <div className="flex flex-col gap-y-1">
          <InputField
            type="text"
            label="Name (optional)"
            placeholder="Enter your name"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            error={!!errors.name}
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
        </div>

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
            placeholder="Enter your password (min 8 characters)"
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

        {/* Confirm Password field */}
        <div className="flex flex-col gap-y-1">
          <InputField
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            hasIcon
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
        </div>

        {/* Submit button */}
        <button type="submit" disabled={isRegistering} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-x-2 mt-2">
          {isRegistering && <Loader2 className="animate-spin" />}
          {isRegistering ? "Creating account..." : "Sign Up"}
        </button>

        {/* Link to login page */}
        <p className="text-center text-gray-600 text-sm mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
            Log in
          </Link>
        </p>
      </form>
    </AuthFormLayout>
  );
}
