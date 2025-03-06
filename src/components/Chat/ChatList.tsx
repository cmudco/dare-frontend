import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ChatBubbleLeftEllipsisIcon,
    TrashIcon,
    MoonIcon,
} from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../../redux/store";
import { ChatSession } from "../../redux/types/chat";
import { updateChatSession, clearChat } from "../../redux/chatSlice";

const ChatList: React.FC = () => {
    const location = useLocation();
    const sessions = useSelector((state: RootState) => state.chat.sessions);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const bottomItems = [
        { name: "Clear Conversation", icon: TrashIcon, action: "clear" },
        { name: "Dark Mode", icon: MoonIcon },
    ];

    const handleChatClick = (session: ChatSession) => {
        dispatch(updateChatSession(session));
        navigate(`/chat/${session.sessionId}`);
    };

    const handleBottomItemClick = (item: any) => {
        
    };

    return (
        <nav className="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
            <div className="flex flex-col h-[50vh] overflow-y-auto">
                {sessions.map((session) => {
                    const sessionId = session.sessionId

                    const isActive = location.pathname === `/chat/${sessionId}`;
                    return (
                        <div
                            key={sessionId}
                            onClick={() => handleChatClick(session)}
                            className={`flex items-center w-full p-3 leading-tight transition-all outline-none text-start cursor-pointer rounded-md
                            ${isActive
                                    ? "bg-pink-50 text-primary"
                                    : "hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                                }`}
                        >
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5 font-bold mr-4" />
                            {session.title || `Chat ${sessionId.substring(0, 5)}`}
                        </div>
                    );
                })}
            </div>
            <div className="mt-auto max-h-[50%] overflow-y-auto">
                <hr className=" border-gray-200 pt-1" />
                {bottomItems.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => handleBottomItemClick(item)}
                        className={`flex items-center w-full p-3 leading-tight transition-all outline-none text-start font-normal rounded-md ${location.pathname === item.name
                            ? "bg-primary text-white"
                            : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                            } cursor-pointer`}
                    >
                        <item.icon className="w-5 h-5 font-bold mr-4 " />
                        {item.name}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default ChatList;