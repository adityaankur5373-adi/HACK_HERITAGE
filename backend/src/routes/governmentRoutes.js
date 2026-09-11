import express from "express";

import {
  getGovernmentDashboard,
  getGovernmentReports,
  getGovernmentReportById,
} from "../controllers/governmentReportController.js";

import {
  updateGovernmentReportStatus,
} from "../controllers/governmentReviewController.js";
import { selectReportUniversities } from "../controllers/governmentUniversitySelectionController.js";
import { getGovernmentReportSolutions, selectGovernmentSolution } from "../controllers/governmentSolutionController.js";
import { getGovernmentIndustryRecommendations, selectReportIndustries } from "../controllers/governmentIndustryController.js";

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

router.patch(
  "/reports/:reportId/universities",
  selectReportUniversities
);
router.get("/reports/:reportId/solutions", getGovernmentReportSolutions);
router.patch("/solutions/:solutionId/select", selectGovernmentSolution);
router.get("/reports/:reportId/industries", getGovernmentIndustryRecommendations);
router.patch("/reports/:reportId/industries", selectReportIndustries);

export default router;
