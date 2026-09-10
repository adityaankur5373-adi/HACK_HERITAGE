import express from "express";

import {
  getGovernmentNotifications,
  markGovernmentNotificationRead,
  markAllGovernmentNotificationsRead,
} from "../controllers/governmentNotificationController.js";

import {
  protect,
  requireGovernment,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireGovernment);

router.get(
  "/",
  getGovernmentNotifications
);

router.patch(
  "/:notificationId/read",
  markGovernmentNotificationRead
);

router.patch(
  "/read-all",
  markAllGovernmentNotificationsRead
);

export default router;