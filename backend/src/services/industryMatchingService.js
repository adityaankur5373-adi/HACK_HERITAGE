import prisma from "../config/prisma.js";
import {
  generateIndustryRequirements,
  matchIndustriesByRequirements,
} from "./ai.service.js";

const MAX_RECOMMENDATIONS = 5;

const normalize = (value) => String(value || "").trim().toLowerCase();

function overlappingValues(capabilities, requirements) {
  const wanted = new Set((requirements || []).map(normalize).filter(Boolean));
  return (capabilities || []).filter((value) => wanted.has(normalize(value)));
}

function buildRecommendationReason(match, requirements) {
  const parts = [];
  const labels = [
    ["skills", "Relevant skills"],
    ["technologies", "Relevant technologies"],
    ["services", "Relevant services"],
    ["domains", "Relevant domains"],
  ];
  for (const [field, label] of labels) {
    const common = overlappingValues(match[field], requirements[field]);
    if (common.length) parts.push(`${label}: ${common.join(", ")}`);
  }
  if (match.locationScore === 1) parts.push("Location: Same area, city, district and state");
  else if (match.locationScore === 0.85) parts.push("Location: Same city, district and state");
  else if (match.locationScore === 0.7) parts.push("Location: Same district and state");
  else if (match.locationScore === 0.55) parts.push("Location: Same state");
  return parts.join(" | ") || "Industry capabilities are semantically relevant to this approved solution.";
}

export async function matchIndustriesForSolution(solutionId) {
  const solution = await prisma.universitySolution.findUnique({
    where: { id: solutionId },
    include: {
      report: true,
    },
  });
  if (!solution) throw new Error("Solution not found");
  if (String(solution.status).trim().toUpperCase() !== "APPROVED") {
    throw new Error("Only APPROVED solutions can be matched with industries");
  }
  if (!solution.report || String(solution.report.status).trim().toUpperCase() !== "VERIFIED") {
    throw new Error("Industry matching requires a VERIFIED report");
  }

  const solutionForAI = {
    title: solution.title,
    description: solution.description,
    technologies: solution.technologies || [],
    implementationPlan: solution.implementationPlan,
    report: {
      title: solution.report.title,
      description: solution.report.description,
      category: solution.report.category,
      priority: solution.report.priority,
      location: {
        address: solution.report.address,
        area: null,
        city: solution.report.city,
        district: solution.report.district,
        state: solution.report.state,
        pincode: solution.report.pincode,
      },
    },
  };
  const aiResult = await generateIndustryRequirements(solutionForAI);
  const requirements = aiResult?.requirements;
  if (!requirements) throw new Error("AI did not return industry requirements");

  const matches = await matchIndustriesByRequirements(requirements);
  const topMatches = matches
    .filter((match) => match.industryId)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, MAX_RECOMMENDATIONS);

  const industryIds = [...new Set(topMatches.map((match) => match.industryId))];
  const industries = await prisma.industry.findMany({
    where: { id: { in: industryIds } },
    select: { id: true },
  });
  const validIndustryIds = new Set(industries.map((industry) => industry.id));

  // Replacing the set makes retries idempotent and removes stale recommendations.
  await prisma.industryRecommendation.deleteMany({ where: { reportId: solution.reportId } });
  const saved = [];
  for (const match of topMatches) {
    if (!validIndustryIds.has(match.industryId)) continue;
    saved.push(await prisma.industryRecommendation.create({
      data: {
        reportId: solution.reportId,
        industryId: match.industryId,
        score: Number(match.score),
        reason: buildRecommendationReason(match, requirements),
        status: "RECOMMENDED",
      },
      include: { industry: { select: { id: true, name: true, city: true, district: true, state: true } } },
    }));
  }
  return saved;
}
