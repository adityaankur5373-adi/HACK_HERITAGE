import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";

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

      citizen_location: citizenLocation,
    }
  );

  return response.data;
};