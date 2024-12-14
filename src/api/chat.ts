import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { ChatSession, ChatMessage } from "../redux/types/chat";

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
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
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