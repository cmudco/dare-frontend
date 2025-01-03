import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { ChatSession, ChatMessage } from "../redux/types/chat";

import { AppDispatch } from '../redux/store';
import { sendWebSocketMessage } from "../redux/aynscThunks/websocket";

const BASE_URL = import.meta.env.VITE_DJANGO_BACKEND_URL;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const fetchChatSessions = async () => {
  try {
    const response = await axiosInstance.get<ChatSession[]>("/api/claude/chat/sessions/", {
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

export const fetchModelsAPI = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  try {
    const response = await axiosInstance.get("/api/claude/llms/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Transform the API response to match the expected structure
    return response.data.map((model: { name: string; endpoint: string }, index: number) => ({
      id: index.toString(), // Generate a unique `id` if not provided
      name: model.name,
      description: `Endpoint: ${model.endpoint}`, // Construct a description
    }));
  } catch (error) {
    console.error("Error in fetchModelsAPI:", error);
    throw error;
  }
};

export const fetchOpenAIResponse = async (message: string): Promise<ChatMessage> => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const replyMessage: ChatMessage = {
      message: response.data.choices[0].message.content.trim(),
      isSender: false,
      date: new Date().toISOString(),
    };

    return replyMessage;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const streamClaudeResponse = (dispatch: AppDispatch, apiKey: string, sessionId: string, message: string) => {

  const chatMessage: ChatMessage = {
    message,
    isSender: true,
    date: new Date().toISOString(),
  };
  dispatch(sendWebSocketMessage(chatMessage));
  // dispatch(connectWebSocket({ apiKey, sessionId, jwtKey: localStorage.getItem("token") || "" }))
  //   .then(() => {

  //   })
  //   .catch((error) => {
  //     console.error('WebSocket connection error:', error);
  //   });
};