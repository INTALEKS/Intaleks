"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter = null;
    fromEmail;
    frontendUrl;
    constructor() {
        this.fromEmail = process.env.EMAIL_USER || "noreply@intaleks.com";
        this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;
        if (!emailUser || !emailPassword) {
            console.warn("⚠️  Email credentials not configured. Email sending will be disabled.");
            console.warn("⚠️  Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email functionality.");
            return;
        }
        try {
            this.transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: emailUser,
                    pass: emailPassword,
                },
            });
            console.log("✅ Email service initialized successfully");
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
            console.log("✅ Email sent successfully:", info.messageId);
            return true;
        }
        catch (error) {
            console.error("❌ Failed to send email:", error);
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
    async sendWelcomeEmail(data) {
        const { name, email } = data;
        const displayName = name || "there";
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
    isConfigured() {
        return this.transporter !== null;
    }
}
exports.default = new EmailService();
