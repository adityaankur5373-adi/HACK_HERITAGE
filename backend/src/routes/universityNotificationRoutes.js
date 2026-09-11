import express from "express";
import { protect, requireUniversity } from "../middleware/auth.middleware.js";
import { getUniversityNotifications, markUniversityNotificationRead } from "../controllers/universityNotificationController.js";

const router = express.Router();
router.use(protect, requireUniversity);
router.get("/", getUniversityNotifications);
router.patch("/:notificationId/read", markUniversityNotificationRead);
export default router;
