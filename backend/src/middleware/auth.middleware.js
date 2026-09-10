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