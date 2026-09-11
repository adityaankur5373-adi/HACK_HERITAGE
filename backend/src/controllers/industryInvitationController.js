import prisma from "../config/prisma.js";

const includeInvitation = {
  report: { include: { universitySolutions: { where: { status: "APPROVED" }, select: { id: true, title: true, description: true, projectId: true, technologies: true } } } },
  government: { select: { id: true, name: true, department: true, office: true } },
};

export async function getIndustryInvitations(req, res) {
  try {
    const invitations = await prisma.industryCollaborationInvitation.findMany({ where: { industryId: req.industry.id }, include: includeInvitation, orderBy: { createdAt: "desc" } });
    return res.json({
      success: true,
      invitations: invitations.map(({ government, ...invitation }) => ({
        ...invitation,
        invitedByGovernment: government,
      })),
    });
  } catch (error) { console.error("Industry invitations error:", error); return res.status(500).json({ success: false, message: "Unable to load invitations" }); }
}

async function respond(req, res, status) {
  try {
    const invitation = await prisma.industryCollaborationInvitation.findFirst({ where: { id: req.params.invitationId, industryId: req.industry.id } });
    if (!invitation) return res.status(404).json({ success: false, message: "Collaboration invitation not found" });
    if (invitation.status !== "INVITED") return res.status(409).json({ success: false, message: "This invitation has already been answered" });
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.industryCollaborationInvitation.update({ where: { id: invitation.id }, data: { status, respondedAt: new Date() }, include: includeInvitation });
      await tx.governmentNotification.upsert({
        where: { governmentId_reportId_type: { governmentId: invitation.invitedByGovernmentId, reportId: invitation.reportId, type: `INDUSTRY_${status}_${req.industry.id}` } },
        update: { isRead: false },
        create: { governmentId: invitation.invitedByGovernmentId, reportId: invitation.reportId, type: `INDUSTRY_${status}_${req.industry.id}`, title: `Industry ${status.toLowerCase()} collaboration`, message: `${req.industry.name} ${status.toLowerCase()} the collaboration invitation.` },
      });
      return item;
    });
    const { government, ...invitationResponse } = updated;
    return res.json({
      success: true,
      message: `Collaboration ${status.toLowerCase()}`,
      invitation: {
        ...invitationResponse,
        invitedByGovernment: government,
      },
    });
  } catch (error) { console.error("Industry invitation response error:", error); return res.status(500).json({ success: false, message: "Unable to respond to invitation" }); }
}

export const acceptIndustryInvitation = (req, res) => respond(req, res, "ACCEPTED");
export const declineIndustryInvitation = (req, res) => respond(req, res, "DECLINED");
