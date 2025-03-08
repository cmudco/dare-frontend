import React from "react";
import { ChatMessage } from "../../redux/types/chat";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`flex ${message.isSender ? "justify-end" : "justify-start"} items-start`}>
      {!message.isSender && (
        <div className="mr-2 mt-1 w-5 h-5 flex-shrink-0">
          <img src="/icons/LogoWithoutText.png" alt="Placeholder Logo" className="w-5 h-5" />
        </div>
      )}
      <div
        className={`relative px-5 py-3 rounded-xl max-w-[40vw] text-wrap ${message.isSender ? "bg-gray-100" : "bg-gray-100"} inline-block group`}
      >
        <div
          className={` font-normal  max-w-[40vw] text-wrap ${message.streaming ? "animate-pulse" : ""}`}
        >
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.message}</ReactMarkdown>
          </div>          {message.streaming && "▋"}
        </div>

        {!message.isSender && !message.streaming && (
          <button
            className="absolute -right-8 -top-2 mt-2 mr-2 text-gray-500 hover:text-gray-700 hidden group-hover:block"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-900" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Message;