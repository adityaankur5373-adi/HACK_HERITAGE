import prisma from "../config/prisma.js";
import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";


/*
|--------------------------------------------------------------------------
| SAVE UNIVERSITY CAPABILITIES
|--------------------------------------------------------------------------
*/

export async function saveUniversityCapabilities(req, res) {
  try {
    const university = req.university;

    const {
      skills = [],
      researchAreas = [],
      technologies = [],
      departments = [],
    } = req.body;

    const capabilityInputs = {
      skills,
      researchAreas,
      technologies,
      departments,
    };
    if (Object.values(capabilityInputs).some((values) => !Array.isArray(values))) {
      return res.status(400).json({
        success: false,
        message: "University capabilities must be provided as arrays",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Validate input
    |--------------------------------------------------------------------------
    */

    const capabilityGroups = {
      SKILL: skills,
      RESEARCH_AREA: researchAreas,
      TECHNOLOGY: technologies,
      DEPARTMENT: departments,
    };


    const allValues = Object.values(capabilityGroups)
      .flat()
      .filter(
        (value) =>
          typeof value === "string" &&
          value.trim().length > 0
      );


    if (allValues.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one university capability",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Clean values
    |--------------------------------------------------------------------------
    */

    const cleanedGroups = {};

    for (const [type, values] of Object.entries(
      capabilityGroups
    )) {
      cleanedGroups[type] = [
        ...new Set(
          values
            .filter(
              (value) =>
                typeof value === "string" &&
                value.trim()
            )
            .map((value) => value.trim())
        ),
      ];
    }


    /*
    |--------------------------------------------------------------------------
    | Save capabilities in PostgreSQL
    |--------------------------------------------------------------------------
    */

    await prisma.$transaction(async (tx) => {

      // Remove previous capabilities
      await tx.universityCapability.deleteMany({
        where: {
          universityId: university.id,
        },
      });


      // Prepare new capabilities
      const capabilities = [];

      for (const [type, values] of Object.entries(
        cleanedGroups
      )) {
        for (const value of values) {
          capabilities.push({
            universityId: university.id,
            type,
            value,
          });
        }
      }


      if (capabilities.length > 0) {
        await tx.universityCapability.createMany({
          data: capabilities,
        });
      }
    });


    /*
    |--------------------------------------------------------------------------
    | Send university data to AI service
    |--------------------------------------------------------------------------
    */

    const universityForEmbedding = {
      name: university.name,

      city: university.city,
      district: university.district,
      state: university.state,
      pincode: university.pincode,

      skills: cleanedGroups.SKILL,

      researchAreas:
        cleanedGroups.RESEARCH_AREA,

      technologies:
        cleanedGroups.TECHNOLOGY,

      departments:
        cleanedGroups.DEPARTMENT,
    };


    let embeddingStatus = "FAILED";


    try {

      await axios.post(
        `${AI_SERVICE_URL}/api/ai/store-university`,
        {
          universityId: university.id,

          university:
            universityForEmbedding,
        }
      );


      embeddingStatus = "STORED";

    } catch (embeddingError) {

      console.error(
        "University embedding error:",
        embeddingError.response?.data ||
          embeddingError.message
      );

      /*
      |--------------------------------------------------------------------------
      | Important:
      | PostgreSQL data is already saved.
      | Embedding failure should NOT break capability saving.
      |--------------------------------------------------------------------------
      */
    }


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        "University capabilities saved successfully",

      embeddingStatus,

      university: {
        id: university.id,
        name: university.name,
      },

      capabilities: cleanedGroups,
    });

  } catch (error) {

    console.error(
      "Save University Capabilities Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save university capabilities",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET UNIVERSITY CAPABILITIES
|--------------------------------------------------------------------------
*/

export async function getUniversityCapabilities(
  req,
  res
) {
  try {

    const universityId =
      req.university.id;


    const capabilities =
      await prisma.universityCapability.findMany({
        where: {
          universityId,
        },

        orderBy: [
          {
            type: "asc",
          },
          {
            value: "asc",
          },
        ],
      });


    const result = {
      skills: [],
      researchAreas: [],
      technologies: [],
      departments: [],
    };


    for (const capability of capabilities) {

      if (capability.type === "SKILL") {
        result.skills.push(
          capability.value
        );
      }

      if (
        capability.type ===
        "RESEARCH_AREA"
      ) {
        result.researchAreas.push(
          capability.value
        );
      }

      if (
        capability.type === "TECHNOLOGY"
      ) {
        result.technologies.push(
          capability.value
        );
      }

      if (
        capability.type === "DEPARTMENT"
      ) {
        result.departments.push(
          capability.value
        );
      }
    }


    return res.status(200).json({
      success: true,
      capabilities: result,
    });

  } catch (error) {

    console.error(
      "Get University Capabilities Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch university capabilities",
    });
  }
}