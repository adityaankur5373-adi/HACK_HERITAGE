import prisma from "../config/prisma.js";

export async function selectReportUniversities(req, res) {
  const { universityIds, message } = req.body;
  if (!Array.isArray(universityIds) || !universityIds.length || universityIds.some((id) => typeof id !== "string" || !id.trim())) {
    return res.status(400).json({ success: false, message: "Select at least one recommended university" });
  }
  const selectedIds = [...new Set(universityIds.map((id) => id.trim()))];
  try {
    const assignment = await prisma.governmentReportAssignment.findFirst({ where: { reportId: req.params.reportId, governmentId: req.government.id }, include: { report: { select: { status: true } } } });
    if (!assignment) return res.status(404).json({ success: false, message: "Report is not assigned to your government office" });
    if (String(assignment.report.status).toUpperCase() !== "VERIFIED") return res.status(409).json({ success: false, message: "Universities can only be selected for a verified report" });
    const recommendations = await prisma.universityRecommendation.findMany({ where: { reportId: assignment.reportId, universityId: { in: selectedIds } }, select: { universityId: true, status: true } });
    if (recommendations.length !== selectedIds.length || recommendations.some(({ status }) => !["RECOMMENDED", "SELECTED"].includes(status))) return res.status(400).json({ success: false, message: "Every selected university must be an eligible recommendation for this report" });
    const recommendationsAfterSelection = await prisma.$transaction(async (tx) => {
      await tx.universityRecommendation.updateMany({ where: { reportId: assignment.reportId, status: "RECOMMENDED", universityId: { notIn: selectedIds } }, data: { status: "NOT_SELECTED" } });
      await tx.universityRecommendation.updateMany({ where: { reportId: assignment.reportId, universityId: { in: selectedIds } }, data: { status: "SELECTED" } });
      await tx.universityProblemInvitation.createMany({
        data: selectedIds.map((universityId) => ({
          reportId: assignment.reportId,
          universityId,
          invitedByGovernmentId: req.government.id,
          status: "INVITED",
          message: typeof message === "string" ? message.trim() || null : null,
        })),
        skipDuplicates: true,
      });
      await tx.universityNotification.updateMany({
        where: {
          reportId: assignment.reportId,
          universityId: { in: selectedIds },
          type: "COLLABORATION_INVITATION",
        },
        data: { isRead: false },
      });
      await tx.universityNotification.createMany({
        data: selectedIds.map((universityId) => ({
          universityId,
          reportId: assignment.reportId,
          type: "COLLABORATION_INVITATION",
          title: "New collaboration request",
          message: "A government office has invited your university to collaborate on a verified civic problem.",
        })),
        skipDuplicates: true,
      });
      return tx.universityRecommendation.findMany({ where: { reportId: assignment.reportId }, include: { university: { select: { id: true, name: true, email: true, city: true, district: true, state: true } } }, orderBy: { score: "desc" } });
    });
    return res.json({ success: true, message: "University invitations sent", recommendations: recommendationsAfterSelection });
  } catch (error) {
    console.error("Government university selection error:", error);
    return res.status(500).json({ success: false, message: "Unable to select universities" });
  }
}
