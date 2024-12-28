import React from "react";
import { Typography } from "@material-tailwind/react";
import { ChatMessage } from "../../redux/types/chat";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`flex ${message.isSender ? "justify-end" : "justify-start"} items-start`}>
      <div
        className={`px-4 py-2 rounded-lg shadow ${message.isSender ? "bg-gray-200 text-left " : "bg-gray-200 text-left"
          } inline-block max-w-full`}
      >
        <Typography className="text-base font-normal text-gray-900">{message.message}</Typography>
        <Typography className="text-sm text-gray-400 block">
          {new Date(message.date).toLocaleTimeString()}
        </Typography>
      </div>
      {!message.isSender && (
        <button className="ml-2 text-gray-500 hover:text-gray-700">
          <ArrowPathIcon className="w-5 h-5 text-gray-900" />
        </button>
      )}
    </div>
  );
};

export default Message;