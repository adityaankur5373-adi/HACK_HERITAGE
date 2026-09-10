import prisma from "../config/prisma.js";

const STATUS_ORDER = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "ASSIGNED",
  "IMPLEMENTATION",
  "RESOLVED",
  "REJECTED",
];

export async function getGovernmentAnalytics(req, res) {
  try {
    const governmentId = req.government.id;

    /*
    |--------------------------------------------------------------------------
    | GET REPORTS ASSIGNED TO THIS GOVERNMENT
    |--------------------------------------------------------------------------
    */

    const assignments =
      await prisma.governmentReportAssignment.findMany({
        where: {
          governmentId,
        },
        include: {
          report: {
            include: {
              statusHistory: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          assignedAt: "asc",
        },
      });

    const reports = assignments.map(
      (assignment) => assignment.report
    );

    /*
    |--------------------------------------------------------------------------
    | BASIC COUNTS
    |--------------------------------------------------------------------------
    */

    const totalReports = reports.length;

    const resolvedReports = reports.filter(
      (report) =>
        String(report.status).toUpperCase() ===
        "RESOLVED"
    ).length;

    const rejectedReports = reports.filter(
      (report) =>
        String(report.status).toUpperCase() ===
        "REJECTED"
    ).length;

    const pendingReports = reports.filter(
      (report) =>
        ![
          "RESOLVED",
          "REJECTED",
        ].includes(
          String(report.status).toUpperCase()
        )
    ).length;

    const highPriorityReports =
      reports.filter((report) =>
        ["HIGH", "CRITICAL"].includes(
          String(report.priority || "").toUpperCase()
        )
      ).length;

    /*
    |--------------------------------------------------------------------------
    | STATUS DISTRIBUTION
    |--------------------------------------------------------------------------
    */

    const statusDistribution =
      STATUS_ORDER.map((status) => ({
        status,
        count: reports.filter(
          (report) =>
            String(report.status).toUpperCase() ===
            status
        ).length,
      }));

    /*
    |--------------------------------------------------------------------------
    | CATEGORY DISTRIBUTION
    |--------------------------------------------------------------------------
    */

    const categoryMap = {};

    for (const report of reports) {
      const category =
        String(report.category || "OTHER")
          .trim()
          .toUpperCase();

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    }

    const categoryDistribution =
      Object.entries(categoryMap)
        .map(([category, count]) => ({
          category,
          count,
        }))
        .sort((a, b) => b.count - a.count);

    /*
    |--------------------------------------------------------------------------
    | PRIORITY DISTRIBUTION
    |--------------------------------------------------------------------------
    */

    const priorityMap = {};

    for (const report of reports) {
      const priority =
        String(report.priority || "UNKNOWN")
          .trim()
          .toUpperCase();

      priorityMap[priority] =
        (priorityMap[priority] || 0) + 1;
    }

    const priorityDistribution =
      Object.entries(priorityMap)
        .map(([priority, count]) => ({
          priority,
          count,
        }))
        .sort((a, b) => b.count - a.count);

    /*
    |--------------------------------------------------------------------------
    | LOCATION DISTRIBUTION
    |--------------------------------------------------------------------------
    */

    const locationMap = {};

    for (const report of reports) {
      const location =
        report.city ||
        report.district ||
        report.state ||
        "Unknown";

      locationMap[location] =
        (locationMap[location] || 0) + 1;
    }

    const locationDistribution =
      Object.entries(locationMap)
        .map(([location, count]) => ({
          location,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    /*
    |--------------------------------------------------------------------------
    | MONTHLY TREND - LAST 6 MONTHS
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    const monthlyMap = {};

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyMap[key] = {
        month: key,
        label: date.toLocaleDateString(
          "en-IN",
          {
            month: "short",
            year: "numeric",
          }
        ),
        count: 0,
      };
    }

    for (const report of reports) {
      const createdAt = new Date(
        report.createdAt
      );

      const key = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyMap[key]) {
        monthlyMap[key].count += 1;
      }
    }

    const monthlyTrend =
      Object.values(monthlyMap);

    /*
    |--------------------------------------------------------------------------
    | AVERAGE RESOLUTION TIME
    |--------------------------------------------------------------------------
    */

    const resolutionTimes = [];

    for (const report of reports) {
      const history =
        report.statusHistory || [];

      const submittedEntry =
        history.find(
          (item) =>
            String(item.status).toUpperCase() ===
            "SUBMITTED"
        );

      const resolvedEntry =
        history.find(
          (item) =>
            String(item.status).toUpperCase() ===
            "RESOLVED"
        );

      if (
        submittedEntry &&
        resolvedEntry
      ) {
        const start = new Date(
          submittedEntry.createdAt
        );

        const end = new Date(
          resolvedEntry.createdAt
        );

        const difference =
          end.getTime() -
          start.getTime();

        if (difference >= 0) {
          resolutionTimes.push(
            difference /
              (1000 * 60 * 60 * 24)
          );
        }
      }
    }

    const averageResolutionDays =
      resolutionTimes.length > 0
        ? Number(
            (
              resolutionTimes.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
              resolutionTimes.length
            ).toFixed(1)
          )
        : 0;

    /*
    |--------------------------------------------------------------------------
    | RESOLUTION RATE
    |--------------------------------------------------------------------------
    */

    const resolutionRate =
      totalReports > 0
        ? Number(
            (
              (resolvedReports /
                totalReports) *
              100
            ).toFixed(1)
          )
        : 0;

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      summary: {
        totalReports,
        resolvedReports,
        pendingReports,
        rejectedReports,
        highPriorityReports,
        resolutionRate,
        averageResolutionDays,
      },

      statusDistribution,

      categoryDistribution,

      priorityDistribution,

      locationDistribution,

      monthlyTrend,
    });
  } catch (error) {
    console.error(
      "Government Analytics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load government analytics",
    });
  }
}