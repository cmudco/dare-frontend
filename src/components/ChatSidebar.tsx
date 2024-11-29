import React from "react";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  TrashIcon,
  SunIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const ChatSidebar: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-xl font-bold">Conversations</h1>
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 cursor-pointer hover:text-black" />
          <PencilSquareIcon className="w-6 h-6 text-gray-500 cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul>
          <li className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 rounded-md">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-500" />
            <span>AI Chat Tool Ethics</span>
          </li>
          <li className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 rounded-md">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-500" />
            <span>AI Chat Tool Impact Writing</span>
          </li>
          <li className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 rounded-md">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-500" />
            <span>AI Impact on Coding</span>
          </li>
          <li className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 rounded-md">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-500" />
            <span>New Chat</span>
          </li>
        </ul>
      </div>

      {/* Bottom Options */}
      <div className="border-t p-4 space-y-4 bg-white">
        <button className="flex items-center gap-2 text-gray-600 hover:text-black">
          <TrashIcon className="w-5 h-5" />
          <span>Clear conversations</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-black">
          <SunIcon className="w-5 h-5" />
          <span>Light mode</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-black">
          <QuestionMarkCircleIcon className="w-5 h-5" />
          <span>Updates & FAQ</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;