import prisma from "../config/prisma.js";

export const getReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const citizen = await prisma.citizen.findUnique({
      where: {
        userId,
      },
    });

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen profile not found",
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        citizenId: citizen.id,
      },
      include: {
        media: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const citizen = await prisma.citizen.findUnique({
      where: {
        userId,
      },
    });

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen profile not found",
      });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        media: true,
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
        supports: {
          where: {
            citizenId: citizen.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            supports: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const { supports, _count, ...reportData } = report;

    return res.status(200).json({
      success: true,
      report: {
        ...reportData,
        supportCount: _count.supports,
        supportedByMe: supports.length > 0,
      },
    });
  } catch (error) {
    console.error("Get Report By Id Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report details",
    });
  }
};

export const supportReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const userId = req.user.id;

    // ---------------------------------------------
    // GET CITIZEN
    // ---------------------------------------------

    const citizen = await prisma.citizen.findUnique({
      where: {
        userId,
      },
    });

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen profile not found",
      });
    }

    // ---------------------------------------------
    // CHECK REPORT
    // ---------------------------------------------

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ---------------------------------------------
    // CHECK ALREADY SUPPORTED
    // ---------------------------------------------

    const existingSupport =
      await prisma.reportSupport.findUnique({
        where: {
          reportId_citizenId: {
            reportId: report.id,
            citizenId: citizen.id,
          },
        },
      });

    if (existingSupport) {
      return res.status(409).json({
        message: "You have already supported this report",
      });
    }

    // ---------------------------------------------
    // CREATE SUPPORT
    // ---------------------------------------------

    await prisma.reportSupport.create({
      data: {
        reportId: report.id,
        citizenId: citizen.id,
      },
    });

    // ---------------------------------------------
    // GET UPDATED SUPPORT COUNT
    // ---------------------------------------------

    const supportCount =
      await prisma.reportSupport.count({
        where: {
          reportId: report.id,
        },
      });

    return res.status(200).json({
      message: "Report supported successfully",

      reportId: report.id,

      supportCount,

      supportedByMe: true,
    });

  } catch (error) {
    console.error(
      "Support Report Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to support report",
    });
  }
};