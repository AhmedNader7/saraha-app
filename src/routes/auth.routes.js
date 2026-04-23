import { Router } from "express";
import passport from "passport";
import { configureGoogleStrategy } from "../config/google.passport.js";
import * as authController from "../services/auth.controller.js";
import authRevokeController from "../controllers/auth.revoke.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// Configure Google Strategy
configureGoogleStrategy();

/**
 * POST /api/auth/signup
 * Register a new user
 */
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, otpSchema, loginSchema } from "../utils/validators.js";

router.post(
  "/signup",
  authRateLimiter,
  validate(signupSchema),
  authController.signupRequest,
);
router.post(
  "/verify-otp",
  authRateLimiter,
  validate(otpSchema),
  authController.verifyOTPHandler,
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login,
);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
router.post("/logout", isAuth, authController.logout);
router.post("/logout-all", isAuth, authRevokeController.logoutAll);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
router.post("/refresh", authController.refreshToken);

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback,
);

/**
 * GET /api/auth/profile/:publicUsername
 * Get user profile by public username (public endpoint)
 */
router.get("/profile/:publicUsername", authController.getProfile);

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get("/me", isAuth, authController.getMe);

export default router;
