import prisma from "../config/prisma.js";

export const uploadReportMedia = async (req, res) => {
  try {
    const { reportId } = req.params;

    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    // Find citizen
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

    // Make sure report belongs to citizen
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

    const media = [];

    for (const file of req.files) {
      let type;

      if (file.mimetype.startsWith("image/")) {
        type = "IMAGE";
      } else if (file.mimetype.startsWith("video/")) {
        type = "VIDEO";
      } else {
        continue;
      }

      const savedMedia = await prisma.reportMedia.create({
        data: {
          reportId: report.id,
          type,
          url: `/uploads/reports/${file.filename}`,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });

      media.push(savedMedia);
    }

    return res.status(201).json({
      message: "Media uploaded successfully",
      media,
    });

  } catch (error) {
    console.error("Upload Media Error:", error);

    return res.status(500).json({
      message: "Failed to upload media",
    });
  }
};