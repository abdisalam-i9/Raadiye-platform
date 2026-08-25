import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

verificationCodeSchema.index({ userId: 1, createdAt: -1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema
);

export default VerificationCode;