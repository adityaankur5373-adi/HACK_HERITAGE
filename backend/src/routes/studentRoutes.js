import express from "express";
import { protect, requireStudent } from "../middleware/auth.middleware.js";
import { getStudentProject, getStudentProjects, saveStudentSolution } from "../controllers/studentProjectController.js";

const router = express.Router();
router.use(protect, requireStudent);
router.get("/projects", getStudentProjects);
router.get("/projects/:projectId", getStudentProject);
router.put("/projects/:projectId/solution", saveStudentSolution);
export default router;
