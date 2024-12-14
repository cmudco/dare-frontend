import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {  Card } from "@material-tailwind/react";
import ChatPill from "./ChatPill";
import NewChat from "./NewChat";
import { useParams } from "react-router-dom";
import { updateChatSession } from "../../redux/chatSlice";
import MessageList from "./MessageList";

const ActiveChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeChat = useSelector((state: RootState) => state.chat?.activeChat);
  const { id } = useParams<{ id: string }>();
  const sessions = useSelector((state: RootState) => state.chat?.sessions || []);


  useEffect(() => {
    if (id) {
      const session = sessions.find((session) => session.session_id === id);
      if (session) {
        dispatch(updateChatSession(session));
      }
    } else {
      dispatch(updateChatSession(null))
    }
  }, [id, sessions, dispatch]);

  useEffect(() => {
    if (activeChat && activeChat.session_id) {
      // dispatch(fetchChatMessages(activeChat.session_id));
    }
  }, [activeChat, dispatch]);
  return (
    <Card className="flex flex-col w-full h-full justify-end bg-white border border-pink-50  rounded-none rounded-tl-[3.25rem] p-6">
      <div
        className={`flex flex-col justify-between ${activeChat ? "h-full" : "h-[50vh]"
          }`}
      >
        {!activeChat && <NewChat />}

        {activeChat && <MessageList />}

        <ChatPill />
      </div>
    </Card>
  );
};

export default ActiveChat;

