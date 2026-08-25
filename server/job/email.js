import nodemailer from 'nodemailer';
import env from '../config/env.js';

export function isEmailConfigured() {
  return Boolean(env.EMAIL.EMAIL_USER && env.EMAIL.EMAIL_PASS);
}

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (transporter) return transporter;

  if (env.EMAIL.HOST) {
    const port = Number(env.EMAIL.PORT) || 587;
    transporter = nodemailer.createTransport({
      host: env.EMAIL.HOST,
      port,
      secure: port === 465,
      auth: {
        user: env.EMAIL.EMAIL_USER,
        pass: env.EMAIL.EMAIL_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL.EMAIL_USER,
        pass: env.EMAIL.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendMail(options) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log('[Raadiye] Email skipped (EMAIL_USER / EMAIL_PASS not set).');
    return { sent: false, configured: false };
  }

  try {
    await mailer.sendMail({
      from: `"Raadiye" <${env.EMAIL.EMAIL_USER}>`,
      ...options,
    });
    return { sent: true, configured: true };
  } catch (error) {
    console.log('[Raadiye] EMAIL ERROR:', error.message || error);
    return { sent: false, configured: true };
  }
}

export const sendEmailVerificationCode = async (email, code) => {
  if (!isEmailConfigured()) {
    console.log(`[Raadiye] EMAIL_USER/PASS missing. Verification code for ${email}: ${code}`);
    return { sent: false, configured: false };
  }

  const result = await sendMail({
    to: email,
    subject: 'Verify your Raadiye email',
    html: `
    <div style="max-width: 500px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 12px; font-family: Arial, sans-serif; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <h2 style="color: #0f7a62; margin-bottom: 10px;">Verify your email</h2>
      <p style="color: #555; font-size: 15px;">
        Use this code to open your Raadiye account.
      </p>
      <div style="margin: 25px 0; padding: 15px; background: #ecf8f4; border: 1px dashed #0f7a62; border-radius: 8px; color: #0f7a62; font-size: 30px; font-weight: bold; letter-spacing: 6px;">
        ${escapeHtml(code)}
      </div>
      <p style="color: #999; font-size: 13px;">This code expires in 15 minutes.</p>
      <p style="color: #aaa; font-size: 12px; margin-top: 25px;">
        If you did not create an account, you can ignore this email.
      </p>
    </div>
    `,
  });

  if (!result.sent) {
    console.log(`[Raadiye] Could not send verification email to ${email}. Code: ${code}`);
  }

  return result;
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  if (!isEmailConfigured()) {
    console.log(`[Raadiye] EMAIL_USER/PASS missing. Password reset link for ${email}: ${resetLink}`);
    return { sent: false, configured: false };
  }

  const result = await sendMail({
    to: email,
    subject: 'Reset your Raadiye password',
    html: `
      <div style="max-width: 500px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 12px; font-family: Arial, sans-serif; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #0f7a62; margin-bottom: 10px;">Reset your password</h2>
        <p style="color: #555; font-size: 15px;">
          We received a request to reset your Raadiye password.
        </p>
        <a href="${escapeHtml(resetLink)}" style="display: inline-block; margin: 25px 0; padding: 14px 25px; background: #0f7a62; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Reset password
        </a>
        <p style="color: #999; font-size: 13px;">This link expires in 15 minutes.</p>
        <p style="color: #aaa; font-size: 12px; margin-top: 25px;">
          If you did not ask for this, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (!result.sent) {
    console.log(`[Raadiye] Could not send password reset email to ${email}. Link: ${resetLink}`);
  }

  return result;
};

export const sendMatchEmail = async ({ to, name, sourceTitle, matchedTitle, link }) => {
  const result = await sendMail({
    to,
    subject: 'Possible match found — Raadiye',
    html: `
      <div style="max-width: 520px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 12px; font-family: Arial, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <h2 style="color: #0f7a62; margin-bottom: 10px;">Possible match found</h2>
        <p style="color: #555; font-size: 15px;">Hello ${escapeHtml(name)},</p>
        <p style="color: #555; font-size: 15px;">
          Your item <strong>${escapeHtml(sourceTitle)}</strong> looks similar to
          <strong>${escapeHtml(matchedTitle)}</strong>.
        </p>
        <a href="${escapeHtml(link)}" style="display: inline-block; margin: 22px 0; padding: 12px 22px; background: #0f7a62; color: white; text-decoration: none; border-radius: 999px; font-weight: bold;">
          View the item
        </a>
        <p style="color: #999; font-size: 13px;">
          Confirm it is the right item before you share extra details or meet.
        </p>
      </div>
    `,
  });
  return result.sent;
};

export const sendMessageEmail = async ({ to, name, senderName, preview, itemTitle, link }) => {
  const result = await sendMail({
    to,
    subject: 'New message — Raadiye',
    html: `
      <div style="max-width: 520px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 12px; font-family: Arial, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <h2 style="color: #0f7a62; margin-bottom: 10px;">New message</h2>
        <p style="color: #555; font-size: 15px;">Hello ${escapeHtml(name)},</p>
        <p style="color: #555; font-size: 15px;">
          <strong>${escapeHtml(senderName || 'Someone')}</strong> sent you a message
          ${itemTitle ? `about <strong>${escapeHtml(itemTitle)}</strong>` : ''}.
        </p>
        <p style="color: #333; font-size: 15px; padding: 12px 14px; background: #f4f7f6; border-radius: 10px;">
          ${escapeHtml(preview)}
        </p>
        <a href="${escapeHtml(link)}" style="display: inline-block; margin: 22px 0; padding: 12px 22px; background: #0f7a62; color: white; text-decoration: none; border-radius: 999px; font-weight: bold;">
          Open the chat
        </a>
      </div>
    `,
  });
  return result.sent;
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!isEmailConfigured()) {
    console.log('[Raadiye] Contact form skipped (EMAIL_USER / EMAIL_PASS not set).');
    return false;
  }

  const result = await sendMail({
    to: env.EMAIL.EMAIL_USER,
    replyTo: email,
    subject: `[Raadiye Contact] ${subject}`,
    html: `
      <div style="max-width: 560px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif;">
        <h2 style="color: #0f7a62;">New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
          ${escapeHtml(message).replace(/\n/g, '<br />')}
        </div>
      </div>
    `,
  });
  return result.sent;
};
