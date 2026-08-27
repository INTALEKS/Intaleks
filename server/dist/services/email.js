"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
class EmailService {
    transporter = null;
    resend = null;
    fromEmail;
    frontendUrl;
    useResend = false;
    constructor() {
        this.fromEmail = process.env.EMAIL_USER || "noreply@intaleks.com";
        this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        this.initializeEmailService();
    }
    initializeEmailService() {
        const resendApiKey = process.env.RESEND_API_KEY;
        // Prefer Resend if API key is available
        if (resendApiKey) {
            try {
                this.resend = new resend_1.Resend(resendApiKey);
                this.useResend = true;
                // For Resend, use a verified domain email or onboarding@resend.dev for testing
                this.fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
                console.log("✅ Email service initialized with Resend");
                return;
            }
            catch (error) {
                console.error("❌ Failed to initialize Resend:", error);
                this.resend = null;
            }
        }
        // Fallback to SMTP (Gmail or custom)
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        if (!emailUser || !emailPassword) {
            console.warn("⚠️  Email credentials not configured. Email sending will be disabled.");
            console.warn("⚠️  Set RESEND_API_KEY or EMAIL_USER and EMAIL_PASSWORD in .env to enable email functionality.");
            return;
        }
        try {
            // Use custom SMTP if provided, otherwise use Gmail
            if (smtpHost && smtpPort) {
                this.transporter = nodemailer_1.default.createTransport({
                    host: smtpHost,
                    port: parseInt(smtpPort),
                    secure: parseInt(smtpPort) === 465,
                    auth: {
                        user: emailUser,
                        pass: emailPassword,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });
                console.log(`✅ Email service initialized with custom SMTP: ${smtpHost}:${smtpPort}`);
            }
            else {
                this.transporter = nodemailer_1.default.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: emailUser,
                        pass: emailPassword,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                    connectionTimeout: 30000,
                    greetingTimeout: 30000,
                    socketTimeout: 30000,
                });
                console.log("✅ Email service initialized with Gmail SMTP (SSL port 465)");
            }
        }
        catch (error) {
            console.error("❌ Failed to initialize email service:", error);
            this.transporter = null;
        }
    }
    getEmailTemplate(content) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Intaleks</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #3b82f6; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Intaleks</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      ${content}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                        Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Trading as Intaleks
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    }
    async sendEmail(options) {
        // Use Resend if available
        if (this.useResend && this.resend) {
            try {
                const { data, error } = await this.resend.emails.send({
                    from: `Intaleks <${this.fromEmail}>`,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                });
                if (error) {
                    console.error("❌ Resend error:", error);
                    return false;
                }
                console.log("✅ Email sent successfully via Resend:", data?.id);
                return true;
            }
            catch (error) {
                console.error("❌ Failed to send email via Resend:", error);
                if (error instanceof Error) {
                    console.error("Error details:", {
                        message: error.message,
                        name: error.name,
                    });
                }
                return false;
            }
        }
        // Fallback to SMTP
        if (!this.transporter) {
            console.error("Email service not configured. Cannot send email.");
            return false;
        }
        try {
            const info = await this.transporter.sendMail({
                from: `"Intaleks" <${this.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            console.log("✅ Email sent successfully via SMTP:", info.messageId);
            return true;
        }
        catch (error) {
            console.error("❌ Failed to send email via SMTP:", error);
            if (error instanceof Error) {
                console.error("Error details:", {
                    message: error.message,
                    name: error.name,
                });
            }
            return false;
        }
    }
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Reset Your Password</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        We received a request to reset your password for your Intaleks account. Click the button below to create a new password.
      </p>
      
      <!-- Button -->
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="border-radius: 6px; background-color: #3b82f6;">
            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
        ${resetUrl}
      </p>
      
      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          <strong>This link will expire in 1 hour.</strong>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;
        const text = `
Reset Your Password

We received a request to reset your password for your Intaleks account.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
Trading as Intaleks
    `.trim();
        return this.sendEmail({
            to: email,
            subject: "Reset Your Password - Intaleks",
            html: this.getEmailTemplate(content),
            text,
        });
    }
    async sendVerificationEmail(email, verificationToken, firstName, lastName) {
        const verifyUrl = `${this.frontendUrl}/auth/verify-email/confirm?token=${verificationToken}`;
        const displayName = firstName ? `${firstName}${lastName ? " " + lastName : ""}` : "there";
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Verify Your Email Address</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Hi ${displayName},
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Thank you for signing up with Intaleks! To complete your registration and access all features, please verify your email address by clicking the button below.
      </p>
      
      <!-- Button -->
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="border-radius: 6px; background-color: #3b82f6;">
            <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
              Verify Email Address
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
        ${verifyUrl}
      </p>
      
      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          <strong>This link will expire in 24 hours.</strong>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
          If you didn't create an account with Intaleks, you can safely ignore this email.
        </p>
      </div>
    `;
        const text = `
Verify Your Email Address

Hi ${displayName},

Thank you for signing up with Intaleks! To complete your registration and access all features, please verify your email address.

Click the link below to verify your email:
${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account with Intaleks, you can safely ignore this email.

---
Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
Trading as Intaleks
    `.trim();
        return this.sendEmail({
            to: email,
            subject: "Verify Your Email - Intaleks",
            html: this.getEmailTemplate(content),
            text,
        });
    }
    async sendWelcomeEmail(data) {
        const { firstName, lastName, name, email } = data;
        const displayName = firstName ? `${firstName}${lastName ? " " + lastName : ""}` : name || "there";
        const loginUrl = `${this.frontendUrl}/login`;
        const calculatorUrl = `${this.frontendUrl}/calculator`;
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Welcome to Intaleks!</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Hi ${displayName},
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Thank you for joining Intaleks! We're excited to help you with your business valuation needs.
      </p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">Getting Started</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          <li>Access our business valuation calculator</li>
          <li>View educational videos and resources</li>
          <li>Join our community forum</li>
          <li>Attend upcoming events and webinars</li>
        </ul>
      </div>
      
      <!-- Button -->
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="border-radius: 6px; background-color: #3b82f6;">
            <a href="${calculatorUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
              Start Valuation
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        If you have any questions, feel free to reach out to us at <a href="mailto:admin@intaleks.com" style="color: #3b82f6; text-decoration: none;">admin@intaleks.com</a>
      </p>
    `;
        const text = `
Welcome to Intaleks!

Hi ${displayName},

Thank you for joining Intaleks! We're excited to help you with your business valuation needs.

Getting Started:
- Access our business valuation calculator
- View educational videos and resources
- Join our community forum
- Attend upcoming events and webinars

Start your first valuation: ${calculatorUrl}

If you have any questions, feel free to reach out to us at admin@intaleks.com

---
Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
Trading as Intaleks
    `.trim();
        return this.sendEmail({
            to: email,
            subject: "Welcome to Intaleks - Let's Get Started!",
            html: this.getEmailTemplate(content),
            text,
        });
    }
    async sendPartnerInvitationEmail(email, firmName, inviteUrl) {
        const content = `<h2>You've been invited to ${firmName}</h2><p>Your firm has invited you to join its Intaleks Partner Program workspace. Use your own Intaleks login to create valuations for clients.</p><p><a href="${inviteUrl}" style="display:inline-block;padding:14px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Accept invitation</a></p><p>This invitation expires in 14 days.</p>`;
        return this.sendEmail({ to: email, subject: `Join ${firmName} on Intaleks`, html: this.getEmailTemplate(content), text: `Join ${firmName} on Intaleks: ${inviteUrl}` });
    }
    async sendPartnerRenewalReminderEmail(email, firmName, accessEndsAt) {
        const renewalUrl = `${this.frontendUrl}/settings?tab=referrals`;
        const content = `<h2>Your Partner access is ending soon</h2><p>${firmName}'s current Partner access ends on ${accessEndsAt.toLocaleDateString("en-AU")}. Renew or upgrade before it ends to keep your advisers working.</p><p><a href="${renewalUrl}" style="display:inline-block;padding:14px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Manage Partner access</a></p>`;
        return this.sendEmail({ to: email, subject: `${firmName}: renew Partner access`, html: this.getEmailTemplate(content), text: `${firmName}'s Partner access ends soon. Renew: ${renewalUrl}` });
    }
    async sendContactNotificationToAdmin(data) {
        const { name, email, message, contactId } = data;
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
        if (!adminEmail) {
            console.warn("No admin email configured for contact notifications");
            return false;
        }
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">New Contact Message</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        You have received a new contact message from your website.
      </p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
        <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px;">
          <strong>From:</strong> ${name}
        </p>
        <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px;">
          <strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
        </p>
        <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px;">
          <strong>Message ID:</strong> ${contactId}
        </p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Message:
          </p>
          <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${message}
          </p>
        </div>
      </div>
      
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        Reply directly to <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a> to respond to this message.
      </p>
    `;
        const text = `
New Contact Message

From: ${name}
Email: ${email}
Message ID: ${contactId}

Message:
${message}

---
Reply directly to ${email} to respond to this message.

Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
Trading as Intaleks
    `.trim();
        return this.sendEmail({
            to: adminEmail,
            subject: `New Contact Message from ${name}`,
            html: this.getEmailTemplate(content),
            text,
        });
    }
    async sendContactConfirmationToUser(name, email) {
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Message Received</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Thank you for contacting Intaleks. We have received your message and will get back to you as soon as possible.
      </p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
          Our team typically responds within 24-48 hours during business days.
        </p>
      </div>
      
      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        In the meantime, feel free to explore our <a href="${this.frontendUrl}/videos" style="color: #3b82f6; text-decoration: none;">educational resources</a> or try our <a href="${this.frontendUrl}/calculator" style="color: #3b82f6; text-decoration: none;">valuation calculator</a>.
      </p>
    `;
        const text = `
Message Received

Hi ${name},

Thank you for contacting Intaleks. We have received your message and will get back to you as soon as possible.

Our team typically responds within 24-48 hours during business days.

In the meantime, feel free to explore our educational resources or try our valuation calculator at ${this.frontendUrl}

---
Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)
Trading as Intaleks
    `.trim();
        return this.sendEmail({
            to: email,
            subject: "We've Received Your Message - Intaleks",
            html: this.getEmailTemplate(content),
            text,
        });
    }
    async sendReferralNotificationToProfessional(professionalEmail, professionalName, clientEmail, clientName) {
        const content = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">New Client Registered!</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        Hi ${professionalName},
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        We are pleased to inform you that a client has registered and subscribed to a plan using your professional referral link/code.
      </p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 16px;">Client Details</h4>
        <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">
          <strong>Name:</strong> ${clientName}<br>
          <strong>Email:</strong> ${clientEmail}
        </p>
      </div>

      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
        As their referring advisor, you now have access to view their inputs and download their valuation reports directly from your dashboard.
      </p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${this.frontendUrl}/settings?tab=referrals" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Go to Referral Dashboard
        </a>
      </div>

      <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        Thank you for partnering with Intaleks!
      </p>
    `;
        const text = `
New Client Registered!

Hi ${professionalName},

We are pleased to inform you that a client has registered and subscribed to a plan using your professional referral link/code.

Client Details:
- Name: ${clientName}
- Email: ${clientEmail}

As their referring advisor, you now have access to view their inputs and download their valuation reports directly from your dashboard.

Access your Referral Dashboard here: ${this.frontendUrl}/settings?tab=referrals

Thank you for partnering with Intaleks!
    `.trim();
        return this.sendEmail({
            to: professionalEmail,
            subject: "New Client Onboarded via Your Referral Code - Intaleks",
            html: this.getEmailTemplate(content),
            text,
        });
    }
    isConfigured() {
        return this.useResend ? this.resend !== null : this.transporter !== null;
    }
    async sendInvoiceEmail(data) {
        const { email, firstName, lastName, invoiceNumber, amount, currency, planName, billingPeriod, paidAt, stripeInvoiceId, paymentMethod, nextRenewal, status = "success", failureReason } = data;
        const displayName = firstName ? `${firstName}${lastName ? " " + lastName : ""}` : "there";
        const isSuccess = status === "success";
        // Format currency: AUD → A$, USD → $, etc.
        const currencyUpper = currency.toUpperCase();
        const currencyPrefix = currencyUpper === "AUD" ? "A$" : currencyUpper === "USD" ? "$" : `${currencyUpper} `;
        const formattedAmount = `${currencyPrefix}${(amount / 100).toFixed(2)}`;
        const formattedDate = paidAt.toLocaleDateString("en-AU", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const formattedNextRenewal = nextRenewal ? nextRenewal.toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" }) : null;
        const billingLabel = billingPeriod === "YEARLY" ? "Annual plan" : billingPeriod === "MONTHLY" ? "Monthly plan" : "One-time";
        // Receipt number: RCPT-YYYY-NNNNN derived from invoice number
        const receiptNumber = invoiceNumber.replace("INV-", "RCPT-");
        const statusIcon = isSuccess
            ? `<div style="width:56px;height:56px;border-radius:50%;background:#dcfce7;margin:0 auto 16px auto;text-align:center;line-height:56px;">
           <div style="width:40px;height:40px;border-radius:50%;background:#22c55e;display:inline-block;vertical-align:middle;line-height:40px;text-align:center;">
             <span style="color:#fff;font-size:20px;line-height:40px;">✓</span>
           </div>
         </div>`
            : `<div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;margin:0 auto 16px auto;text-align:center;line-height:56px;">
           <div style="width:40px;height:40px;border-radius:50%;background:#ef4444;display:inline-block;vertical-align:middle;line-height:40px;text-align:center;">
             <span style="color:#fff;font-size:20px;line-height:40px;">✕</span>
           </div>
         </div>`;
        const statusTitle = isSuccess ? "Payment Successful" : "Payment Failed";
        const statusSubtitle = isSuccess ? `Hi ${firstName || displayName} — your subscription payment was received.<br>Here is your payment confirmation for your records.` : `Hi ${firstName || displayName} — we were unable to process your payment.<br>${failureReason || "Please update your payment method to continue your subscription."}`;
        const amountBanner = isSuccess
            ? `<table role="presentation" style="width:100%;margin:24px 0;border-collapse:collapse;">
           <tr>
             <td style="width:8px;background:linear-gradient(180deg,#2563eb,#1d4ed8);border-radius:10px 0 0 10px;">&nbsp;</td>
             <td style="background:#0f172a;border-radius:0 10px 10px 0;padding:18px 24px;">
               <table role="presentation" style="width:100%;border-collapse:collapse;">
                 <tr>
                   <td style="vertical-align:middle;">
                     <span style="color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${formattedAmount}</span>
                   </td>
                   <td style="text-align:right;vertical-align:middle;">
                     <span style="display:inline-block;border:1.5px solid #22c55e;color:#22c55e;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:6px;">PAID</span>
                   </td>
                 </tr>
               </table>
             </td>
           </tr>
         </table>`
            : `<table role="presentation" style="width:100%;margin:24px 0;border-collapse:collapse;">
           <tr>
             <td style="width:8px;background:linear-gradient(180deg,#ef4444,#dc2626);border-radius:10px 0 0 10px;">&nbsp;</td>
             <td style="background:#0f172a;border-radius:0 10px 10px 0;padding:18px 24px;">
               <table role="presentation" style="width:100%;border-collapse:collapse;">
                 <tr>
                   <td style="vertical-align:middle;">
                     <span style="color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${formattedAmount}</span>
                   </td>
                   <td style="text-align:right;vertical-align:middle;">
                     <span style="display:inline-block;border:1.5px solid #ef4444;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:6px;">FAILED</span>
                   </td>
                 </tr>
               </table>
             </td>
           </tr>
         </table>`;
        const lineItems = `
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px dashed #e5e7eb;">
            <div style="font-size:14px;font-weight:700;color:#111827;">${planName}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">Full platform access · intaleks.com</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px dashed #e5e7eb;text-align:right;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#111827;">${formattedAmount}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">${billingLabel}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9ca3af;font-size:13px;">GST included (0%)</td>
          <td style="padding:10px 0;color:#9ca3af;font-size:13px;text-align:right;">${currencyPrefix}0.00</td>
        </tr>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:12px 0;font-size:15px;font-weight:700;color:#111827;">Total charged</td>
          <td style="padding:12px 0;font-size:15px;font-weight:700;color:#111827;text-align:right;">${formattedAmount}</td>
        </tr>
      </table>`;
        const transactionRows = [{ label: "Date", value: formattedDate }, { label: "Receipt number", value: receiptNumber }, ...(paymentMethod ? [{ label: "Payment method", value: paymentMethod }] : []), { label: "Customer", value: `${firstName || ""}${lastName ? " " + lastName : ""}`.trim() || displayName }, { label: "Email", value: email }, ...(formattedNextRenewal && isSuccess ? [{ label: "Next renewal", value: formattedNextRenewal }] : [])];
        const transactionTable = `
      <div style="margin:24px 0;">
        <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">TRANSACTION DETAILS</div>
        <table role="presentation" style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
          ${transactionRows
            .map((row, i) => `
          <tr style="border-bottom:${i < transactionRows.length - 1 ? "1px solid #e5e7eb" : "none"};">
            <td style="padding:10px 14px;font-size:13px;color:#6b7280;">${row.label}</td>
            <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#111827;text-align:right;">${row.value}</td>
          </tr>`)
            .join("")}
        </table>
      </div>`;
        const thankYouBox = isSuccess
            ? `<table role="presentation" style="width:100%;margin:24px 0;">
           <tr>
             <td style="width:4px;background:#2563eb;border-radius:4px 0 0 4px;">&nbsp;</td>
             <td style="background:#eff6ff;padding:14px 16px;border-radius:0 8px 8px 0;">
               <div style="font-size:14px;font-weight:700;color:#1e3a5f;">Thank you for choosing Intaleks Pty Ltd.</div>
               <div style="font-size:13px;color:#374151;margin-top:4px;">Sign in at intaleks.com to start your business valuation.</div>
             </td>
           </tr>
         </table>`
            : `<table role="presentation" style="width:100%;margin:24px 0;">
           <tr>
             <td style="width:4px;background:#ef4444;border-radius:4px 0 0 4px;">&nbsp;</td>
             <td style="background:#fef2f2;padding:14px 16px;border-radius:0 8px 8px 0;">
               <div style="font-size:14px;font-weight:700;color:#7f1d1d;">Action required</div>
               <div style="font-size:13px;color:#374151;margin-top:4px;">Please update your payment method at <a href="${this.frontendUrl}/settings" style="color:#2563eb;text-decoration:none;">intaleks.com</a> to restore access.</div>
             </td>
           </tr>
         </table>`;
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle} - Intaleks</title>
</head>
<body style="margin:0;padding:0;background:#e8eef7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" style="width:100%;max-width:560px;border-collapse:collapse;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:5px;background:linear-gradient(90deg,#1d4ed8,#2563eb,#60a5fa);border-radius:8px 8px 0 0;"></td>
          </tr>

          <!-- Header: logo + receipt label -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px 16px 32px;">
              <table role="presentation" style="width:100%;">
                <tr>
                  <td>
                    <div style="font-size:26px;font-weight:900;color:#111827;letter-spacing:-1px;">
                      <span style="color:#111827;">intal</span><span style="color:#2563eb;">e</span><span style="color:#111827;">ks</span>
                    </div>
                    <div style="font-size:11px;color:#9ca3af;margin-top:2px;">Professional Business Valuation Calculator</div>
                  </td>
                  <td style="text-align:right;vertical-align:top;">
                    <div style="font-size:15px;font-weight:700;color:#111827;">Payment Receipt</div>
                    <div style="font-size:12px;color:#6b7280;margin-top:2px;">${receiptNumber}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 32px 32px;">
              <table role="presentation" style="width:100%;border:1px solid #e5e7eb;border-radius:12px;border-collapse:collapse;">
                <tr>
                  <td style="padding:28px 24px;">

                    <!-- Status icon + title -->
                    <div style="text-align:center;margin-bottom:8px;">
                      ${statusIcon}
                      <div style="font-size:22px;font-weight:800;color:#111827;margin-bottom:8px;">${statusTitle}</div>
                      <div style="font-size:13px;color:#6b7280;line-height:1.6;">${statusSubtitle}</div>
                    </div>

                    <!-- Amount banner -->
                    ${amountBanner}

                    <!-- Line items -->
                    ${lineItems}

                    <!-- Transaction details -->
                    ${transactionTable}

                    <!-- Thank you / action box -->
                    ${thankYouBox}

                    <!-- Inner footer -->
                    <div style="border-top:1px solid #e5e7eb;padding-top:16px;text-align:center;">
                      <div style="font-size:12px;color:#9ca3af;">
                        Intaleks Pty Ltd · info@intaleks.com · www.intaleks.com · Australia
                      </div>
                      <div style="font-size:11px;color:#9ca3af;margin-top:4px;">
                        Secured &amp; processed by <span style="color:#635bff;font-weight:700;">Stripe</span>
                      </div>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Outer footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;">
              <div style="font-size:12px;color:#94a3b8;">
                Intaleks Pty Ltd · info@intaleks.com · www.intaleks.com · Australia
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
        const text = `${statusTitle}

Hi ${displayName},
${isSuccess ? `Your subscription payment of ${formattedAmount} was received.` : `We were unable to process your payment of ${formattedAmount}.`}

Receipt: ${receiptNumber}
Date: ${formattedDate}
Plan: ${planName} (${billingLabel})
Amount: ${formattedAmount}
${paymentMethod ? `Payment method: ${paymentMethod}\n` : ""}${formattedNextRenewal && isSuccess ? `Next renewal: ${formattedNextRenewal}\n` : ""}
${isSuccess ? `Sign in at ${this.frontendUrl} to start your business valuation.` : `Update your payment method at ${this.frontendUrl}/settings`}

---
Intaleks Pty Ltd · info@intaleks.com · www.intaleks.com · Australia
Perth Business Evaluators Pty Ltd (ABN: 51 622 231 832)`.trim();
        const subject = isSuccess ? `Payment Receipt – ${receiptNumber}` : `Payment Failed – Action Required`;
        return this.sendEmail({ to: email, subject, html, text });
    }
}
exports.default = new EmailService();
exports.emailService = new EmailService();
