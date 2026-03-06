"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";

function VerifyEmailConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      // Prevent double verification in React Strict Mode using ref
      if (hasVerifiedRef.current) {
        return;
      }
      hasVerifiedRef.current = true;

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4545/api";

        const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          // Check if it's an "already verified" message (treat as success)
          if (data.message && data.message.toLowerCase().includes("already verified")) {
            setStatus("success");
            setMessage("Your email is already verified. You can now log in.");
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          } else {
            setStatus("error");
            setMessage(data.message || "Failed to verify email. The link may be invalid or expired.");
          }
        }
      } catch (error) {
        console.error("Exception during verification:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again.");
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthFormLayout title="Email Verification">
      <div className="flex flex-col items-center gap-y-6 text-center">
        {/* Status icon */}
        {status === "loading" && (
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}

        {status === "success" && (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        )}

        {status === "error" && (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        )}

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Action buttons */}
        {status === "success" && (
          <div className="w-full space-y-3">
            <button onClick={() => router.push("/login")} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg">
              Continue to Login
            </button>
            <p className="text-sm text-gray-500">Redirecting automatically in 3 seconds...</p>
          </div>
        )}

        {status === "error" && (
          <div className="w-full space-y-3">
            <button onClick={() => router.push("/signup")} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg">
              Back to Sign Up
            </button>
            <button onClick={() => router.push("/contact")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200">
              Contact Support
            </button>
          </div>
        )}
      </div>
    </AuthFormLayout>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense
      fallback={
        <AuthFormLayout title="Email Verification">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        </AuthFormLayout>
      }
    >
      <VerifyEmailConfirmContent />
    </Suspense>
  );
}
