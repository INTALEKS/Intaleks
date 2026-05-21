"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieUtils = void 0;
const environment_1 = require("../config/environment");
class CookieUtils {
    // Cookie names
    static AUTH_TOKEN_COOKIE = "auth_token";
    /*** Get default secure cookie options   ***/
    static getDefaultOptions() {
        const isProduction = environment_1.config.env === "production";
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
    static setAuthToken(res, token, maxAge = 7 * 24 * 60 * 60 * 1000) {
        const options = { ...this.getDefaultOptions(), maxAge };
        res.cookie(this.AUTH_TOKEN_COOKIE, token, options);
    }
    /*** Get authentication token cookie ***/
    static getAuthToken(req) {
        // Safety check for cookies object
        if (!req.cookies) {
            console.warn("req.cookies is undefined - cookie-parser middleware may not be configured");
            return null;
        }
        return req.cookies[this.AUTH_TOKEN_COOKIE] || null;
    }
    /*** Clear authentication token cookie ***/
    static clearAuthToken(res) {
        const isProduction = environment_1.config.env === "production";
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
exports.CookieUtils = CookieUtils;
