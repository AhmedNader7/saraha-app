import OTP from "../DB/models/otp/otp.model.js";
import User from "../DB/models/user/user.model.js";
import { registerUser } from "./auth.service.js";
import crypto from "crypto";

/**
 * Generate a random 6-digit OTP code
 */
function generateOTPCode() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate and send OTP
 * @param {string} email - User email
 * @param {string} purpose - Purpose of OTP (signup, login, reset)
 */
export async function generateAndSendOTP(email, purpose) {
  const code = "123456"; // Fixed for testing
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if user exists for signup
  let userId = null;
  if (purpose === "signup") {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      throw new Error("Email already registered");
    }
    // For signup, we don't have userId yet, so we'll set it later or use email as key
  } else {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("User not found");
    }
    userId = user._id;
  }

  // Save OTP to database
  const otp = new OTP({
    userId,
    email: email.toLowerCase(),
    code,
    purpose,
    expiresAt,
  });
  await otp.save();

  // Send email (disabled for testing)
  // await sendOTP(email, code);
}

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} code - OTP code
 * @param {string} purpose - Purpose of OTP
 * @returns {boolean} - True if valid
 */
export async function verifyOTP(email, code, purpose) {
  const otp = await OTP.findOne({
    email: email.toLowerCase(),
    code,
    purpose,
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    return false;
  }

  // Delete the OTP after verification
  await OTP.deleteOne({ _id: otp._id });

  return true;
}

/**
 * Complete signup after OTP verification
 * @param {object} userData - User data
 * @returns {object} - User and tokens
 */
export async function completeSignup({ email, password, publicUsername }) {
  // Register the user
  const user = await registerUser({ email, password, publicUsername });

  // Mark as verified
  user.isVerified = true;
  await user.save();

  // Generate tokens (reuse login logic)
  const { loginUser } = await import("./auth.service.js");
  const result = await loginUser(email, password);

  return result;
}
