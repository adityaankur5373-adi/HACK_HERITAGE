import express from "express";
import {
  getReportConversation,
  reportProblem,
  submitReport,
} from "../controllers/citizen.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {uploadReportMedia} from "../controllers/reportMedia.controller.js";
import {
  uploadReportFiles,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/report",
  protect,
  reportProblem
);

router.get(
  "/report/conversation/:conversationId",
  protect,
  getReportConversation
);

router.post(
  "/report/:reportId/submit",
   protect,
  submitReport
);

router.post(
  "/:reportId/media",
  protect,
  uploadReportFiles.array("files", 10),
  uploadReportMedia
);
export default router;