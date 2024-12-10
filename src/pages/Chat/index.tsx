import React from "react";
import SplitScreen from "../../components/design/split-screen";
import NavBar from "../../components/generics/navbar/NavBar";
import ChatSidebar from "../../components/ChatSidebar";
import ChatLayout from "../../components/ChatLayout";

const ChatScreen: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <div className='w-full'>
        <NavBar />
      </div>
      <div className='w-full h-full flex-1 flex items-center justify-center'>
        <div className='shadow-md rounded-2xl border-white w-full h-full flex'>
          <SplitScreen left={<ChatSidebar />} right={<ChatLayout />} leftWeight={1} rightWeight={1} />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
