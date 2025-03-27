import { PaperAirplaneIcon, } from "@heroicons/react/24/outline";

import { useDispatch, useSelector } from "react-redux";
import { updateConversationInput, updateConversation } from "../../redux/conversationSlice";
import { AppDispatch, RootState } from "../../redux/store";
import ModelPicker from "./ModelPicker";
import PromptSet from "./PromptSet";
import { Message } from "../../redux/types/conversation";
import { useNavigate } from "react-router-dom";
import { sendMessage, createConversation } from "../../redux/aynscThunks/conversation";
import ConversationFileSelect from "./ConversationFileSelect";
import { useEffect } from "react";
import ModelConfigurationPanel from "./ModelConfigurationPanel";

const ConversationPill: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversationInput = useSelector((state: RootState) => state.conversation.conversationInput);
  const activeConversation = useSelector((state: RootState) => state.conversation.activeConversation);
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateConversationInput(event.target.value));
  };

  const handleSendMessage = () => {
    if (conversationInput.trim() === "") return;

    const newMessage: Partial<Message> = {
      message: conversationInput,
    };

    if (!activeConversation) {
      dispatch(createConversation())
        .unwrap()
        .then((newConversation) => {
          dispatch(updateConversation(newConversation));
          navigate(`/conversation/${newConversation.conversationId}`);
        })
        .catch((error) => {
          console.error("Error creating conversation:", error);
        });
    } else {
      dispatch(sendMessage(newMessage));
      dispatch(updateConversationInput(""));
    }
  };

  useEffect(() => {
    if (conversationInput.trim() === "") return;

    if (isConnected) {
      const newMessage: Partial<Message> = {
        message: conversationInput,
      };
      dispatch(sendMessage(newMessage));
      dispatch(updateConversationInput(""));
    }
  }, [isConnected, dispatch]);


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col justify-end px-5">
      <div className="flex items-center w-full ">
        <div className="relative flex items-center w-full rounded-md">
          <ConversationFileSelect />
          <input
            type="text"
            value={conversationInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type message"
            className="w-full h-14 pl-12 pr-10 py-4 bg-gray-200 rounded-2xl focus:outline-none font-normal text-sm"
          />
          <PaperAirplaneIcon
            className="absolute right-3 w-5 h-5 cursor-pointer"
            onClick={handleSendMessage}
          />
        </div>
        <PromptSet />
        <ModelPicker />
        <ModelConfigurationPanel />
      </div>
      <p className="text-sm text-center mt-2">
        DARE Chat can make mistakes. Check important information.
      </p>
    </div>
  );
};

export default ConversationPill;
