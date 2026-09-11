import prisma from "../config/prisma.js";

const industryInclude = {
  industry: { select: {
    id: true, name: true, address: true, area: true, city: true, district: true,
    state: true, pincode: true, capabilities: { select: { type: true, value: true } },
  } },
};

async function getAssignment(reportId, governmentId) {
  return prisma.governmentReportAssignment.findFirst({
    where: { reportId, governmentId },
    include: { report: { select: { id: true, status: true } } },
  });
}

export async function getGovernmentIndustryRecommendations(req, res) {
  try {
    const assignment = await getAssignment(req.params.reportId, req.government.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Report not found or not assigned to your office" });
    const recommendations = await prisma.industryRecommendation.findMany({
      where: { reportId: assignment.reportId }, include: industryInclude, orderBy: { score: "desc" },
    });
    return res.json({ success: true, recommendations });
  } catch (error) {
    console.error("Government industry recommendations error:", error);
    return res.status(500).json({ success: false, message: "Unable to load industry recommendations" });
  }
}

export async function selectReportIndustries(req, res) {
  const requestedIds = req.body.industryIds;
  if (!Array.isArray(requestedIds) || !requestedIds.length || requestedIds.some((id) => typeof id !== "string" || !id.trim())) {
    return res.status(400).json({ success: false, message: "Select at least one recommended industry" });
  }
  const industryIds = [...new Set(requestedIds.map((id) => id.trim()))];
  try {
    const assignment = await getAssignment(req.params.reportId, req.government.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Report not found or not assigned to your office" });
    if (assignment.report.status !== "VERIFIED") return res.status(409).json({ success: false, message: "Industries can only be selected for a verified report" });
    const finalSolution = await prisma.universitySolution.findFirst({ where: { reportId: assignment.reportId, status: "APPROVED" }, select: { id: true } });
    if (!finalSolution) return res.status(409).json({ success: false, message: "Select a final approved solution before selecting industries" });
    const selected = await prisma.industryRecommendation.findMany({ where: { reportId: assignment.reportId, industryId: { in: industryIds } }, select: { industryId: true, status: true } });
    if (selected.length !== industryIds.length || selected.some((item) => item.status !== "RECOMMENDED")) {
      return res.status(400).json({ success: false, message: "Every selected industry must be a currently recommended industry for this report" });
    }
    const recommendations = await prisma.$transaction(async (tx) => {
      await tx.industryRecommendation.updateMany({ where: { reportId: assignment.reportId, status: "RECOMMENDED", industryId: { notIn: industryIds } }, data: { status: "NOT_SELECTED" } });
      await tx.industryRecommendation.updateMany({ where: { reportId: assignment.reportId, industryId: { in: industryIds } }, data: { status: "SELECTED" } });
      await tx.industryCollaborationInvitation.createMany({
        data: industryIds.map((industryId) => ({
          reportId: assignment.reportId,
          industryId,
          invitedByGovernmentId: req.government.id,
          status: "INVITED",
        })),
        skipDuplicates: true,
      });
      return tx.industryRecommendation.findMany({ where: { reportId: assignment.reportId }, include: industryInclude, orderBy: { score: "desc" } });
    });
    return res.json({ success: true, message: "Industry collaboration invitations sent", recommendations });
  } catch (error) {
    console.error("Government industry selection error:", error);
    return res.status(500).json({ success: false, message: "Unable to select industries" });
  }
}
