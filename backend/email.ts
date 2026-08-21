import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { log } from "./index.js";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "singhcakedelight1981.official@gmail.com";

const auditLogPath = path.resolve(process.cwd(), "sent_emails.log");

export async function sendEmailNotification(to: string, subject: string, html: string): Promise<void> {
  const isSmtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `Singh Cake Delight <${EMAIL_FROM}>`,
        to,
        subject,
        html,
      });

      log(`Email sent successfully to ${to}: "${subject}"`, "email");
    } catch (err) {
      console.error("Failed to send email via SMTP, falling back to local file logging:", err);
      await logEmailToAuditFile(to, subject, html);
    }
  } else {
    // Fallback to local file logging (useful for development & local environments)
    await logEmailToAuditFile(to, subject, html);
  }
}

async function logEmailToAuditFile(to: string, subject: string, html: string): Promise<void> {
  const dateObj = new Date();
  const datePart = dateObj.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const timePart = dateObj.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const timestamp = `${datePart.replace(/-/g, "/")}, ${timePart.toLowerCase()}`;
  const rawText = html.replace(/<[^>]*>/g, ""); // Strip HTML tags for clean text reading
  
  const emailLogEntry = `
========================================
[EMAIL SEND EVENT]
Timestamp: ${timestamp}
From: ${EMAIL_FROM}
To: ${to}
Subject: ${subject}
----------------------------------------
HTML Body:
${html}
----------------------------------------
Text Content:
${rawText}
========================================
`;

  try {
    await fs.promises.appendFile(auditLogPath, emailLogEntry, "utf8");
    log(`[MOCK EMAIL] Saved email log to sent_emails.log for "${subject}" to ${to}`, "email");
  } catch (err) {
    console.error("Failed to write to sent_emails.log:", err);
  }
}
