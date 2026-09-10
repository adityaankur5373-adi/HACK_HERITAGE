import prisma from "../config/prisma.js";



export async function routeReportToGovernment(reportId) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status === "DRAFT") {
    return {
      assigned: false,
      reason: "DRAFT_REPORT",
    };
  }

  const routing = await findGovernmentForReport(report);

  if (!routing) {
    return {
      assigned: false,
      reason: "NO_GOVERNMENT_OFFICE_FOUND",
      department: getDepartmentFromCategory(report.category),
    };
  }

  const { government, department, routingLevel } = routing;

  const assignment = await prisma.governmentReportAssignment.upsert({
    where: {
      reportId: report.id,
    },

    create: {
      reportId: report.id,
      governmentId: government.id,
      department,
      status: "ASSIGNED",
      note: `Automatically routed using ${routingLevel} location routing.`,
    },

    update: {
      governmentId: government.id,
      department,
      status: "ASSIGNED",
      note: `Automatically routed using ${routingLevel} location routing.`,
      reviewedAt: null,
    },
  });

  return {
    assigned: true,
    assignment,
    government,
    department,
    routingLevel,
  };
}