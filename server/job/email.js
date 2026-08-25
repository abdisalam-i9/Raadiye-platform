import nodemailer from "nodemailer";
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.EMAIL.EMAIL_USER,
        pass: env.EMAIL.EMAIL_PASS,
    },
});

export const sendEmailVerificationCode = async (email, code) => {
    try {
        const info = await transporter.sendMail({
            from: `"Baafin" <${env.EMAIL.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Email",
            html: `
    <div style="
        max-width: 500px;
        margin: 40px auto;
        padding: 30px;
        background: #ffffff;
        border-radius: 12px;
        font-family: Arial, sans-serif;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    ">
        <h2 style="color: #2563eb; margin-bottom: 10px;">
            Verify Your Email
        </h2>

        <p style="color: #555; font-size: 15px;">
            Use the verification code below to verify your email address.
        </p>

        <div style="
            margin: 25px 0;
            padding: 15px;
            background: #eff6ff;
            border: 1px dashed #2563eb;
            border-radius: 8px;
            color: #2563eb;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 6px;
        ">
            ${code}
        </div>

        <p style="color: #999; font-size: 13px;">
            This code will expire soon.
        </p>

        <p style="color: #aaa; font-size: 12px; margin-top: 25px;">
            If you didn't request this code, you can ignore this email.
        </p>
    </div>
`
        });
        return true;
    } catch (error) {
        console.log("EMAIL ERROR:", error);

        return false;
    }
};


// Send Reset Password Email 
export const sendPasswordResetEmail = async (email,resetLink) => {
    try {
        await transporter.sendMail({
            from: `"Baafin" <${env.EMAIL.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Baafin Password",

            html: `
        <div style="
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          background: #ffffff;
          border-radius: 12px;
          font-family: Arial, sans-serif;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        ">

          <h2 style="
            color: #2563eb;
            margin-bottom: 10px;
          ">
            Reset Your Password
          </h2>

          <p style="
            color: #555;
            font-size: 15px;
          ">
            We received a request to reset your Baafin password.
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              margin: 25px 0;
              padding: 14px 25px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>

          <p style="
            color: #999;
            font-size: 13px;
          ">
            This link will expire in 15 minutes.
          </p>

          <p style="
            color: #aaa;
            font-size: 12px;
            margin-top: 25px;
          ">
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
        });

        return true;

    } catch (error) {

        console.log(
            "PASSWORD RESET EMAIL ERROR:",
            error
        );

        return false;
    }
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export const sendMatchEmail = async ({ to, name, sourceTitle, matchedTitle, link }) => {
    try {
        await transporter.sendMail({
            from: `"Baafiye" <${env.EMAIL.EMAIL_USER}>`,
            to,
            subject: 'Possible match found — Baafiye',
            html: `
        <div style="max-width: 520px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 12px; font-family: Arial, sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
          <h2 style="color: #0f7a62; margin-bottom: 10px;">Possible match found</h2>
          <p style="color: #555; font-size: 15px;">
            Hello ${escapeHtml(name)},
          </p>
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
        return true;
    } catch (error) {
        console.log('MATCH EMAIL ERROR:', error);
        return false;
    }
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
    try {
        await transporter.sendMail({
            from: `"Baafiye Contact" <${env.EMAIL.EMAIL_USER}>`,
            to: env.EMAIL.EMAIL_USER,
            replyTo: email,
            subject: `[Baafiye Contact] ${subject}`,
            html: `
        <div style="max-width: 560px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif;">
          <h2 style="color: #4338ca;">New contact message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            ${message.replace(/\n/g, '<br />')}
          </div>
        </div>
      `,
        });

        return true;
    } catch (error) {
        console.log('CONTACT EMAIL ERROR:', error);
        return false;
    }
};
