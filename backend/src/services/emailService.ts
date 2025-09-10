import nodemailer from "nodemailer";
import { env } from "../config/env";

// Email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("📧 Email service not configured, skipping email:", options.to);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"StadiPass" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

// Email templates
export function getPasswordResetTemplate(resetUrl: string, firstName: string): EmailOptions {
  return {
    to: "", // Will be set by caller
    subject: "Reset your StadiPass password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0;">StadiPass</h1>
            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Stadium Entrance Ticketing System</p>
          </div>
          
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password for your StadiPass account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
          
          <p><strong>This link will expire in 15 minutes for security reasons.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #7f8c8d; font-size: 14px;">
            This email was sent from StadiPass. If you have any questions, please contact our support team.
          </p>
        </body>
      </html>
    `,
    text: `
      Hi ${firstName},
      
      We received a request to reset your password for your StadiPass account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 15 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The StadiPass Team
    `
  };
}

export function getEmailVerificationTemplate(verifyUrl: string, firstName: string): EmailOptions {
  return {
    to: "", // Will be set by caller
    subject: "Verify your StadiPass email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0;">StadiPass</h1>
            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Stadium Entrance Ticketing System</p>
          </div>
          
          <h2 style="color: #2c3e50;">Welcome to StadiPass!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up for StadiPass. To complete your registration, please verify your email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${verifyUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with StadiPass, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #7f8c8d; font-size: 14px;">
            This email was sent from StadiPass. If you have any questions, please contact our support team.
          </p>
        </body>
      </html>
    `,
    text: `
      Hi ${firstName},
      
      Welcome to StadiPass! Thank you for signing up.
      
      To complete your registration, please verify your email address by clicking this link: ${verifyUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with StadiPass, please ignore this email.
      
      Best regards,
      The StadiPass Team
    `
  };
}
