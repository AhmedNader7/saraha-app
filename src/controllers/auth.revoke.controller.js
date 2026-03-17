import * as authService from "../services/auth.service.js";
import redis from "../config/redis.js";

/**
 * Logout from all devices
 */
export async function logoutAll(req, res, next) {
  try {
    const userId = req.userId;
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Blacklist current token (optional)
      try {
        const ttl = 7 * 24 * 60 * 60; // 7 days
        await redis.setex(`blacklist:${refreshToken}`, ttl, "1");
      } catch (error) {
        // Redis not available, skip blacklisting
      }
    }

    // Clear DB refreshToken
    await authService.logoutUser(userId);

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  }
}

export default {
  logoutAll,
};
