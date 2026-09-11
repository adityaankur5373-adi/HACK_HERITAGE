import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| CATEGORY → GOVERNMENT DEPARTMENT
|--------------------------------------------------------------------------
*/

const DEPARTMENT_BY_CATEGORY = {
  WATER: "Water Department",

  SANITATION: "Sanitation Department",
  WASTE: "Sanitation Department",
  "WASTE MANAGEMENT": "Sanitation Department",
  GARBAGE: "Sanitation Department",
  "GARBAGE COLLECTION": "Sanitation Department",

  ROAD: "Public Works Department",
  ROADS: "Public Works Department",
  POTHOLE: "Public Works Department",

  ELECTRICITY: "Electricity Department",
  POWER: "Electricity Department",

  HEALTH: "Health Department",
  HEALTHCARE: "Health Department",

  EDUCATION: "Education Department",

  TRANSPORT: "Transport Department",

  AGRICULTURE: "Agriculture Department",

  ENVIRONMENT: "Environment Department",

  DRAINAGE: "Municipal Corporation",
  STREET_LIGHT: "Municipal Corporation",
  MUNICIPAL: "Municipal Corporation",
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

function getDepartmentFromCategory(category) {
  const normalizedCategory = normalize(category);

  return (
    DEPARTMENT_BY_CATEGORY[normalizedCategory] ||
    "Municipal Corporation"
  );
}

/*
|--------------------------------------------------------------------------
| FIND GOVERNMENT OFFICE
|--------------------------------------------------------------------------
|
| Priority:
|
| 1. Same department + district + state
| 2. Same department + district
| 3. Same department + state
| 4. Same department
|
|--------------------------------------------------------------------------
*/

async function findGovernmentForReport(report) {
  const normalizedCategory = normalize(report.category);
  const department = getDepartmentFromCategory(report.category);

  const district = report.district?.trim();
  const state = report.state?.trim();

  console.log("========== GOVERNMENT ROUTING ==========");
  console.log("Raw report category:", report.category);
  console.log("Normalized category:", normalizedCategory);
  console.log("Mapped department:", department);
  console.log("Report city:", report.city);
  console.log("Report district:", report.district);
  console.log("Report state:", report.state);
  console.log("Report pincode:", report.pincode);
  console.log("========================================");

  /*
  |--------------------------------------------------------------------------
  | 1. Exact department + district + state
  |--------------------------------------------------------------------------
  */

  if (district && state) {
    const exactGovernment = await prisma.government.findFirst({
      where: {
        department: {
          equals: department,
          mode: "insensitive",
        },

        district: {
          equals: district,
          mode: "insensitive",
        },

        state: {
          equals: state,
          mode: "insensitive",
        },

        user: {
          isActive: true,
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    if (exactGovernment) {
      return {
        government: exactGovernment,
        department,
        routingLevel: "DISTRICT_STATE",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Same department + district
  |--------------------------------------------------------------------------
  */

  if (district) {
    const districtGovernment = await prisma.government.findFirst({
      where: {
        department: {
          equals: department,
          mode: "insensitive",
        },

        district: {
          equals: district,
          mode: "insensitive",
        },

        user: {
          isActive: true,
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    if (districtGovernment) {
      return {
        government: districtGovernment,
        department,
        routingLevel: "DISTRICT",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 3. Same department + state
  |--------------------------------------------------------------------------
  */

  if (state) {
    const stateGovernment = await prisma.government.findFirst({
      where: {
        department: {
          equals: department,
          mode: "insensitive",
        },

        state: {
          equals: state,
          mode: "insensitive",
        },

        user: {
          isActive: true,
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    if (stateGovernment) {
      return {
        government: stateGovernment,
        department,
        routingLevel: "STATE",
      };
    }
  }

  // Do not route a location-bearing report to an unrelated department-only
  // office when no compatible district/state office exists.
  if (district || state) {
    console.log("No location-compatible government office found:", {
      department,
      district,
      state,
    });
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | 4. Department only
  |--------------------------------------------------------------------------
  */

  const departmentGovernment = await prisma.government.findFirst({
    where: {
      department: {
        equals: department,
        mode: "insensitive",
      },

      user: {
        isActive: true,
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  if (departmentGovernment) {
    return {
      government: departmentGovernment,
      department,
      routingLevel: "DEPARTMENT",
    };
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| AUTO ASSIGN REPORT
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GOVERNMENT DASHBOARD
|--------------------------------------------------------------------------
*/

export async function getGovernmentDashboard(req, res) {
  try {
    const government = req.government;

    const assignments =
      await prisma.governmentReportAssignment.findMany({
        where: {
          governmentId: government.id,
        },

        include: {
          report: {
            include: {
              citizen: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  district: true,
                },
              },

              media: true,

              statusHistory: {
                orderBy: {
                  createdAt: "asc",
                },
              },

              // NEW: University recommendations
              universityRecommendations: {
                orderBy: {
                  score: "desc",
                },

                include: {
                  university: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      city: true,
                      district: true,
                      state: true,
                      pincode: true,
                    },
                  },
                },
              },

              _count: {
                select: {
                  supports: true,
                },
              },
            },
          },
        },

        orderBy: {
          assignedAt: "desc",
        },
      });

    const reports = assignments.map((assignment) => ({
      ...assignment.report,

      assignment: {
        id: assignment.id,
        department: assignment.department,
        status: assignment.status,
        note: assignment.note,
        assignedAt: assignment.assignedAt,
        reviewedAt: assignment.reviewedAt,
      },

      responsibleDepartment: assignment.department,

      supportCount: assignment.report._count.supports,
    }));

    const count = (status) =>
      reports.filter(
        (report) =>
          normalize(report.status) === normalize(status)
      ).length;

    return res.json({
      success: true,

      data: {
        government,

        summary: {
          total: reports.length,

          submitted: count("SUBMITTED"),

          underReview: count("UNDER_REVIEW"),

          verified: count("VERIFIED"),

          assigned: count("ASSIGNED"),

          implementation: count("IMPLEMENTATION"),

          resolved: count("RESOLVED"),

          rejected: count("REJECTED"),

          highPriority: reports.filter((report) =>
            ["HIGH", "CRITICAL"].includes(
              normalize(report.priority)
            )
          ).length,
        },

        recentReports: reports.slice(0, 8),
      },
    });
  } catch (error) {
    console.error("Government Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load government dashboard",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET GOVERNMENT REPORTS
|--------------------------------------------------------------------------
*/

export async function getGovernmentReports(req, res) {
  try {
    const government = req.government;

    const status = req.query.status
      ? normalize(req.query.status)
      : null;

    const assignments =
      await prisma.governmentReportAssignment.findMany({
        where: {
          governmentId: government.id,

          ...(status
            ? {
                status: {
                  equals: status,
                  mode: "insensitive",
                },
              }
            : {}),
        },

        include: {
          report: {
            include: {
              citizen: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  district: true,
                },
              },

              media: true,

              statusHistory: {
                orderBy: {
                  createdAt: "asc",
                },
              },

              // NEW: University recommendations
              universityRecommendations: {
                orderBy: {
                  score: "desc",
                },

                include: {
                  university: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      city: true,
                      district: true,
                      state: true,
                      pincode: true,
                    },
                  },
                },
              },

              _count: {
                select: {
                  supports: true,
                },
              },
            },
          },
        },

        orderBy: {
          assignedAt: "desc",
        },
      });

    const reports = assignments.map((assignment) => ({
      ...assignment.report,

      assignment: {
        id: assignment.id,
        department: assignment.department,
        status: assignment.status,
        note: assignment.note,
        assignedAt: assignment.assignedAt,
        reviewedAt: assignment.reviewedAt,
      },

      responsibleDepartment: assignment.department,

      supportCount: assignment.report._count.supports,
    }));

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Government Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load government reports",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET SINGLE GOVERNMENT REPORT
|--------------------------------------------------------------------------
*/

export async function getGovernmentReportById(req, res) {
  try {
    const government = req.government;

    const assignment =
      await prisma.governmentReportAssignment.findFirst({
        where: {
          reportId: req.params.reportId,
          governmentId: government.id,
        },

        include: {
          report: {
            include: {
              citizen: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  district: true,
                },
              },

              media: true,

              statusHistory: {
                orderBy: {
                  createdAt: "asc",
                },
              },

              // NEW: University recommendations
              universityRecommendations: {
                orderBy: {
                  score: "desc",
                },

                include: {
                  university: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      city: true,
                      district: true,
                      state: true,
                      pincode: true,
                    },
                  },
                },
              },

              _count: {
                select: {
                  supports: true,
                },
              },
            },
          },
        },
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Report not found or not assigned to your office",
      });
    }

    return res.json({
      success: true,

      report: {
        ...assignment.report,

        assignment: {
          id: assignment.id,
          department: assignment.department,
          status: assignment.status,
          note: assignment.note,
          assignedAt: assignment.assignedAt,
          reviewedAt: assignment.reviewedAt,
        },

        responsibleDepartment: assignment.department,

        supportCount: assignment.report._count.supports,
      },
    });
  } catch (error) {
    console.error("Government Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load report",
    });
  }
}