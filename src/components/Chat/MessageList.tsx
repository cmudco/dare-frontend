import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { RootState } from "../../redux/store";
import Message from "./Message";

const MessageList = () => {
  const messages = useSelector((state: RootState) => state.chat.activeChatMessages);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (

    <div className="flex flex-col gap-2 max-h-[80%] overflow-y-auto scrollbar-hide   ">
      {messages.map((message, idx) => (
        message && <Message key={idx} message={message} />
      ))}
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageList;