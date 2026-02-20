"use strict";
/**
 * Webhook Error Logger Service
 * Provides structured logging for failed webhook processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookErrorLogger = void 0;
const db_1 = require("../config/db");
/**
 * In-memory store for webhook error logs
 * In production, this should be stored in database or external logging service
 */
const webhookErrorLogs = [];
/**
 * Maximum number of error logs to keep in memory
 */
const MAX_ERROR_LOGS = 1000;
/**
 * Webhook Error Logger Service
 * Logs failed webhook processing for manual review
 */
class WebhookErrorLogger {
    /**
     * Log a webhook processing error
     * - Stores error details for manual review
     * - Includes event ID, type, error message, and payload
     */
    static async logError(params) {
        const { eventId, eventType, error, errorCode, payload } = params;
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : undefined;
        const logEntry = {
            eventId,
            eventType,
            error: errorMessage,
            errorCode,
            payload: payload ? this.sanitizePayload(payload) : undefined,
            timestamp: new Date(),
            resolved: false,
        };
        // Store in memory
        webhookErrorLogs.unshift(logEntry);
        // Trim old logs to prevent memory leak
        if (webhookErrorLogs.length > MAX_ERROR_LOGS) {
            webhookErrorLogs.splice(MAX_ERROR_LOGS);
        }
        // Log to console for immediate visibility
        console.error("[Webhook Error]", {
            eventId,
            eventType,
            error: errorMessage,
            errorCode,
            timestamp: logEntry.timestamp.toISOString(),
            stack: errorStack,
        });
        // Attempt to store in database if WebhookErrorLog model exists
        try {
            await this.persistToDatabase(logEntry);
        }
        catch (dbError) {
            // If database storage fails, just log to console
            console.error("[Webhook Error Logger] Failed to persist to database:", dbError);
        }
    }
    /**
     * Sanitize payload to remove sensitive information
     * - Removes card details, tokens, and other sensitive data
     */
    static sanitizePayload(payload) {
        try {
            const parsed = JSON.parse(payload);
            // Remove sensitive fields recursively
            const sanitized = this.sanitizeObject(parsed);
            return JSON.stringify(sanitized);
        }
        catch {
            // If not valid JSON, return truncated version
            return payload.length > 1000 ? payload.substring(0, 1000) + "...[truncated]" : payload;
        }
    }
    /**
     * Recursively sanitize an object to remove sensitive fields
     */
    static sanitizeObject(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeObject(item));
        }
        if (typeof obj !== "object") {
            return obj;
        }
        const sensitiveFields = ["card", "card_number", "cvc", "cvv", "exp_month", "exp_year", "number", "token", "secret", "password", "api_key", "access_token", "refresh_token"];
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
                sanitized[key] = "[REDACTED]";
            }
            else if (typeof value === "object") {
                sanitized[key] = this.sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    /**
     * Persist error log to database
     * Uses raw query if WebhookErrorLog model doesn't exist
     */
    static async persistToDatabase(logEntry) {
        // Check if webhook_error_logs table exists by attempting to query it
        // If it doesn't exist, we'll just skip database persistence
        try {
            await db_1.prisma.$executeRaw `
        INSERT INTO webhook_error_logs (id, event_id, event_type, error, error_code, payload, timestamp, resolved)
        VALUES (gen_random_uuid(), ${logEntry.eventId}, ${logEntry.eventType}, ${logEntry.error}, ${logEntry.errorCode || null}, ${logEntry.payload || null}, ${logEntry.timestamp}, ${logEntry.resolved})
      `;
        }
        catch {
            // Table might not exist, which is fine - we'll use in-memory storage
        }
    }
    /**
     * Get all unresolved webhook errors for manual review
     */
    static async getUnresolvedErrors() {
        // Try to get from database first
        try {
            const dbLogs = await db_1.prisma.$queryRaw `
        SELECT * FROM webhook_error_logs WHERE resolved = false ORDER BY timestamp DESC LIMIT 100
      `;
            if (dbLogs && dbLogs.length > 0) {
                return dbLogs.map((log) => ({
                    id: log.id,
                    eventId: log.eventId,
                    eventType: log.eventType,
                    error: log.error,
                    errorCode: log.errorCode || undefined,
                    payload: log.payload || undefined,
                    timestamp: log.timestamp,
                    resolved: log.resolved,
                    resolvedAt: log.resolvedAt || undefined,
                    resolvedBy: log.resolvedBy || undefined,
                    notes: log.notes || undefined,
                }));
            }
        }
        catch {
            // Table might not exist, use in-memory storage
        }
        // Fall back to in-memory storage
        return webhookErrorLogs.filter((log) => !log.resolved);
    }
    /**
     * Get recent webhook errors (both resolved and unresolved)
     */
    static async getRecentErrors(limit = 50) {
        // Try to get from database first
        try {
            const dbLogs = await db_1.prisma.$queryRaw `
        SELECT * FROM webhook_error_logs ORDER BY timestamp DESC LIMIT ${limit}
      `;
            if (dbLogs && dbLogs.length > 0) {
                return dbLogs.map((log) => ({
                    id: log.id,
                    eventId: log.eventId,
                    eventType: log.eventType,
                    error: log.error,
                    errorCode: log.errorCode || undefined,
                    payload: log.payload || undefined,
                    timestamp: log.timestamp,
                    resolved: log.resolved,
                    resolvedAt: log.resolvedAt || undefined,
                    resolvedBy: log.resolvedBy || undefined,
                    notes: log.notes || undefined,
                }));
            }
        }
        catch {
            // Table might not exist, use in-memory storage
        }
        // Fall back to in-memory storage
        return webhookErrorLogs.slice(0, limit);
    }
    /**
     * Mark a webhook error as resolved
     */
    static async resolveError(eventId, resolvedBy, notes) {
        // Try to update in database first
        try {
            await db_1.prisma.$executeRaw `
        UPDATE webhook_error_logs 
        SET resolved = true, resolved_at = NOW(), resolved_by = ${resolvedBy}, notes = ${notes || null}
        WHERE event_id = ${eventId}
      `;
        }
        catch {
            // Table might not exist
        }
        // Also update in-memory storage
        const log = webhookErrorLogs.find((l) => l.eventId === eventId);
        if (log) {
            log.resolved = true;
            log.resolvedAt = new Date();
            log.resolvedBy = resolvedBy;
            log.notes = notes;
            return true;
        }
        return false;
    }
    /**
     * Get error statistics for monitoring
     */
    static async getErrorStats() {
        const logs = await this.getRecentErrors(1000);
        const unresolvedLogs = logs.filter((l) => !l.resolved);
        // Count errors by type
        const errorsByType = {};
        for (const log of logs) {
            errorsByType[log.eventType] = (errorsByType[log.eventType] || 0) + 1;
        }
        // Calculate recent error rate (errors in last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentErrors = logs.filter((l) => l.timestamp > oneHourAgo);
        return {
            totalErrors: logs.length,
            unresolvedErrors: unresolvedLogs.length,
            errorsByType,
            recentErrorRate: recentErrors.length,
        };
    }
    /**
     * Clear all error logs (for testing purposes)
     */
    static clearLogs() {
        webhookErrorLogs.length = 0;
    }
}
exports.WebhookErrorLogger = WebhookErrorLogger;
