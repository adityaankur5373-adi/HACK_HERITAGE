import prisma from "../config/prisma.js";

const notificationInclude = {
  report: {
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      address: true,
      city: true,
      district: true,
      state: true,
      pincode: true,
    },
  },
};

export async function getUniversityNotifications(req, res) {
  try {
    const notifications = await prisma.universityNotification.findMany({
      where: { universityId: req.university.id },
      include: notificationInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("University notifications error:", error);
    return res.status(500).json({ success: false, message: "Unable to load notifications" });
  }
}

export async function markUniversityNotificationRead(req, res) {
  try {
    const notification = await prisma.universityNotification.findFirst({
      where: { id: req.params.notificationId, universityId: req.university.id },
    });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    const updated = await prisma.universityNotification.update({
      where: { id: notification.id },
      data: { isRead: true },
      include: notificationInclude,
    });
    return res.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Mark university notification read error:", error);
    return res.status(500).json({ success: false, message: "Unable to update notification" });
  }
}
