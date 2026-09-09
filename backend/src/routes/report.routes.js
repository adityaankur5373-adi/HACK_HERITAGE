import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  getReportById,
  getReports,
  supportReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/", protect, getReports);
router.get("/:reportId", protect, getReportById);

router.post(
  "/:reportId/support",
  protect,
  supportReport
);

export default router;

