import express from "express";
import {
  getReportConversation,
  reportProblem,
  submitReport,
} from "../controllers/citizen.controller.js";
import { protect, requireCitizen } from "../middleware/auth.middleware.js";
import {uploadReportMedia} from "../controllers/reportMedia.controller.js";
import {
  uploadReportFiles,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect, requireCitizen);

router.post(
  "/report",
  reportProblem
);

router.get(
  "/report/conversation/:conversationId",
  getReportConversation
);

router.post(
  "/report/:reportId/submit",
  submitReport
);

router.post(
  "/:reportId/media",
  uploadReportFiles.array("files", 10),
  uploadReportMedia
);
export default router;