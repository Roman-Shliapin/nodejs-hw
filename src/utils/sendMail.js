import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env"
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * @param {object} options
 * @param {string | string[]} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.from] — defaults to SMTP_FROM
 */
export async function sendEmail({ to, subject, text, html, from }) {
  const fromAddress = from ?? process.env.SMTP_FROM;
  if (!fromAddress) {
    throw new Error("Set SMTP_FROM in .env or pass from in sendEmail()");
  }

  if (!text && !html) {
    throw new Error("sendEmail requires text or html");
  }

  const info = await getTransporter().sendMail({
    from: fromAddress,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    text,
    html,
  });

  return info;
}

export const sendMail = sendEmail;
