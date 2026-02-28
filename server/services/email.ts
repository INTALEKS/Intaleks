import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
}

interface ContactNotificationData {
  name: string;
  email: string;
  message: string;
  contactId: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_USER || "noreply@intaleks.com";
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;

    if (!emailUser || !emailPassword) {
      console.warn("⚠️  Email credentials not configured. Email sending will be disabled.");
      console.warn("⚠️  Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email functionality.");
      return;
    }

    try {
      // Use custom SMTP if provided, otherwise use Gmail
      if (smtpHost && smtpPort) {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
          tls: {
            rejectUnauthorized: false, // Allow self-signed certificates in production
          },
        });
        console.log(`✅ Email service initialized with custom SMTP: ${smtpHost}:${smtpPort}`);
      } else {
        // Gmail configuration with longer timeout
        this.transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports like 587
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000,
          socketTimeout: 10000,
        });
        console.log("✅ Email service initialized with Gmail SMTP");
      }
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.transporter = null;
    }
  }

  private getEmailTemplate(content: string): string {
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

  async sendEmail(options: EmailOptions): Promise<boolean> {
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
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
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

  async sendVerificationEmail(email: string, verificationToken: string, name?: string): Promise<boolean> {
    const verifyUrl = `${this.frontendUrl}/auth/verify-email/confirm?token=${verificationToken}`;
    const displayName = name || "there";

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

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
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

  async sendContactNotificationToAdmin(data: ContactNotificationData): Promise<boolean> {
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

  async sendContactConfirmationToUser(name: string, email: string): Promise<boolean> {
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

  isConfigured(): boolean {
    return this.transporter !== null;
  }
}

export default new EmailService();
