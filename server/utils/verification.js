import VerificationCode from '../model/VerificationCode.js';
import { GenerateVerificationCode } from './GenerateCode.js';
import { sendEmailVerificationCode } from '../job/email.js';

export const CODE_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeCode(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

export function isDevEnv() {
  return process.env.NODE_ENV !== 'production';
}

export async function issueVerificationCode(user) {
  const code = GenerateVerificationCode();
  await VerificationCode.deleteMany({ userId: user._id });
  await VerificationCode.create({
    userId: user._id,
    code,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  const emailResult = await sendEmailVerificationCode(user.email, code);
  return {
    code,
    emailSent: Boolean(emailResult.sent),
    configured: Boolean(emailResult.configured),
  };
}

export function verificationResponseExtras(issued) {
  if (isDevEnv() && !issued.emailSent) {
    return { devCode: issued.code };
  }
  return {};
}
