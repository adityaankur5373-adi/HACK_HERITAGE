import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export async function requireCitizen(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { citizen: true },
    });

    if (!user || user.role !== "CITIZEN" || !user.citizen || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Active citizen access required",
      });
    }

    req.citizen = user.citizen;
    next();
  } catch (error) {
    console.error("Citizen Authentication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify citizen access",
    });
  }
}

export async function requireGovernment(
  req,
  res,
  next
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      include: {
        government: true,
      },
    });

    if (
      !user ||
      user.role !== "GOVERNMENT" ||
      !user.government ||
      !user.isActive
    ) {
      return res.status(403).json({
        success: false,
        message: "Government access required",
      });
    }

    req.government = user.government;

    next();
  } catch (error) {
    console.error(
      "Government Authentication Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify government access",
    });
  }
}


export async function requireUniversity(
  req,
  res,
  next
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      include: {
        university: true,
      },
    });

    if (
      !user ||
      user.role !== "UNIVERSITY" ||
      !user.university ||
      !user.isActive
    ) {
      return res.status(403).json({
        success: false,
        message: "University access required",
      });
    }

    req.university = user.university;

    next();
  } catch (error) {
    console.error(
      "University Authentication Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify university access",
    });
  }
}

export async function requireStudent(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id }, include: { student: true } });
    if (!user || user.role !== "STUDENT" || !user.student || !user.isActive) return res.status(403).json({ success: false, message: "Student access required" });
    req.student = user.student;
    next();
  } catch (error) {
    console.error("Student Authentication Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify student access" });
  }
}

export async function requireIndustry(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id }, include: { industry: true } });
    if (!user || user.role !== "INDUSTRY" || !user.industry || !user.isActive) return res.status(403).json({ success: false, message: "Industry access required" });
    req.industry = user.industry;
    next();
  } catch (error) {
    console.error("Industry Authentication Error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify industry access" });
  }
}
