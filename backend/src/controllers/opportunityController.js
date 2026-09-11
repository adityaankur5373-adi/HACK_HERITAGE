import prisma from "../config/prisma.js";

const reportFields = {
  id: true,
  title: true,
  description: true,
  category: true,
  priority: true,
  status: true,
  address: true,
  city: true,
  district: true,
  state: true,
  pincode: true,
};

export async function getUniversityOpportunities(req, res) {
  try {
    const recommendations = await prisma.universityRecommendation.findMany({
      where: { universityId: req.university.id },
      include: { report: { select: reportFields } },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });
    return res.json({ success: true, opportunities: recommendations });
  } catch (error) {
    console.error("University opportunities error:", error);
    return res.status(500).json({ success: false, message: "Unable to load opportunities" });
  }
}

export async function getIndustryOpportunities(req, res) {
  try {
    const recommendations = await prisma.industryRecommendation.findMany({
      where: { industryId: req.industry.id },
      include: {
        report: {
          select: {
            ...reportFields,
            universitySolutions: {
              where: { status: "APPROVED" },
              select: {
                id: true,
                title: true,
                description: true,
                technologies: true,
                implementationPlan: true,
                university: { select: { id: true, name: true } },
              },
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    });
    return res.json({ success: true, opportunities: recommendations });
  } catch (error) {
    console.error("Industry opportunities error:", error);
    return res.status(500).json({ success: false, message: "Unable to load opportunities" });
  }
}
