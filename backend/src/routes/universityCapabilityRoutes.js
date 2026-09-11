import express from "express";

import {
  saveUniversityCapabilities,
  getUniversityCapabilities,
} from "../controllers/universityCapabilityController.js";

import {
  protect,
  requireUniversity,
} from "../middleware/auth.middleware.js";


const router = express.Router();


router.use(protect);
router.use(requireUniversity);


router.get(
  "/",
  getUniversityCapabilities
);


router.post(
  "/",
  saveUniversityCapabilities
);


export default router;