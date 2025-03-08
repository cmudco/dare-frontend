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
import { updateChatSession, } from "../../redux/chatSlice";

const ChatList: React.FC = () => {
    const location = useLocation();
    const sessions = useSelector((state: RootState) => state.chat.sessions);
    const activeChat = useSelector((state: RootState) => state.chat.activeChat);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const bottomItems = [
        { name: "Clear Conversation", icon: TrashIcon, action: "clear" },
        { name: "Dark Mode", icon: MoonIcon },
    ];

    const handleChatClick = (session: ChatSession) => {
        dispatch(updateChatSession(session));
        navigate(`/chat/${session.conversationId}`);
    };

    const handleBottomItemClick = (item: any) => {

    };

    return (
        <nav className="flex flex-col  gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 h-full">
            <div className="flex flex-col h-[65vh] overflow-scroll  w-full">
                {sessions.map((session) => {
                    const conversationId = session.conversationId

                    const isActive = location.pathname === `/chat/${conversationId}`;
                    return (
                        <div
                            key={conversationId}
                            onClick={() => handleChatClick(session)}
                            className={`flex items-center w-full p-3 gap-3 leading-tight transition-all outline-none text-start cursor-pointer rounded-md
                            ${isActive
                                    ? "bg-pink-50 text-primary"
                                    : "hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                                }`}
                        >
                            <div>
                            <ChatBubbleLeftEllipsisIcon className="w-6 font-bold"/>
                            </div>
                            {isActive ? activeChat?.title || `Chat ${conversationId}` : session.title || `Chat ${conversationId}`}
                        </div>
                    );
                })}
            </div>
            <hr className=" border-gray-200 mt-4" />
            <div className="">
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