import { updateProfilePicture } from "../services/profile.service.js";
import { uploadProfilePic, processImage } from "../middlewares/upload.middleware.js";

/**
 * Update profile picture
 */
export const uploadProfilePicController = [
  uploadProfilePic,
  processImage,
  async (req, res, next) => {
    try {
      const userId = req.userId;
      const filename = req.file.filename;

      const user = await updateProfilePicture(userId, filename);

      res.json({
        success: true,
        message: "Profile picture updated",
        data: {
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

export default {
  uploadProfilePicController,
};

