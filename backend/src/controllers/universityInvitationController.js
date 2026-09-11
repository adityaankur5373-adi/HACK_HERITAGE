import prisma from "../config/prisma.js";

const includeInvitation = { report: { include: { media: true, governmentAssignment: { include: { government: { select: { id: true, name: true, department: true, office: true, email: true } } } } } }, invitedByGovernment: { select: { id: true, name: true, department: true, office: true, email: true } } };

export async function getUniversityInvitations(req, res) {
  try {
    const invitations = await prisma.universityProblemInvitation.findMany({ where: { universityId: req.university.id }, include: includeInvitation, orderBy: { createdAt: "desc" } });
    return res.json({ success: true, invitations });
  } catch (error) {
    console.error("University invitations error:", error);
    return res.status(500).json({ success: false, message: "Unable to load collaboration requests" });
  }
}

async function respond(req, res, status) {
  try {
    const invitation = await prisma.universityProblemInvitation.findFirst({ where: { id: req.params.invitationId, universityId: req.university.id } });
    if (!invitation) return res.status(404).json({ success: false, message: "Collaboration request not found" });
    if (invitation.status !== "INVITED") return res.status(409).json({ success: false, message: "This collaboration request has already been answered" });
    await prisma.$transaction(async (tx) => {
      await tx.universityProblemInvitation.update({ where: { id: invitation.id }, data: { status, respondedAt: new Date() } });
      if (status === "ACCEPTED") {
        await tx.universityProject.upsert({
          where: { invitationId: invitation.id },
          update: {},
          create: { reportId: invitation.reportId, universityId: req.university.id, invitationId: invitation.id, status: "TEAM_FORMATION" },
        });
        await tx.universityNotification.upsert({
          where: { universityId_reportId_type: { universityId: req.university.id, reportId: invitation.reportId, type: "PROJECT_CREATED" } },
          update: { isRead: false },
          create: { universityId: req.university.id, reportId: invitation.reportId, type: "PROJECT_CREATED", title: "University project created", message: "Your collaboration request was accepted and is ready for team formation." },
        });
      }
      const type = `UNIVERSITY_${status}_${req.university.id}`;
      const notification = { governmentId: invitation.invitedByGovernmentId, reportId: invitation.reportId, type, title: `University ${status.toLowerCase()} collaboration`, message: `${req.university.name} ${status.toLowerCase()} the collaboration invitation.` };
      await tx.governmentNotification.upsert({ where: { governmentId_reportId_type: { governmentId: notification.governmentId, reportId: notification.reportId, type } }, update: { isRead: false, title: notification.title, message: notification.message }, create: notification });
    });
    const updated = await prisma.universityProblemInvitation.findUnique({
      where: { id: invitation.id },
      include: includeInvitation,
    });
    return res.json({ success: true, message: `Collaboration ${status.toLowerCase()}`, invitation: updated });
  } catch (error) {
    console.error("University invitation response error:", error);
    return res.status(500).json({ success: false, message: "Unable to respond to collaboration request" });
  }
}

export const acceptUniversityInvitation = (req, res) => respond(req, res, "ACCEPTED");
export const declineUniversityInvitation = (req, res) => respond(req, res, "DECLINED");
