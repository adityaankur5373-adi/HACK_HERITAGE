import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";


// ==================================================
// PROCESS REPORT CONVERSATION
// ==================================================

export const sendToAI = async ({
  messages,
  citizenLocation,
}) => {

  const response = await axios.post(
    `${AI_SERVICE_URL}/api/ai/report`,
    {
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),

      citizen_location:
        citizenLocation || null,
    }
  );

  return response.data;
};


// ==================================================
// STORE SUBMITTED REPORT IN QDRANT
// ==================================================

export const storeReportVector = async ({
  id,
  title,
  description,
  category,
  priority,

  address,
  city,
  district,
  state,
  pincode,
}) => {

  const response = await axios.post(
    `${AI_SERVICE_URL}/api/ai/store-report`,
    {
      id,

      title,
      description,
      category,
      priority,

      address: address || null,
      city: city || null,
      district: district || null,
      state: state || null,
      pincode: pincode || null,
    }
  );

  return response.data;
};


// ==================================================
// GENERATE UNIVERSITY REQUIREMENTS
// ==================================================

export const generateUniversityRequirements =
  async (report) => {

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/university-requirements`,
      {
        title: report.title,

        description:
          report.description,

        category:
          report.category,

        priority:
          report.priority,

        location:
          report.location || null,
      }
    );

    return response.data;
  };


// ==================================================
// MATCH UNIVERSITIES USING QDRANT
// ==================================================

export const matchUniversitiesByRequirements =
  async (requirements) => {

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/match-universities`,
      {
        requirements,
      }
    );

    return response.data?.matches || [];
};

export const storeIndustryVector = async ({ industryId, industry }) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/store-industry`, { industryId, industry });
  return response.data;
};

export const generateIndustryRequirements = async (solution) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/industry-requirements`, { solution });
  return response.data;
};

export const matchIndustriesByRequirements = async (requirements) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/match-industries`, { requirements });
  return response.data?.matches || [];
};
