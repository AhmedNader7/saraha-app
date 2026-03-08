import {
  sendMessage,
  getInbox,
  getMessageById,
  deleteMessage,
  markAsRead,
  getUnreadCount,
} from "../services/message.service.js";

/**
 * Send an anonymous message to a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function send(req, res, next) {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and content are required",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    const message = await sendMessage(receiverId, content);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send anonymous message by public username
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function sendByUsername(req, res, next) {
  try {
    const { publicUsername, content } = req.body;
    const User = (await import("../DB/models/user/user.model.js")).default;

    if (!publicUsername || !content) {
      return res.status(400).json({
        success: false,
        message: "Public username and content are required",
      });
    }

    // Find user by public username
    const user = await User.findOne({
      publicUsername: publicUsername.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const message = await sendMessage(user._id, content);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's inbox (all received messages)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function inbox(req, res, next) {
  try {
    const userId = req.userId;
    const { page, limit, sort } = req.query;

    const result = await getInbox(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort: sort || "-createdAt",
    });

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single message by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function getMessage(req, res, next) {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await getMessageById(messageId, userId);

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a message
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function remove(req, res, next) {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    await deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark message as read
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function markMessageAsRead(req, res, next) {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await markAsRead(messageId, userId);

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get unread message count
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function unreadCount(req, res, next) {
  try {
    const userId = req.userId;

    const count = await getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  send,
  sendByUsername,
  inbox,
  getMessage,
  remove,
  markMessageAsRead,
  unreadCount,
};
