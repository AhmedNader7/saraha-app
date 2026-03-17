import User from "../DB/models/user/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import redis from "../config/redis.js";

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate access token
 * @param {string} userId - User ID
 * @returns {string} - Access token
 */
export function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpire,
  });
}

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
}

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {object} - Decoded token payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} - Decoded token payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

/**
 * Register a new user
 * @param {object} userData - User data
 * @returns {Promise<object>} - Created user
 */
export async function registerUser(userData) {
  const { email, password, publicUsername } = userData;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [
      { email: email?.toLowerCase() },
      { publicUsername: publicUsername?.toLowerCase() },
    ],
  });

  if (existingUser) {
    if (existingUser.email === email?.toLowerCase()) {
      throw new Error("Email already registered");
    }
    if (existingUser.publicUsername === publicUsername?.toLowerCase()) {
      throw new Error("Public username already taken");
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = new User({
    email: email?.toLowerCase(),
    password: hashedPassword,
    publicUsername: publicUsername?.toLowerCase(),
  });

  await user.save();
  return user;
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - User and tokens
 */
export async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new Error("Account not verified. Please verify your email.");
  }

  if (!user.password) {
    throw new Error("Please login with Google");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      publicUsername: user.publicUsername,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<object>} - New tokens
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    // Check Redis blacklist (optional)
    let blacklisted = false;
    try {
      blacklisted = await redis.get(`blacklist:${refreshToken}`);
    } catch (error) {
      // Redis not available, assume not blacklisted
    }
    if (blacklisted) {
      throw new Error("Token revoked");
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}

/**
 * Logout user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function logoutUser(userId) {
  const user = await User.findById(userId);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }
}

/**
 * Find or create Google user
 * @param {object} profile - Google profile
 * @returns {Promise<object>} - User
 */
export async function findOrCreateGoogleUser(profile) {
  let user = await User.findOne({ googleId: profile.id });

  if (!user) {
    // Generate unique public username
    const baseUsername =
      profile.displayName?.replace(/\s+/g, "_").toLowerCase() || "google_user";
    const publicUsername = await generateUniqueUsername(baseUsername);

    user = new User({
      email: profile.emails?.[0]?.value?.toLowerCase(),
      googleId: profile.id,
      publicUsername,
      isVerified: true,
    });

    await user.save();
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      publicUsername: user.publicUsername,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Generate a unique username
 * @param {string} baseUsername - Base username
 * @returns {Promise<string>} - Unique username
 */
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 0;

  while (await User.findOne({ publicUsername: username })) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
}

/**
 * Get user by public username
 * @param {string} publicUsername - Public username
 * @returns {Promise<object>} - User
 */
export async function getUserByPublicUsername(publicUsername) {
  const user = await User.findOne({
    publicUsername: publicUsername.toLowerCase(),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    publicUsername: user.publicUsername,
    createdAt: user.createdAt,
  };
}

export default {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  findOrCreateGoogleUser,
  getUserByPublicUsername,
};
