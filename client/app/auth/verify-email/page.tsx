"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, Loader2 } from "lucide-react";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <AuthFormLayout title="Verify your email">
      <div className="flex flex-col items-center gap-y-6 text-center">
        {/* Email icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-10 h-10 text-blue-500" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
          <p className="text-gray-600">
            We've sent a verification link to
            {email && (
              <>
                <br />
                <span className="font-medium text-gray-900">{email}</span>
              </>
            )}
          </p>
          <p className="text-sm text-gray-500">Click the link in the email to verify your account and complete your registration.</p>
        </div>

        {/* Additional info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <p className="font-medium text-gray-900">Didn't receive the email?</p>
          <ul className="text-left space-y-1 list-disc list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and check again</li>
          </ul>
        </div>

        {/* Resend link */}
        <p className="text-sm text-gray-600">
          Need help?{" "}
          <a href="/contact" className="text-blue-500 hover:text-blue-600 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </AuthFormLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthFormLayout title="Verify your email">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        </AuthFormLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
