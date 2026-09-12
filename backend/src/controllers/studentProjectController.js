import prisma from "../config/prisma.js";

const includeProject = { report: { include: { media: true, governmentAssignment: { include: { government: { select: { name: true, department: true, office: true } } } } } }, university: { select: { id: true, name: true } }, studentTeams: { include: { members: { include: { student: { select: { id: true, name: true, course: true, department: true } } } }, solutions: true } } };

function withProjectSolutions(project) {
  return {
    ...project,
    solutions: project.studentTeams.flatMap((team) =>
      team.solutions.map((solution) => ({
        ...solution,
        team: {
          id: team.id,
          name: team.name,
        },
      }))
    ),
  };
}

async function findProject(studentId, projectId) {
  const project = await prisma.universityProject.findFirst({ where: { id: projectId, studentTeams: { some: { members: { some: { studentId } } } } }, include: includeProject });
  if (!project) return null;
  const projectWithSolutions = withProjectSolutions(project);
  const currentTeam = projectWithSolutions.studentTeams.find((team) => team.members.some((member) => member.student.id === studentId));
  return {
    ...projectWithSolutions,
    studentTeamId: currentTeam?.id || null,
    currentStudentRole: currentTeam?.members.find((member) => member.student.id === studentId)?.role || null,
  };
}

export async function getStudentProjects(req, res) {
  try {
    const projects = await prisma.universityProject.findMany({
      where: { studentTeams: { some: { members: { some: { studentId: req.student.id } } } } },
      include: includeProject,
      orderBy: { updatedAt: "desc" },
    });
    return res.json({
      success: true,
      projects: projects.map(withProjectSolutions),
    });
  }
  catch (error) { console.error("Student projects error:", error); return res.status(500).json({ success: false, message: "Unable to load projects" }); }
}
export async function getStudentProject(req, res) {
  try { const project = await findProject(req.student.id, req.params.projectId); if (!project) return res.status(404).json({ success: false, message: "Project not found" }); return res.json({ success: true, project }); }
  catch (error) { console.error("Student project error:", error); return res.status(500).json({ success: false, message: "Unable to load project" }); }
}
export async function saveStudentSolution(req, res) {
  const { title, description, technologies, estimatedCost, estimatedDuration, implementationPlan, submit } = req.body;
  if (typeof title !== "string" || !title.trim() || typeof description !== "string" || !description.trim()) return res.status(400).json({ success: false, message: "Solution title and description are required" });
  try {
    const project = await findProject(req.student.id, req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const team = project.studentTeams.find((item) => item.members.some((member) => member.student.id === req.student.id));
    const membership = team?.members.find((member) => member.student.id === req.student.id);
    if (!membership) return res.status(403).json({ success: false, message: "You are not a member of this team" });
    if (submit && membership.role !== "LEADER") {
      return res.status(403).json({ success: false, message: "Only the team leader can submit a solution for university review" });
    }
    const status = submit ? "UNIVERSITY_REVIEW" : "DRAFT";
    const solution = await prisma.$transaction(async (tx) => {
      const saved = await tx.universitySolution.upsert({ where: { teamId: team.id }, update: { title: title.trim(), description: description.trim(), technologies: Array.isArray(technologies) ? technologies : [], estimatedCost: estimatedCost || null, estimatedDuration: estimatedDuration || null, implementationPlan: implementationPlan || null, status }, create: { projectId: project.id, reportId: project.reportId, universityId: project.universityId, teamId: team.id, title: title.trim(), description: description.trim(), technologies: Array.isArray(technologies) ? technologies : [], estimatedCost: estimatedCost || null, estimatedDuration: estimatedDuration || null, implementationPlan: implementationPlan || null, status } });
      if (submit) { await tx.universityProject.update({ where: { id: project.id }, data: { status: "SOLUTION_SUBMITTED" } }); await tx.universityNotification.upsert({ where: { universityId_reportId_type: { universityId: project.universityId, reportId: project.reportId, type: `SOLUTION_SUBMITTED_${team.id}` } }, update: { isRead: false }, create: { universityId: project.universityId, reportId: project.reportId, type: `SOLUTION_SUBMITTED_${team.id}`, title: "Student solution submitted", message: `${team.name} submitted a solution for university review.` } }); }
      return saved;
    });
    return res.json({ success: true, message: submit ? "Solution submitted for university review" : "Solution draft saved", solution });
  } catch (error) { console.error("Student solution error:", error); return res.status(500).json({ success: false, message: "Unable to save solution" }); }
}
