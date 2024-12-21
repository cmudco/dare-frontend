import React from "react";
import { Typography } from "@material-tailwind/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { FolderIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { updateChatInput, createNewChat, updateChatSession } from "../../redux/chatSlice";
import { AppDispatch, RootState } from "../../redux/store";
import ModelPicker from "./ModelPicker";
import PromptSet from "./PromptSet";
import { ChatMessage } from "../../redux/types/chat";
import { useNavigate } from "react-router-dom";
import { fetchDummyMessage } from "../../redux/aynscThunks/chat";

const ChatPill: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chatInput = useSelector((state: RootState) => state.chat.chatInput);
  const activeChat = useSelector((state: RootState) => state.chat.activeChat);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateChatInput(event.target.value));
  };

  const handleSendMessage = () => {
    if (chatInput.trim() === "") return;

    const newMessage: ChatMessage = {
      message: chatInput,
      isSender: true,
      date: new Date().toISOString(),
    };

    if (!activeChat) {
      const newSessionId = Date.now(); // Use timestamp as session ID
      dispatch(createNewChat({ session_id: newSessionId.toString() }));
      dispatch(updateChatSession({ session_id: newSessionId.toString(), created_at: new Date().toISOString() }));
      dispatch(fetchDummyMessage(newMessage));
      navigate(`/chat/${newSessionId}`);
    } else {
      console.log('Sending message:', newMessage);
      dispatch(fetchDummyMessage(newMessage));
    }

    dispatch(updateChatInput(""));
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col justify-end">
      <div className="flex items-center w-full px-4">
        <div className="relative flex items-center w-full rounded-md">
          <FolderIcon className="absolute left-3 w-5 h-5" />
          <input
            type="text"
            value={chatInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type message"
            className="w-full h-14 pl-10 pr-10 py-4 bg-gray-200 rounded-2xl focus:outline-none font-normal text-sm"
          />
          <PaperAirplaneIcon
            className="absolute right-3 w-5 h-5 cursor-pointer"
            onClick={handleSendMessage}
          />
        </div>
        <PromptSet />
        <ModelPicker />
      </div>
      <Typography variant="small" className="mt-4 text-center">
        Dare Chat can make mistakes. Check important information.
      </Typography>
    </div>
  );
};

export default ChatPill;
