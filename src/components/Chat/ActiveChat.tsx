import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { Card } from "@material-tailwind/react";
import ChatPill from "./ChatPill";
import NewChat from "./NewChat";
import { useParams } from "react-router-dom";
import { updateChatSession } from "../../redux/chatSlice";
import MessageList from "./MessageList";
import { connectWebSocket, disconnectWebSocket } from "../../redux/aynscThunks/websocket";
import { getModelConfig } from "../../services/getSelectedModel";


const ActiveChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeChat = useSelector((state: RootState) => state.chat?.activeChat);
  const selectedModel = useSelector((state: RootState) => state.chat?.selectedModel);

  const { id } = useParams<{ id: string }>();
  const sessions = useSelector((state: RootState) => state.chat?.sessions || []);
  const apiKey = getModelConfig(selectedModel || "");
  const token = localStorage.getItem("token");
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);

  useEffect(() => {
    if (id) {
      const session = sessions.find((session) => session.session_id === id);
      if (session) {
        dispatch(updateChatSession(session));
      }
    } else {
      dispatch(updateChatSession(null));
    }
  }, [id, sessions, dispatch]);

  useEffect(() => {
    const handleWebSocketConnection = async () => {
      if (isConnected) {
        await dispatch(disconnectWebSocket());
      }
      // console.log("ActiveChat: WebSocket connection is disconnected.", apiKey);

      if (apiKey && activeChat) {
        // console.log("Connecting to WebSocket...", activeChat.session_id);
        try {
          await dispatch(connectWebSocket({
            apiKey,
            sessionId: activeChat.session_id,
            jwtKey: token || ""
          }));
        } catch (error) {
          // console.error("WebSocket connection failed:", error);
        }
      }

    };

    handleWebSocketConnection();
  }, [apiKey, activeChat?.session_id, dispatch]);

  return (
    <Card className="flex flex-col w-full h-full justify-end bg-white border border-pink-50 rounded-none rounded-tl-[3.25rem] p-5  ">
      <div className={`flex flex-col justify-between ${activeChat ? "h-full" : "h-[50vh]"}`}>
        {!activeChat && <NewChat />}
        {activeChat && <MessageList />}
        <ChatPill />
      </div>
    </Card>
  );
};

export default ActiveChat;
