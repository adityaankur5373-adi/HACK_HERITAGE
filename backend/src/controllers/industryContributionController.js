import prisma from "../config/prisma.js";

const includeContribution = { project: { include: { report: { select: { id: true, title: true, status: true } } } } };
const nextStatus = { PROPOSED: "ACCEPTED", ACCEPTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };

export async function getIndustryContributions(req, res) {
  try {
    const contributions = await prisma.industryContribution.findMany({ where: { industryId: req.industry.id }, include: includeContribution, orderBy: { updatedAt: "desc" } });
    return res.json({ success: true, contributions });
  } catch (error) { console.error("Industry contributions error:", error); return res.status(500).json({ success: false, message: "Unable to load contributions" }); }
}

export async function createIndustryContribution(req, res) {
  const { projectId, type, description, estimatedCost, timeline } = req.body;
  if (typeof projectId !== "string" || typeof type !== "string" || !type.trim() || typeof description !== "string" || !description.trim()) return res.status(400).json({ success: false, message: "projectId, contribution title, and description are required" });
  try {
    const project = await prisma.universityProject.findUnique({ where: { id: projectId }, select: { id: true, reportId: true } });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const [invitation, recommendation, solution] = await Promise.all([
      prisma.industryCollaborationInvitation.findFirst({ where: { reportId: project.reportId, industryId: req.industry.id, status: "ACCEPTED" } }),
      prisma.industryRecommendation.findFirst({ where: { reportId: project.reportId, industryId: req.industry.id, status: "SELECTED" } }),
      prisma.universitySolution.findFirst({ where: { reportId: project.reportId, status: "APPROVED" }, select: { id: true } }),
    ]);
    if (!invitation || !recommendation || !solution) return res.status(403).json({ success: false, message: "An accepted industry collaboration for a report with a final approved solution is required" });
    const contribution = await prisma.industryContribution.create({ data: { projectId: project.id, industryId: req.industry.id, type: type.trim(), description: description.trim(), estimatedCost: typeof estimatedCost === "string" ? estimatedCost.trim() || null : null, timeline: typeof timeline === "string" ? timeline.trim() || null : null, status: "PROPOSED" }, include: includeContribution });
    return res.status(201).json({ success: true, contribution });
  } catch (error) { console.error("Industry contribution creation error:", error); return res.status(500).json({ success: false, message: "Unable to submit contribution" }); }
}

export async function updateIndustryContribution(req, res) {
  const { status } = req.body;
  try {
    const contribution = await prisma.industryContribution.findFirst({ where: { id: req.params.contributionId, industryId: req.industry.id } });
    if (!contribution) return res.status(404).json({ success: false, message: "Contribution not found" });
    if (typeof status !== "string" || nextStatus[contribution.status] !== status) return res.status(409).json({ success: false, message: "Invalid contribution status transition" });
    const updated = await prisma.industryContribution.update({ where: { id: contribution.id }, data: { status }, include: includeContribution });
    return res.json({ success: true, contribution: updated });
  } catch (error) { console.error("Industry contribution update error:", error); return res.status(500).json({ success: false, message: "Unable to update contribution" }); }
}
