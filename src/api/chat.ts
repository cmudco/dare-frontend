import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { ChatSession } from "../redux/types/chat";
import { BASE_URL } from "./config";



const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const getChatSessionsAPI = async () => {
  try {
    const response = await axiosInstance.get<ChatSession[]>("/claude/chat/sessions/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getModelsAPI = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  try {
    const response = await axiosInstance.get("/claude/llms/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    return response.data.map((model: { name: string; endpoint: string }, index: number) => ({
      id: index.toString(),
      name: model.name,
      description: `Endpoint: ${model.endpoint}`,
    }));
  } catch (error) {
    console.error("Error in fetchModelsAPI:", error);
    throw error;
  }
};