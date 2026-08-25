import User from "../model/UserModel.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import VerificationCode from "../model/VerificationCode.js";
import {
  issueVerificationCode,
  normalizeCode,
  normalizeEmail,
  verificationResponseExtras,
} from "../utils/verification.js";

// related to Forgot Password
import { GenerateResetToken } from "../utils/GenerateResetToken.js";
import PasswordResetToken from "../model/PasswordResetToken.js";
import { sendPasswordResetEmail } from "../job/email.js";
// Limiter
import { loginLimiter, forgotPasswordLimiter, verifyEmailLimiter, resetPasswordLimiter, registerLimiter, resendVerificationLimiter } from "../middleware/rateLimiter.js";
import env from "../config/env.js";


const userRouter = express.Router();

function authPayload(user) {
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    env.JWT.SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio || '',
      avatar: user.avatar || '',
      district: user.district || '',
    },
  };
}

// ============
// REGISTER  
// =============

userRouter.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: false,
        message: "Name, email, password and phone are required",
      });
    }

    // Clean input
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Validate name
    if (cleanName.length < 3) {
      return res.status(400).json({
        status: false,
        message: "Name must be at least 3 characters",
      });
    }

    // Validate email
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return res.status(400).json({
        status: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate phone
    if (cleanPhone.length < 9) {
      return res.status(400).json({
        status: false,
        message: "Please provide a valid phone number",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      if (!existingUser.isVerified && existingUser.isActive) {
        existingUser.isVerified = true;
        await existingUser.save();
      }

      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role: "user",
      isVerified: true,
      isActive: true,
    });

    return res.status(201).json({
      status: true,
      message: "Registration successful",
      ...authPayload(newUser),
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }

    console.error("Error registering user:", error);

    return res.status(500).json({
      status: false,
      message: "Something went wrong while registering your account",
    });
  }
});

// ============
// VERIFY EMAIL
// =============

userRouter.post("/verify", verifyEmailLimiter, async (req, res) => {
  try {
    const { code, email } = req.body;

    // Check if email and code were provided
    if (!email || !code) {
      return res.status(400).json({
        status: false,
        message: "Email and verification code are required",
      });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanCode = normalizeCode(code);

    if (cleanCode.length !== 6) {
      return res.status(400).json({
        status: false,
        message: "Enter the 6-digit verification code",
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "No account found for this email",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        status: true,
        alreadyVerified: true,
        message: "Email verified successfully",
      });
    }

    const verification = await VerificationCode.findOne({
      userId: user._id,
    }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(400).json({
        status: false,
        message: "Verification code not found. Please request a new one.",
      });
    }

    if (verification.expiresAt < new Date()) {
      await VerificationCode.deleteMany({ userId: user._id });

      return res.status(400).json({
        status: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    if (String(verification.code) !== cleanCode) {
      return res.status(400).json({
        status: false,
        message: "Incorrect verification code",
      });
    }

    user.isVerified = true;
    await user.save();
    await VerificationCode.deleteMany({ userId: user._id });

    return res.status(200).json({
      status: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.log("Error verifying email:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to verify email",
    });
  }
});


// ===========
// LOGIN
// ===========

userRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password were provided
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: "Your account has been deactivated",
      });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return res.status(200).json({
      status: true,
      message: "Login successful",
      ...authPayload(user),
    });

  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to login",
    });
  }
});


// ======================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// PUBLIC
// ======================================================

