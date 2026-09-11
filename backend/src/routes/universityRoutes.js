import express from "express";
import { protect, requireUniversity } from "../middleware/auth.middleware.js";
import { acceptUniversityInvitation, declineUniversityInvitation, getUniversityInvitations } from "../controllers/universityInvitationController.js";
import { createStudentTeam, getUniversityProject, getUniversityProjects, reviewUniversitySolution } from "../controllers/universityProjectController.js";
import { getUniversityOpportunities } from "../controllers/opportunityController.js";

const router = express.Router();
router.use(protect, requireUniversity);
router.get("/invitations", getUniversityInvitations);
router.patch("/invitations/:invitationId/accept", acceptUniversityInvitation);
router.patch("/invitations/:invitationId/decline", declineUniversityInvitation);
router.get("/projects", getUniversityProjects);
router.get("/projects/:projectId", getUniversityProject);
router.post("/projects/:projectId/teams", createStudentTeam);
router.patch("/solutions/:solutionId/review", reviewUniversitySolution);
router.get("/opportunities", getUniversityOpportunities);
export default router;
