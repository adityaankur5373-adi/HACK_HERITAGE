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

      citizen_location: citizenLocation || null,
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