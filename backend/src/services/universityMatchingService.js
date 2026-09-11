import prisma from "../config/prisma.js";

import {
  generateUniversityRequirements,
  matchUniversitiesByRequirements,
} from "./ai.service.js";


const MAX_RECOMMENDATIONS = 5;


/*
|--------------------------------------------------------------------------
| MATCH UNIVERSITIES FOR VERIFIED REPORT
|--------------------------------------------------------------------------
*/

export async function matchUniversitiesForReport(
  reportId
) {
  console.log(
    `Starting university matching for report ${reportId}`
  );


  // ==========================================================
  // 1. GET VERIFIED REPORT
  // ==========================================================

  const report =
    await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });


  if (!report) {
    throw new Error(
      "Report not found"
    );
  }


  if (
    String(report.status)
      .trim()
      .toUpperCase() !== "VERIFIED"
  ) {
    throw new Error(
      "Only VERIFIED reports can be matched with universities"
    );
  }


  // ==========================================================
  // 2. SEND REPORT TO AI
  // ==========================================================

  const aiResult =
    await generateUniversityRequirements({
      title: report.title,

      description:
        report.description,

      category:
        report.category,

      priority:
        report.priority,

      location: {
        address:
          report.address,

        city:
          report.city,

        district:
          report.district,

        state:
          report.state,

        pincode:
          report.pincode,
      },
    });


  const requirements =
    aiResult?.requirements;


  if (!requirements) {
    throw new Error(
      "AI did not return university requirements"
    );
  }


  console.log(
    "University requirements:"
  );

  console.log(
    JSON.stringify(
      requirements,
      null,
      2
    )
  );


  // ==========================================================
  // 3. SEARCH UNIVERSITY EMBEDDINGS IN QDRANT
  // ==========================================================

  const matches =
    await matchUniversitiesByRequirements(
      requirements
    );


  console.log(
    `Qdrant returned ${matches.length} university matches`
  );


  if (!matches.length) {

    console.log(
      "No matching universities found"
    );

    return [];
  }


  // ==========================================================
  // 4. TAKE TOP RECOMMENDATIONS
  // ==========================================================

  const topMatches =
    matches
      .filter(
        (match) =>
          match.universityId
      )
      .sort(
        (a, b) =>
          Number(b.score || 0) -
          Number(a.score || 0)
      )
      .slice(
        0,
        MAX_RECOMMENDATIONS
      );


  // ==========================================================
  // 5. REMOVE OLD RECOMMENDATIONS
  // ==========================================================

  await prisma.universityRecommendation.deleteMany({
    where: {
      reportId,
    },
  });


  // ==========================================================
  // 6. VERIFY UNIVERSITIES EXIST IN DATABASE
  // ==========================================================

  const uniqueMatches = [
    ...new Map(
      topMatches.map((match) => [match.universityId, match])
    ).values(),
  ];

  const universityIds = uniqueMatches.map(
    (match) => match.universityId
  );


  const universities =
    await prisma.university.findMany({
      where: {
        id: {
          in: universityIds,
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        district: true,
        state: true,
      },
    });


  const universityMap =
    new Map(
      universities.map(
        (university) => [
          university.id,
          university,
        ]
      )
    );


  // ==========================================================
  // 7. SAVE RECOMMENDATIONS
  // ==========================================================

  const recommendationData = [];

  for (const match of uniqueMatches) {

    const university =
      universityMap.get(
        match.universityId
      );


    if (!university) {

      console.log(
        "University not found in PostgreSQL:",
        match.universityId
      );

      continue;
    }


    const score =
      Number(
        (
          Number(match.score || 0) * 100
        ).toFixed(1)
      );


    /*
    |--------------------------------------------------------------------------
    | Build reason from semantic match
    |--------------------------------------------------------------------------
    */

    const reason =
      buildRecommendationReason(
        match,
        requirements
      );


    recommendationData.push({
      reportId,
      universityId: university.id,
      score,
      reason,
      status: "RECOMMENDED",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.universityRecommendation.deleteMany({ where: { reportId } });
    await tx.universityRecommendation.createMany({
      data: recommendationData,
      skipDuplicates: true,
    });
  });

  const savedRecommendations =
    await prisma.universityRecommendation.findMany({
      where: { reportId },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            district: true,
            state: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });


  // ==========================================================
  // 8. LOG RESULT
  // ==========================================================

  console.log(
    `University matching completed. ${savedRecommendations.length} recommendations created.`
  );


  return savedRecommendations;
}


/*
|--------------------------------------------------------------------------
| BUILD RECOMMENDATION REASON
|--------------------------------------------------------------------------
*/

function buildRecommendationReason(
  match,
  requirements
) {

  const parts = [];


  if (
    Array.isArray(match.skills) &&
    match.skills.length
  ) {

    parts.push(
      `Relevant skills: ${match.skills.join(", ")}`
    );

  }


  if (
    Array.isArray(match.researchAreas) &&
    match.researchAreas.length
  ) {

    parts.push(
      `Research areas: ${match.researchAreas.join(", ")}`
    );

  }


  if (
    Array.isArray(match.technologies) &&
    match.technologies.length
  ) {

    parts.push(
      `Technologies: ${match.technologies.join(", ")}`
    );

  }


  if (
    Array.isArray(match.departments) &&
    match.departments.length
  ) {

    parts.push(
      `Departments: ${match.departments.join(", ")}`
    );

  }


  if (!parts.length) {

    return (
      "University capabilities are semantically relevant to the requirements of this verified civic problem."
    );

  }


  return parts.join(" | ");
}