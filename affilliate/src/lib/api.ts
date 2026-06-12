import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4545";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthMe = error.config?.url?.includes("/auth/me");
        const isLandingPage = window.location.pathname === "/";

        if (!isAuthMe && !isLandingPage) {
          const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "http://localhost:3000";
          const absolutePath = `${window.location.origin}${window.location.pathname}${window.location.search}`;
          const next = encodeURIComponent(absolutePath);
          window.location.href = `${mainAppUrl}/login?next=${next}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