userRouter.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {

    const { email } = req.body;


    // ----------------------------------------------
    // Check email
    // ----------------------------------------------

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }


    // ----------------------------------------------
    // Clean email
    // ----------------------------------------------

    const cleanEmail = email
      .trim()
      .toLowerCase();


    // ----------------------------------------------
    // Find user
    // ----------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });


    // ----------------------------------------------
    // Don't reveal whether email exists
    // ----------------------------------------------

    if (!user) {
      return res.status(200).json({
        status: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }


    // ----------------------------------------------
    // Delete old unused reset tokens
    // ----------------------------------------------

    await PasswordResetToken.deleteMany({
      userId: user._id,
      usedAt: null,
    });


    // ----------------------------------------------
    // Generate secure reset token
    // ----------------------------------------------

    const token = GenerateResetToken();


    // ----------------------------------------------
    // Token expires after 15 minutes
    // ----------------------------------------------

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );


    // ----------------------------------------------
    // Save reset token
    // ----------------------------------------------

    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt,
    });


    // ----------------------------------------------
    // Create reset link
    // ----------------------------------------------

    const resetLink =
      `${env.CLIENT_URL}/reset-password/${token}`;


    // ----------------------------------------------
    // Send email
    // ----------------------------------------------

    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetLink
    );

    if (!emailResult.sent) {
      console.log(
        `[Raadiye] Password reset email was not delivered for ${user.email}.`
      );
    }

    return res.status(200).json({
      status: true,
      message:
        "If an account with this email exists, a password reset link has been sent.",
    });

  } catch (error) {

    console.log(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Failed to process password reset request",
    });
  }
});



// ======================================================
// RESET PASSWORD
// POST /api/users/reset-password
// PUBLIC
// ======================================================

userRouter.post("/reset-password", resetPasswordLimiter, async (req, res) => {
  try {

    const { token, newPassword } = req.body;


    // ----------------------------------------------
    // Check required fields
    // ----------------------------------------------

    if (!token || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Token and new password are required",
      });
    }


    // ----------------------------------------------
    // Validate password length
    // ----------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message:
          "Password must be at least 6 characters",
      });
    }


    // ----------------------------------------------
    // Find reset token
    // ----------------------------------------------

    const resetToken = await PasswordResetToken.findOne({
      token,
      usedAt: null,
    });


    // ----------------------------------------------
    // Token doesn't exist or was already used
    // ----------------------------------------------

    if (!resetToken) {
      return res.status(400).json({
        status: false,
        message:
          "Invalid or already used reset link",
      });
    }


    // ----------------------------------------------
    // Check token expiration
    // ----------------------------------------------

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        status: false,
        message:
          "This reset link has expired. Please request a new one.",
      });
    }


    // ----------------------------------------------
    // Find user
    // ----------------------------------------------

    const user = await User.findById(
      resetToken.userId
    );


    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }


    // ----------------------------------------------
    // Hash new password
    // ----------------------------------------------

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );


    // ----------------------------------------------
    // Update user's password
    // ----------------------------------------------

    user.password = hashedPassword;

    await user.save();


    // ----------------------------------------------
    // Mark reset token as used
    // ----------------------------------------------

    resetToken.usedAt = new Date();

    await resetToken.save();


    // ----------------------------------------------
    // Success
    // ----------------------------------------------

    return res.status(200).json({
      status: true,
      message:
        "Password has been reset successfully",
    });

  } catch (error) {

    console.log(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Failed to reset password",
    });
  }
});


// ======================================================
// RESEND EMAIL VERIFICATION CODE
// POST /api/auth/resend-verification
// PUBLIC
// ======================================================

userRouter.post(
  "/resend-verification",
  resendVerificationLimiter,
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Email is required",
        });
      }

      const cleanEmail = normalizeEmail(email);
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "No account found for this email",
        });
      }

      if (user.isVerified) {
        return res.status(200).json({
          status: true,
          alreadyVerified: true,
          message: "Email is already verified",
        });
      }

      const issued = await issueVerificationCode(user);

      return res.status(200).json({
        status: true,
        emailSent: issued.emailSent,
        message: issued.emailSent
          ? "A new verification code has been sent to your email."
          : "A new code was created, but the email could not be sent. Please try again in a moment.",
        ...verificationResponseExtras(issued),
      });
    } catch (error) {
      console.log("Resend verification error:", error);

      return res.status(500).json({
        status: false,
        message: "Failed to resend verification code",
      });
    }
  }
);

export default userRouter;