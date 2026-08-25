import rateLimit from "express-rate-limit";

// Register Limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 registration attempts

  message: {
    status: false,
    message: "Too many registration attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


// Login Limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 10, // Maximum 10 requests

  message: {
    status: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


// Forgot PAssword Limiter 

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 requests

  message: {
    status: false,
    message: "Too many password reset requests. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


// Email Verification Limiter
export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 attempts

  message: {
    status: false,
    message: "Too many verification attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


// reset Password Limitor
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 attempts

  message: {
    status: false,
    message: "Too many password reset attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});



// Post Item Limiter
export const createItemLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Maximum 20 requests

  message: {
    status: false,
    message: "Too many item posting attempts. Please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


// Resend Email Verification Code Limiter
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 resend requests

  message: {
    status: false,
    message: 'Too many verification code requests. Please try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form limiter
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,

  message: {
    status: false,
    message: 'Too many contact requests. Please try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});