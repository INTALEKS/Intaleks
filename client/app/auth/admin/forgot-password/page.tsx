"use client";

import InputField from "@/components/general-ui/InputField";
import AuthFormLayout from "@/components/general-ui/AuthFormLayout";

export default function page() {
  function handleEmailChange() {}
  function handlePasswordReset() {}

  return (
    <AuthFormLayout title="Reset your password using your admin email">
      <InputField type="email" label="Email" placeholder="Enter your email" onChange={handleEmailChange} />
      <button onClick={handlePasswordReset} className="w-full cursor-pointer bg-(--primary-border-typing) hover:bg-(--primary-border-typing)/90 transition-colors duration-200 text-white font-semibold py-3 px-4 rounded-lg shadow-lg">
        Reset Password
      </button>
    </AuthFormLayout>
  );
}
