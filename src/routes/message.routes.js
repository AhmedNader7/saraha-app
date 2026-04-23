import { Router } from "express";
import * as messageController from "../controllers/message.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { strictMessageRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

/**
 * POST /api/messages/send
 * Send an anonymous message to a user by ID (requires authentication - but sender is anonymous)
 */
router.post("/send", isAuth, messageController.send);

/**
 * POST /api/messages/send/:publicUsername
 * Send an anonymous message to a user by public username (public endpoint)
 */
import { validate } from "../middlewares/validate.middleware.js";
import { messageSchema } from "../utils/validators.js";

router.post(
  "/send/:publicUsername",
  strictMessageRateLimiter,
  validate(messageSchema),
  messageController.sendByUsername,
);

/**
 * GET /api/messages/inbox
 * Get all messages for the authenticated user
 */
router.get("/inbox", isAuth, messageController.inbox);

/**
 * GET /api/messages/unread-count
 * Get unread message count for the authenticated user
 */
router.get("/unread-count", isAuth, messageController.unreadCount);

/**
 * GET /api/messages/:messageId
 * Get a single message by ID (requires authentication)
 */
router.get("/:messageId", isAuth, messageController.getMessage);

/**
 * PATCH /api/messages/:messageId/read
 * Mark a message as read
 */
router.patch("/:messageId/read", isAuth, messageController.markMessageAsRead);

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
router.delete("/:messageId", isAuth, messageController.remove);

export default router;
