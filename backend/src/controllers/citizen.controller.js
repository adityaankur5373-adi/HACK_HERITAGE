import prisma from "../config/prisma.js";
import { sendToAI } from "../services/ai.service.js";

export const reportProblem = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const userId = req.user.id;

    // --------------------------------------------------
    // GET CITIZEN
    // --------------------------------------------------

    const citizen = await prisma.citizen.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen profile not found",
      });
    }

    // --------------------------------------------------
    // GET OR CREATE CONVERSATION
    // --------------------------------------------------

    let conversation;

    if (conversationId) {
      conversation =
        await prisma.reportConversation.findFirst({
          where: {
            id: conversationId,
            citizenId: citizen.id,
            status: "ACTIVE",
          },
        });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }
    } else {
      conversation =
        await prisma.reportConversation.create({
          data: {
            citizenId: citizen.id,
          },
        });
    }

    // --------------------------------------------------
    // SAVE USER MESSAGE
    // --------------------------------------------------

    await prisma.reportMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message.trim(),
      },
    });

    // --------------------------------------------------
    // GET PREVIOUS MESSAGES
    // --------------------------------------------------

    const messages =
      await prisma.reportMessage.findMany({
        where: {
          conversationId: conversation.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    // --------------------------------------------------
    // SEND TO AI
    // --------------------------------------------------

    const aiResponse = await sendToAI({
      messages,
      citizenLocation: {
        address: citizen.address,
        city: citizen.city,
        district: citizen.district,
        state: citizen.state,
        pincode: citizen.pincode,
      },
    });

    // --------------------------------------------------
    // SAVE AI QUESTION
    // --------------------------------------------------

    if (aiResponse.question) {
      await prisma.reportMessage.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: aiResponse.question,
        },
      });
    }

    // --------------------------------------------------
    // CREATE / UPDATE DRAFT REPORT
    // --------------------------------------------------

    let report = null;

    if (
      aiResponse.status === "READY" &&
      aiResponse.problem
    ) {
      const problem = aiResponse.problem;

      report = await prisma.report.upsert({
        where: {
          conversationId: conversation.id,
        },

        create: {
          citizenId: citizen.id,
          conversationId: conversation.id,

          title: problem.title,
          description: problem.description,
          category: problem.category,
          priority: problem.priority,

          address: problem.location?.address || null,
          city: problem.location?.city || null,
          district: problem.location?.district || null,
          state: problem.location?.state || null,
          pincode: problem.location?.pincode || null,

          status: "DRAFT",
        },

        update: {
          title: problem.title,
          description: problem.description,
          category: problem.category,
          priority: problem.priority,

          address: problem.location?.address || null,
          city: problem.location?.city || null,
          district: problem.location?.district || null,
          state: problem.location?.state || null,
          pincode: problem.location?.pincode || null,

          status: "DRAFT",
        },
      });
    }

    // --------------------------------------------------
    // RETURN TO REACT
    // --------------------------------------------------

    return res.status(200).json({
      conversationId: conversation.id,
      reportId: report?.id || null,

      ...aiResponse,
    });

  } catch (error) {
    console.error("Report Problem Error:", error);

    return res.status(500).json({
      message: "Failed to process report",
    });
  }
};


export const submitReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const userId = req.user.id;

    // --------------------------------------------------
    // GET CITIZEN
    // --------------------------------------------------

    const citizen = await prisma.citizen.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen profile not found",
      });
    }

    // --------------------------------------------------
    // FIND DRAFT REPORT
    // --------------------------------------------------

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        citizenId: citizen.id,
        status: "DRAFT",
      },
    });

    if (!report) {
      return res.status(404).json({
        message: "Draft report not found",
      });
    }

    // --------------------------------------------------
    // SUBMIT REPORT + CREATE HISTORY
    // --------------------------------------------------

    const submittedReport = await prisma.$transaction(
      async (tx) => {

        // 1. Change report status
        const updatedReport = await tx.report.update({
          where: {
            id: report.id,
          },
          data: {
            status: "SUBMITTED",
          },
        });

        // 2. Create first status history
        await tx.reportStatusHistory.create({
          data: {
            reportId: report.id,
            status: "SUBMITTED",
            note: "Report submitted by citizen",
            changedBy: citizen.id,
          },
        });

        return updatedReport;
      }
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      message: "Report submitted successfully",

      report: submittedReport,
    });

  } catch (error) {
    console.error("Submit Report Error:", error);

    return res.status(500).json({
      message: "Failed to submit report",
    });
  }
};