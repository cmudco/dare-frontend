import React from "react";
import { useSelector } from "react-redux";
import { Message as MessageModel } from "../../redux/types/conversation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";
import { RootState } from "@/redux/store";

interface MessageProps {
  message: MessageModel;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const llms = useSelector((state: RootState) => state.conversation.availableModels);
  const user = useSelector((state: RootState) => state.user.user);

  if (!message) {
    return null;
  }

  const llm = llms.find((model) => model.id == message.llmId);
  const llmName = llm ? llm.name : "Unknown LLM";

  const userInitial = user?.name?.charAt(0) || user?.username?.charAt(0) || "U";

  return (
    <div
      className={`flex flex-col px-5 ${
        message.isSender ? "items-end" : "items-start"
      } mb-4`}
    >
      <div
        className={`flex w-full max-w-[100%] ${
          message.isSender ? "justify-end" : "justify-start"
        } items-start`}
      >
        {!message.isSender && (
          <div className="mr-2 mt-1 flex-shrink-0">
            <Bot className="w-8 h-8" />
          </div>
        )}
        <div
          className={`relative px-5 py-3 rounded-xl text-wrap max-w-[95%] ${
            message.isSender ? "bg-gray-100" : "bg-gray-100"
          } inline-block group`}
        >
          <div
            className={`font-normal text-wrap ${
              message.streaming ? "animate-pulse" : ""
            }`}
          >
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose !max-w-none"
              >
                {message.streaming ? `${message.message}▋` : message.message}
              </ReactMarkdown>
            </div>
          </div>

          {!message.isSender && !message.streaming && (
            <button
              className="absolute -right-8 -top-2 mt-2 mr-2 text-gray-500 hover:text-gray-700 hidden group-hover:block"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-900" />
            </button>
          )}
        </div>
        {message.isSender && (
          <div className="ml-2 mt-1 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userInitial.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!message.isSender && !message.streaming && message.llmId && (
        <div
          className={`text-xs text-gray-500 mt-1 ${
            message.isSender ? "text-right" : "text-left pl-10"
          }`}
        >
          {llmName}
        </div>
      )}
    </div>
  );
};

export default Message;