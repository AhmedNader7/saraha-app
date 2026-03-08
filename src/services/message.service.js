import Message from "../DB/models/message/message.model.js";
import User from "../DB/models/user/user.model.js";

/**
 * Send an anonymous message to a user
 * @param {string} receiverId - Receiver's user ID
 * @param {string} content - Message content
 * @returns {Promise<object>} - Created message
 */
export async function sendMessage(receiverId, content) {
  // Verify receiver exists
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new Error("Receiver not found");
  }

  // Create message (anonymous - no sender info)
  const message = new Message({
    receiver: receiverId,
    content: content.trim(),
  });

  await message.save();

  return {
    id: message._id,
    receiver: message.receiver,
    content: message.content,
    createdAt: message.createdAt,
  };
}

/**
 * Get all messages for a user (inbox)
 * @param {string} userId - User ID
 * @param {object} options - Query options (pagination, etc.)
 * @returns {Promise<object>} - Messages and pagination info
 */
export async function getInbox(userId, options = {}) {
  const { page = 1, limit = 20, sort = "-createdAt" } = options;

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ receiver: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ receiver: userId }),
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single message by ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<object>} - Message
 */
export async function getMessageById(messageId, userId) {
  const message = await Message.findOne({
    _id: messageId,
    receiver: userId,
  }).lean();

  if (!message) {
    throw new Error("Message not found");
  }

  return message;
}

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
export async function deleteMessage(messageId, userId) {
  const message = await Message.findOneAndDelete({
    _id: messageId,
    receiver: userId,
  });

  if (!message) {
    throw new Error("Message not found or unauthorized");
  }
}

/**
 * Mark message as read
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Updated message
 */
export async function markAsRead(messageId, userId) {
  const message = await Message.findOneAndUpdate(
    { _id: messageId, receiver: userId },
    { isRead: true },
    { new: true },
  );

  if (!message) {
    throw new Error("Message not found or unauthorized");
  }

  return message;
}

/**
 * Get unread message count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Unread count
 */
export async function getUnreadCount(userId) {
  return Message.countDocuments({ receiver: userId, isRead: false });
}

/**
 * Delete all messages for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Delete result
 */
export async function deleteAllMessages(userId) {
  return Message.deleteMany({ receiver: userId });
}

export default {
  sendMessage,
  getInbox,
  getMessageById,
  deleteMessage,
  markAsRead,
  getUnreadCount,
  deleteAllMessages,
};
