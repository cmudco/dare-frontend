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

const ActiveChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeChat = useSelector((state: RootState) => state.chat?.activeChat);

  const { id } = useParams<{ id: string }>();
  const sessions = useSelector((state: RootState) => state.chat?.sessions || []);
  const token = localStorage.getItem("token");
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);


  useEffect(() => {
    if (id) {
      const session = sessions.find((session) => session.conversationId === id);
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
            conversationId: activeChat.conversationId,
            jwtKey: token || ""
          }));
        } catch (error) {
          console.error("WebSocket connection failed:", error);
        }
      }

    };

    handleWebSocketConnection();
  }, [activeChat?.conversationId, dispatch]);

  return (
    <Card className="flex flex-col flex-2 w-full h-full justify-end  border border-pink-50 rounded-none rounded-tl-[3.25rem] p-5  ">
      <div className={`flex flex-col justify-between h-full`}>
        {!activeChat && <NewChat />}
        {activeChat && <MessageList />}
        <ChatPill />
      </div>
    </Card>
  );
};

export default ActiveChat;
