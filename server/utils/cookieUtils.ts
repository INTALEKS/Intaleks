import { Request, Response } from "express";
import { config } from "../config/environment";

export interface CookieOptions {
  maxAge?: number; // in milliseconds
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  domain?: string;
  path?: string;
}

export class CookieUtils {
  // Cookie names
  static readonly AUTH_TOKEN_COOKIE = "auth_token";

  /*** Get default secure cookie options   ***/
  private static getDefaultOptions(): CookieOptions {
    const isProduction = config.env === "production";
    console.log("NODE ENVIRONMENT: ", isProduction);

    // Dynamic root domain mapping for secure cookie distribution across subdomains
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax", // Enforce Lax sameSite to prevent CSRF attacks in production
      domain: isProduction ? cookieDomain : undefined,
      path: "/",
    };
  }

  /*** Set authentication token cookie ***/
  static setAuthToken(res: Response, token: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const options: CookieOptions = { ...this.getDefaultOptions(), maxAge };
    res.cookie(this.AUTH_TOKEN_COOKIE, token, options);
  }

  /*** Get authentication token cookie ***/
  static getAuthToken(req: Request): string | null {
    // Safety check for cookies object
    if (!req.cookies) {
      console.warn("req.cookies is undefined - cookie-parser middleware may not be configured");
      return null;
    }
    return req.cookies[this.AUTH_TOKEN_COOKIE] || null;
  }

  /*** Clear authentication token cookie ***/
  static clearAuthToken(res: Response): void {
    const isProduction = config.env === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    res.clearCookie(this.AUTH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: isProduction ? cookieDomain : undefined,
      path: "/",
    });
  }
}
