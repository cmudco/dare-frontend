import React from "react";
import ChatHistory from "./ChatHistory";
import ActiveChat from "./ActiveChat";

const ChatLayout: React.FC = () => {
  return (
    <div className='flex h-full'>
      <ActiveChat />
      <ChatHistory />
    </div>
  );
};

export default ChatLayout;