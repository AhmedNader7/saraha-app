import { model, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying of user's messages
messageSchema.index({ receiver: 1, createdAt: -1 });

const Message = model("Message", messageSchema);

export default Message;
