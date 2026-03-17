import { Router } from "express";
import profileController from "../controllers/profile.controller.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const router = Router({ mergeParams: true });

/**
 * PUT /api/profile/pic
 * Upload profile picture (authenticated)
 */
router.put("/pic", isAuth, profileController.uploadProfilePicController);

export default router;
