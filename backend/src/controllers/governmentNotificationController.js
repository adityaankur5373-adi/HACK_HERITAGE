import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| STATUS → NOTIFICATION
|--------------------------------------------------------------------------
*/

function buildNotification(status, report) {
  const location = [
    report.address,
    report.city,
    report.district,
    report.state,
  ]
    .filter(Boolean)
    .join(", ");

  switch (status?.toUpperCase()) {
    case "SUBMITTED":
      return {
        type: "NEW_REPORT",
        title: "New report requires review",
        message:
          "A new citizen report has been assigned to your department.",
      };

    case "UNDER_REVIEW":
      return {
        type: "REVIEW",
        title: "Report is under review",
        message:
          "This report is currently being reviewed by your department.",
      };

    case "VERIFIED":
      return {
        type: "VERIFIED",
        title: "Report verified",
        message:
          "The report has been successfully verified and is ready for assignment.",
      };

    case "ASSIGNED":
      return {
        type: "ASSIGNED",
        title: "Report assigned for implementation",
        message:
          "A verified report has been assigned for further implementation.",
      };

    case "IMPLEMENTATION":
      return {
        type: "IMPLEMENTATION",
        title: "Implementation started",
        message:
          "The assigned team has started working on the reported problem.",
      };

    case "RESOLVED":
      return {
        type: "RESOLVED",
        title: "Report marked as resolved",
        message:
          "The reported issue has been successfully resolved.",
      };

    case "REJECTED":
      return {
        type: "REJECTED",
        title: "Report rejected",
        message:
          "A report has been rejected. Review the report for the rejection note.",
      };

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| CREATE / SYNC NOTIFICATIONS
|--------------------------------------------------------------------------
*/

async function syncGovernmentNotifications(governmentId) {
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
    });

  const notifications = [];

  for (const assignment of assignments) {
    const report = assignment.report;

    /*
    |--------------------------------------------------------------------------
    | STATUS HISTORY NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    for (const history of report.statusHistory) {
      const notification = buildNotification(
        history.status,
        report
      );

      if (!notification) {
        continue;
      }

      notifications.push({
        governmentId,
        reportId: report.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: history.createdAt,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | HIGH PRIORITY NOTIFICATION
    |--------------------------------------------------------------------------
    */

    if (
      ["HIGH", "CRITICAL"].includes(
        String(report.priority || "").toUpperCase()
      )
    ) {
      notifications.push({
        governmentId,
        reportId: report.id,
        type: "HIGH_PRIORITY",
        title: "High-priority report assigned",
        message:
          "A high-priority report requires your immediate attention.",
        createdAt: assignment.assignedAt,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPSERT NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  for (const notification of notifications) {
    await prisma.governmentNotification.upsert({
      where: {
        governmentId_reportId_type: {
          governmentId: notification.governmentId,
          reportId: notification.reportId,
          type: notification.type,
        },
      },

      update: {},

      create: notification,
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET GOVERNMENT NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export async function getGovernmentNotifications(req, res) {
  try {
    const governmentId = req.government.id;

    await syncGovernmentNotifications(governmentId);

    const notifications =
      await prisma.governmentNotification.findMany({
        where: {
          governmentId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Government Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
}

/*
|--------------------------------------------------------------------------
| MARK ONE NOTIFICATION AS READ
|--------------------------------------------------------------------------
*/

export async function markGovernmentNotificationRead(
  req,
  res
) {
  try {
    const governmentId = req.government.id;
    const { notificationId } = req.params;

    const notification =
      await prisma.governmentNotification.findFirst({
        where: {
          id: notificationId,
          governmentId,
        },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const updated =
      await prisma.governmentNotification.update({
        where: {
          id: notification.id,
        },

        data: {
          isRead: true,
        },
      });

    return res.json({
      success: true,
      notification: updated,
    });
  } catch (error) {
    console.error(
      "Mark Government Notification Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
}

/*
|--------------------------------------------------------------------------
| MARK ALL NOTIFICATIONS AS READ
|--------------------------------------------------------------------------
*/

export async function markAllGovernmentNotificationsRead(
  req,
  res
) {
  try {
    const governmentId = req.government.id;

    await prisma.governmentNotification.updateMany({
      where: {
        governmentId,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark All Government Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
}