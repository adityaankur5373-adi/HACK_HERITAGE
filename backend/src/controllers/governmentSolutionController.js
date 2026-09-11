import prisma from "../config/prisma.js";
import { matchIndustriesForSolution } from "../services/industryMatchingService.js";

const includeSolution = { university: { select: { id: true, name: true, city: true, state: true } }, team: { select: { id: true, name: true } } };

export async function getGovernmentReportSolutions(req, res) {
  try {
    const assignment = await prisma.governmentReportAssignment.findFirst({ where: { reportId: req.params.reportId, governmentId: req.government.id }, include: { report: { select: { status: true } } } });
    if (!assignment) return res.status(404).json({ success: false, message: "Report is not assigned to your government office" });
    const solutions = await prisma.universitySolution.findMany({ where: { reportId: assignment.reportId, status: { in: ["UNIVERSITY_APPROVED", "APPROVED", "NOT_SELECTED"] } }, include: includeSolution, orderBy: { updatedAt: "desc" } });
    return res.json({ success: true, solutions });
  } catch (error) { console.error("Government solutions error:", error); return res.status(500).json({ success: false, message: "Unable to load approved solutions" }); }
}

export async function selectGovernmentSolution(req, res) {
  try {
    const solution = await prisma.universitySolution.findUnique({ where: { id: req.params.solutionId } });
    if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });
    const assignment = await prisma.governmentReportAssignment.findFirst({ where: { reportId: solution.reportId, governmentId: req.government.id }, include: { report: { select: { status: true } } } });
    if (!assignment) return res.status(403).json({ success: false, message: "You cannot select a solution for this report" });
    if (assignment.report.status !== "VERIFIED") return res.status(409).json({ success: false, message: "Final solutions can only be selected for verified reports" });
    if (solution.status !== "UNIVERSITY_APPROVED") return res.status(409).json({ success: false, message: "Only university-approved solutions may be selected" });
    const existing = await prisma.universitySolution.findFirst({ where: { reportId: solution.reportId, status: "APPROVED" } });
    if (existing) return res.status(409).json({ success: false, message: "A final solution has already been selected for this report" });
    const [, selected] = await prisma.$transaction([
      prisma.universitySolution.updateMany({
        where: {
          reportId: solution.reportId,
          status: "UNIVERSITY_APPROVED",
          id: { not: solution.id },
        },
        data: { status: "NOT_SELECTED" },
      }),
      prisma.universitySolution.update({
        where: { id: solution.id },
        data: { status: "APPROVED" },
        include: includeSolution,
      }),
    ]);
    try {
      await matchIndustriesForSolution(selected.id);
    } catch (error) {
      console.error("Industry matching failed:", error);
    }
    return res.json({ success: true, message: "Final solution selected", solution: selected });
  } catch (error) { console.error("Government solution selection error:", error); return res.status(500).json({ success: false, message: "Unable to select final solution" }); }
}
