import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  findOrCreateGoogleUser,
  getUserByPublicUsername,
} from "../services/auth.service.js";

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export async function signup(req, res, next) {
  try {
    const { email, password, publicUsername } = req.body;

    if (!password || !publicUsername) {
      return res.status(400).json({
        success: false,
        message: "Password and public username are required",
      });
    }

    const user = await registerUser({ email, password, publicUsername });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        email: user.email,
        publicUsername: user.publicUsername,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
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
  signup,
  login,
  logout,
  refreshToken,
  googleCallback,
  getProfile,
  getMe,
};
