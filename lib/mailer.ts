import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  bcc?: string | string[];
}

/**
 * Send an email via the configured SMTP transport.
 * `to` can be a single address or an array of addresses.
 */
export async function sendEmail({ to, subject, html, from, bcc }: SendEmailOptions) {
  const fromAddress =
    from ??
    `"${process.env.SMTP_FROM_NAME || "SoulWealth Studio"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
    ...(bcc ? { bcc } : {}),
  });
}
