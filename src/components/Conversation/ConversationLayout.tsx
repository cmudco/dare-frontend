import React from "react";
import ConversationHistory from "./ConversationHistory";
import ActiveConversation from "./ActiveConversation";

const ConversationLayout: React.FC = () => {
  return (
    <div className='flex h-full'>
      <ActiveConversation />
      <ConversationHistory />
    </div>
  );
};

export default ConversationLayout;