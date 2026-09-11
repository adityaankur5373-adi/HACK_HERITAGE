import prisma from "../config/prisma.js";

const projectInclude = {
  report: { include: { media: true, governmentAssignment: { include: { government: { select: { name: true, department: true, office: true } } } } } },
  studentTeams: { include: { members: { include: { student: { select: { id: true, name: true, course: true, department: true, email: true } } } } } },
  solutions: { include: { team: { select: { id: true, name: true } } }, orderBy: { updatedAt: "desc" } },
};

export async function getUniversityProjects(req, res) {
  try {
    const projects = await prisma.universityProject.findMany({ where: { universityId: req.university.id }, include: projectInclude, orderBy: { updatedAt: "desc" } });
    return res.json({ success: true, projects });
  } catch (error) { console.error("University projects error:", error); return res.status(500).json({ success: false, message: "Unable to load projects" }); }
}

export async function getUniversityProject(req, res) {
  try {
    const project = await prisma.universityProject.findFirst({ where: { id: req.params.projectId, universityId: req.university.id }, include: projectInclude });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const students = await prisma.student.findMany({ where: { universityId: req.university.id }, select: { id: true, name: true, course: true, department: true, year: true, email: true }, orderBy: { name: "asc" } });
    return res.json({ success: true, project, students });
  } catch (error) { console.error("University project error:", error); return res.status(500).json({ success: false, message: "Unable to load project" }); }
}

export async function createStudentTeam(req, res) {
  const { name, studentIds, leaderId } = req.body;
  if (typeof name !== "string" || !name.trim() || !Array.isArray(studentIds) || !studentIds.length || studentIds.some((id) => typeof id !== "string")) return res.status(400).json({ success: false, message: "A team name and at least one student are required" });
  const ids = [...new Set(studentIds)];
  try {
    const project = await prisma.universityProject.findFirst({ where: { id: req.params.projectId, universityId: req.university.id } });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (!["TEAM_FORMATION", "IN_PROGRESS"].includes(project.status)) return res.status(409).json({ success: false, message: "Teams can only be created before solution submission" });
    const students = await prisma.student.findMany({ where: { id: { in: ids } }, select: { id: true, universityId: true } });
    if (students.length !== ids.length || students.some((student) => student.universityId !== req.university.id)) return res.status(403).json({ success: false, message: "Every selected student must belong to your university" });
    const selectedLeaderId = leaderId || ids[0];
    if (!ids.includes(selectedLeaderId)) return res.status(400).json({ success: false, message: "The team leader must be one of the selected students" });
    const existingMemberships = await prisma.studentTeamMember.count({ where: { studentId: { in: ids }, team: { projectId: project.id } } });
    if (existingMemberships) return res.status(409).json({ success: false, message: "A student cannot join more than one team for the same project" });
    const team = await prisma.$transaction(async (tx) => {
      const created = await tx.studentTeam.create({ data: { projectId: project.id, universityId: req.university.id, name: name.trim(), members: { create: ids.map((studentId) => ({ studentId, role: studentId === selectedLeaderId ? "LEADER" : "MEMBER" })) } }, include: { members: { include: { student: { select: { id: true, name: true, course: true, department: true } } } } } });
      if (project.status === "TEAM_FORMATION") await tx.universityProject.update({ where: { id: project.id }, data: { status: "IN_PROGRESS" } });
      return created;
    });
    return res.status(201).json({ success: true, message: "Student team created", team });
  } catch (error) { if (error.code === "P2002") return res.status(409).json({ success: false, message: "This project already has a student team" }); console.error("Team creation error:", error); return res.status(500).json({ success: false, message: "Unable to create student team" }); }
}

export async function reviewUniversitySolution(req, res) {
  const { action } = req.body;
  const statuses = { approve: "UNIVERSITY_APPROVED", request_changes: "CHANGES_REQUESTED", reject: "REJECTED" };
  if (!statuses[action]) return res.status(400).json({ success: false, message: "Invalid solution review action" });
  try {
    const solution = await prisma.universitySolution.findFirst({ where: { id: req.params.solutionId, universityId: req.university.id }, include: { project: true } });
    if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });
    if (solution.status !== "UNIVERSITY_REVIEW") return res.status(409).json({ success: false, message: "Only submitted solutions can be reviewed" });
    const updated = await prisma.universitySolution.update({ where: { id: solution.id }, data: { status: statuses[action] } });
    return res.json({ success: true, message: "Solution review saved", solution: updated });
  } catch (error) { console.error("University solution review error:", error); return res.status(500).json({ success: false, message: "Unable to review solution" }); }
}
