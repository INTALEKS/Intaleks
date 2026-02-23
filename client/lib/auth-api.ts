const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4545/api";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  token?: string; // Only for testing, remove in production
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export class AuthApi {
  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to send reset email");
    }

    return data;
  }

  static async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to reset password");
    }

    return data;
  }
}
