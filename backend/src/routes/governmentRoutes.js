import express from "express";

import {
  getGovernmentDashboard,
  getGovernmentReports,
  getGovernmentReportById,
} from "../controllers/governmentReportController.js";

import {
  updateGovernmentReportStatus,
} from "../controllers/governmentReviewController.js";

import {
  protect,
  requireGovernment,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All Government Routes
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(requireGovernment);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  getGovernmentDashboard
);

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/

router.get(
  "/reports",
  getGovernmentReports
);

router.get(
  "/reports/:reportId",
  getGovernmentReportById
);

/*
|--------------------------------------------------------------------------
| Update Report Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/reports/:reportId/review",
  updateGovernmentReportStatus
);

export default router;