import express from "express";

import {
  getGovernmentAnalytics,
} from "../controllers/governmentAnalyticsController.js";

import {
  protect,
  requireGovernment,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireGovernment);

router.get(
  "/",
  getGovernmentAnalytics
);

export default router;