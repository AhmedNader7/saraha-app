import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  findOrCreateGoogleUser,
  getUserByPublicUsername,
} from "../services/auth.service.js";
import * as otpService from "../services/otp.service.js";

/**
 * Signup request - send OTP
 */
export async function signupRequest(req, res, next) {
  try {
    const { email, password, publicUsername } = req.body;

    if (!email || !password || !publicUsername) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and public username are required",
      });
    }

    await otpService.generateAndSendOTP(email, "signup");

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify OTP and complete signup + login
 */
export async function verifyOTPHandler(req, res, next) {
  try {
    const { email, code, password, publicUsername } = req.body;

    const isValid = await otpService.verifyOTP(email, code, "signup");
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const result = await otpService.completeSignup({
      email,
      password,
      publicUsername,
    });

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account verified and logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 */
export async function logout(req, res, next) {
  try {
    const userId = req.userId;

    await logoutUser(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google OAuth callback
 */
export async function googleCallback(req, res, next) {
  try {
    // User should be attached to req.user by passport
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`,
      );
    }

    const result = req.user;

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}`,
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get user profile by public username
 */
export async function getProfile(req, res, next) {
  try {
    const { publicUsername } = req.params;

    if (!publicUsername) {
      return res.status(400).json({
        success: false,
        message: "Public username is required",
      });
    }

    const user = await getUserByPublicUsername(publicUsername);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  signupRequest,
  verifyOTPHandler,
  login,
  logout,
  refreshToken,
  googleCallback,
  getProfile,
  getMe,
};
