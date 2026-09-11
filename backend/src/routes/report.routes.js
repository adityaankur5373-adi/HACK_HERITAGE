import express from "express";
import { protect, requireCitizen } from "../middleware/auth.middleware.js";

import {
  getReportById,
  getReports,
  supportReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.use(protect, requireCitizen);
router.get("/", getReports);
router.get("/:reportId", getReportById);

router.post(
  "/:reportId/support",
  supportReport
);

export default router;
