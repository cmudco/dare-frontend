import React, { useEffect } from "react";
import ConversationHistory from "./ConversationHistory";
import ActiveConversation from "./ActiveConversation";
import { useAppDispatch } from "@/redux/hooks";
import { getTags } from "@/redux/aynscThunks/tag";
import { getFiles } from "@/redux/aynscThunks/file";
import { getConversations } from "@/redux/aynscThunks/conversation";
import { getPrompts } from "@/redux/aynscThunks/prompt";

const ConversationLayout: React.FC = () => {

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getFiles())
    dispatch(getTags())
    dispatch(getConversations())
    dispatch(getPrompts())
  }, [dispatch])

  return (
    <div className='flex h-full'>
      <ActiveConversation />
      <ConversationHistory />
    </div>
  );
};

export default ConversationLayout;