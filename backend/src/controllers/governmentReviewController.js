import prisma from "../config/prisma.js";

const STATUS_TRANSITIONS = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],

  UNDER_REVIEW: ["VERIFIED", "REJECTED"],

  VERIFIED: ["ASSIGNED", "REJECTED"],

  ASSIGNED: ["IMPLEMENTATION", "REJECTED"],

  IMPLEMENTATION: ["RESOLVED", "REJECTED"],

  REJECTED: [],

  RESOLVED: [],
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[- ]/g, "_");
}

export async function updateGovernmentReportStatus(req, res) {
  try {
    const government = req.government;

    const {
      status,
      note,
    } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const nextStatus = normalize(status);

    /*
    |--------------------------------------------------------------------------
    | FIND ONLY REPORTS ASSIGNED TO THIS GOVERNMENT OFFICE
    |--------------------------------------------------------------------------
    */

    const assignment =
      await prisma.governmentReportAssignment.findFirst({
        where: {
          reportId: req.params.reportId,
          governmentId: government.id,
        },

        include: {
          report: true,
        },
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Report is not assigned to your government office",
      });
    }

    const currentStatus = normalize(
      assignment.report.status
    );

    /*
    |--------------------------------------------------------------------------
    | CHECK STATUS TRANSITION
    |--------------------------------------------------------------------------
    */

    const allowedTransitions =
      STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(nextStatus)) {
      return res.status(409).json({
        success: false,

        message:
          `Cannot change status from ${currentStatus} to ${nextStatus}`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE REPORT + HISTORY + ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    const result = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: {
          id: assignment.reportId,
        },

        data: {
          status: nextStatus,
        },
      });

      await tx.reportStatusHistory.create({
        data: {
          reportId: assignment.reportId,

          status: nextStatus,

          note:
            typeof note === "string"
              ? note.trim() || null
              : null,

          changedBy: req.user.id,
        },
      });

      const updatedAssignment =
        await tx.governmentReportAssignment.update({
          where: {
            reportId: assignment.reportId,
          },

          data: {
            status: nextStatus,

            note:
              typeof note === "string"
                ? note.trim() || null
                : null,

            reviewedAt: new Date(),
          },
        });

      return {
        updatedReport,
        updatedAssignment,
      };
    });

    return res.json({
      success: true,

      message: "Report status updated successfully",

      report: result.updatedReport,

      assignment: result.updatedAssignment,
    });
  } catch (error) {
    console.error(
      "Government Status Update Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
    });
  }
}