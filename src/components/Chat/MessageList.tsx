import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Message from "./Message";

const MessageList = () => {
  const messages = useSelector((state: RootState) => state.chat.activeChatMessages);

  return (
    <div className="flex flex-col gap-2 max-h-[80%] overflow-y-auto p-">
      {messages.map((message, idx) => (
        message && <Message key={idx} message={message} />
      ))}
    </div>
  );
};

export default MessageList;