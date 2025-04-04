import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { updateConversationInput, updateConversation } from "../../redux/conversationSlice";
import { AppDispatch, RootState } from "../../redux/store";
import ModelPicker from "./ModelPicker";
import PromptSet from "./PromptSet";
import { Message } from "../../redux/types/conversation";
import { useNavigate } from "react-router-dom";
import { sendMessage, createConversation } from "../../redux/aynscThunks/conversation";
import ConversationFileSelect from "./ConversationFileSelect";
import ModelConfigurationPanel from "./ModelConfigurationPanel";

const ConversationPill: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversationInput = useSelector((state: RootState) => state.conversation.conversationInput);
  const activeConversation = useSelector((state: RootState) => state.conversation.activeConversation);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateConversationInput(event.target.value))
  }

  const handleSendMessage = () => {
    if (conversationInput.trim() === '') return

    const newMessage: Partial<Message> = {
      message: conversationInput,
    }

    if (!activeConversation) {
      dispatch(createConversation())
        .unwrap()
        .then((newConversation) => {
          dispatch(updateConversation(newConversation))
          navigate(`/conversation/${newConversation.conversationId}`)
        })
        .catch((error) => {
          console.error('Error creating conversation:', error)
        })
    } else {
      dispatch(sendMessage(newMessage))
      dispatch(updateConversationInput(''))
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className='flex flex-col justify-end px-5'>
      <div className='flex w-full items-center'>
        <div className='relative flex w-full items-center rounded-md'>
          <ConversationFileSelect />
          <input
            type='text'
            value={conversationInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder='Type message'
            className='h-14 w-full rounded-2xl bg-gray-200 py-4 pl-12 pr-10 text-sm font-normal focus:outline-none'
          />
          <PaperAirplaneIcon
            className='absolute right-3 h-5 w-5 cursor-pointer'
            onClick={handleSendMessage}
          />
        </div>
        <PromptSet />
        <ModelPicker />
        <ModelConfigurationPanel />
      </div>
      <p className='mt-2 text-center text-sm'>
        DARE Chat can make mistakes. Check important information.
      </p>
    </div>
  )
}

export default ConversationPill
