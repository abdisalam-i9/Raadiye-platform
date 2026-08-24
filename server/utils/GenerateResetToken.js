import crypto from "crypto";

export const GenerateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};