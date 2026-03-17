import { model, Schema } from "mongoose";

const otpSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["signup", "login", "reset"],
      default: "signup",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "0" }, // TTL index auto-delete expired
    },
  },
  {
    timestamps: true,
  },
);

const OTP = model("OTP", otpSchema);

export default OTP;
