import prisma from "../config/prisma.js";

import {
  matchUniversitiesForReport,
} from "../services/universityMatchingService.js";


const STATUS_TRANSITIONS = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],

  UNDER_REVIEW: ["VERIFIED", "REJECTED"],

  VERIFIED: ["REJECTED"],

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


    // ==========================================================
    // 1. VALIDATE STATUS
    // ==========================================================

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }


    const nextStatus = normalize(status);


    // ==========================================================
    // 2. FIND ASSIGNED REPORT
    // ==========================================================

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
        message:
          "Report is not assigned to your government office",
      });
    }


    const currentStatus = normalize(
      assignment.report.status
    );


    // ==========================================================
    // 3. CHECK STATUS TRANSITION
    // ==========================================================

    const allowedTransitions =
      STATUS_TRANSITIONS[currentStatus] || [];


    if (!allowedTransitions.includes(nextStatus)) {
      return res.status(409).json({
        success: false,

        message:
          `Cannot change status from ${currentStatus} to ${nextStatus}`,
      });
    }


    // ==========================================================
    // 4. UPDATE REPORT + HISTORY + ASSIGNMENT
    // ==========================================================

    const result = await prisma.$transaction(
      async (tx) => {

        const updatedReport =
          await tx.report.update({
            where: {
              id: assignment.reportId,
            },

            data: {
              status: nextStatus,
            },
          });


        await tx.reportStatusHistory.create({
          data: {
            reportId:
              assignment.reportId,

            status:
              nextStatus,

            note:
              typeof note === "string"
                ? note.trim() || null
                : null,

            changedBy:
              req.user.id,
          },
        });


        const updatedAssignment =
          await tx.governmentReportAssignment.update({
            where: {
              reportId:
                assignment.reportId,
            },

            data: {
              status:
                nextStatus,

              note:
                typeof note === "string"
                  ? note.trim() || null
                  : null,

              reviewedAt:
                new Date(),
            },
          });


        return {
          updatedReport,
          updatedAssignment,
        };
      }
    );


    // ==========================================================
    // 5. UNIVERSITY MATCHING
    //
    // Only run after report becomes VERIFIED.
    //
    // Matching failure must NOT undo verification.
    // ==========================================================

    let universityRecommendations = [];


    if (nextStatus === "VERIFIED") {

      try {

        universityRecommendations =
          await matchUniversitiesForReport(
            assignment.reportId
          );


        console.log(
          `University matching completed for report ${assignment.reportId}`
        );


      } catch (matchingError) {

        console.error(
          "University matching failed:",
          matchingError
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | The report is already VERIFIED.
        |
        | We do NOT return an error here.
        |
        | Government verification remains successful even
        | if Groq or Qdrant is temporarily unavailable.
        |
        |--------------------------------------------------------------------------
        */
      }
    }


    // ==========================================================
    // 6. RESPONSE
    // ==========================================================

    return res.json({

      success: true,

      message:
        "Report status updated successfully",

      report:
        result.updatedReport,

      assignment:
        result.updatedAssignment,

      universityRecommendations,
    });


  } catch (error) {

    console.error(
      "Government Status Update Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to update report status",
    });
  }
}