import { model, Schema } from "mongoose";

const SYS_ROLE = {
  user: "user",
  admin: "admin",
};

const schema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    publicUsername: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
      lowercase: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(SYS_ROLE),
      default: SYS_ROLE.user,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = model("User", schema);

export default User;
