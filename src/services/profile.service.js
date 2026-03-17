import User from "../DB/models/user/user.model.js";
import config from "../config/index.js";
import path from 'path';
import fs from 'fs';

/**
 * Update user profile picture
 * @param {string} userId - User ID
 * @param {string} filename - Uploaded file name
 * @returns {Promise<object>} - Updated user
 */
export async function updateProfilePicture(userId, filename) {
  const fullPath = path.join(config.upload.path, filename);
  const publicUrl = `/${config.upload.path}/${filename}`;

  const user = await User.findByIdAndUpdate(
    userId,
    { 
      profilePicture: publicUrl,
    },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    // Delete file if user not found
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    throw new Error("User not found");
  }

  return user;
}

export default {
  updateProfilePicture,
};

