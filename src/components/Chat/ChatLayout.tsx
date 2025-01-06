import React from "react";
import ChatHistory from "./ChatHistory";
import ActiveChat from "./ActiveChat";

const ChatLayout: React.FC = () => {
  return (
    <div className='flex pt-[5.25rem] h-full bg-white'>
      <ActiveChat />
      <ChatHistory />
    </div>
  );
};

export default ChatLayout;