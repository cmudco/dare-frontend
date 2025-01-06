import React from "react";
import { Typography } from "@material-tailwind/react";
import { ChatMessage } from "../../redux/types/chat";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface MessageProps {
  message: ChatMessage;
  onReprompt: (message: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onReprompt }) => {
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
        className={`relative px-5 py-3 rounded-xl max-w-lg ${message.isSender ? "bg-gray-100" : "bg-gray-100"} inline-block group`}
      >
        <Typography
          className={`text-base font-normal text-gray-900 ${message.streaming ? "animate-pulse" : ""}`}
        >
          {message.message}
          {message.streaming && "▋"}
        </Typography>
        <Typography className="text-sm text-gray-400" children={undefined} />
        {!message.isSender && !message.streaming && (
          <button
            className="absolute -right-8 -top-2 mt-2 mr-2 text-gray-500 hover:text-gray-700 hidden group-hover:block"
            onClick={() => onReprompt(message.message)}
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-900" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Message;