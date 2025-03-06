import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { Card } from "@material-tailwind/react";
import ChatPill from "./ChatPill";
import NewChat from "./NewChat";
import { useParams } from "react-router-dom";
import { updateChatInput, updateChatSession } from "../../redux/chatSlice";
import MessageList from "./MessageList";
import { connectWebSocket, disconnectWebSocket } from "../../redux/aynscThunks/websocket";
import { getChatMessages } from "../../redux/aynscThunks/chat";

const ActiveChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeChat = useSelector((state: RootState) => state.chat?.activeChat);

  const { id } = useParams<{ id: string }>();
  const sessions = useSelector((state: RootState) => state.chat?.sessions || []);
  const token = localStorage.getItem("token");
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);
  const apiKey = useSelector((state: RootState) => state.chat.apiKey);


  useEffect(() => {
    if (id) {
      const session = sessions.find((session) => session.sessionId === id);
      if (session) {
        dispatch(updateChatSession(session));
      }
    } else {
      dispatch(updateChatSession(null));
    }
  }, [id, sessions, dispatch]);

  useEffect(() => {
    const handleWebSocketConnection = async () => {
      console.log("WebSocket connection");
      if (isConnected) {
        // empty the text
        dispatch(updateChatInput(""));
        await dispatch(disconnectWebSocket());
      }

      if (token && activeChat) {
        try {
          await dispatch(connectWebSocket({
            apiKey: apiKey,
            sessionId: activeChat.sessionId,
            jwtKey: token || ""
          }));
        } catch (error) {
          console.error("WebSocket connection failed:", error);
        }
      }

    };

    handleWebSocketConnection();
  }, [apiKey, activeChat?.sessionId, dispatch]);

  return (
    <Card className="flex flex-col w-full h-full justify-end  border border-pink-50 rounded-none rounded-tl-[3.25rem] p-5  ">
      <div className={`flex flex-col justify-between ${activeChat ? "h-full" : "h-[50vh]"}`}>
        {!activeChat && <NewChat />}
        {activeChat && <MessageList />}
        <ChatPill />
      </div>
    </Card>
  );
};

export default ActiveChat;
