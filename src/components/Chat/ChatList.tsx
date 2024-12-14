import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ChatBubbleLeftEllipsisIcon,
    TrashIcon,
    MoonIcon,
} from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../../redux/store";
import { ChatSession } from "../../redux/types/chat";
import { updateChatSession } from "../../redux/chatSlice";

const ChatList: React.FC = () => {
    const location = useLocation();
    const sessions = useSelector((state: RootState) => state.chat?.sessions || []);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()

    const bottomItems = [
        { name: "Clear Conversation", icon: TrashIcon, path: "/clear-conversation" },
        { name: "Dark Mode", icon: MoonIcon, path: "/dark-mode" },
    ];

    const handleChatClick = (session: ChatSession) => {
        // Update active session in Redux
        dispatch(updateChatSession(session));

        // Navigate to the session's chat route
        navigate(`/chat/${session.session_id}`);
    };

    return (
        <nav className="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 flex-grow">
            {sessions.map((session) => (
                <div
                    key={session.session_id}
                    onClick={() => handleChatClick(session)}
                    className={`flex items-center w-full p-3 leading-tight transition-all outline-none text-start cursor-pointer ${location.pathname === `/chat/${session.session_id}`
                        ? "bg-pink-50 text-primary"
                        : "hover:bg-gray-200 hover:bg-opacity-80 hover:text-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                        }`}
                >
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5 font-bold mr-4" />
                    {`Chat ${session.session_id}`}
                </div>
            ))}
            <div className="mt-auto">
                <hr className=" border-gray-200 mx-1" />

                {bottomItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start font-normal  ${location.pathname === item.path
                            ? "bg-primary text-white"
                            : "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                            }`}
                    >
                        <item.icon className="w-5 h-5 font-bold mr-4" />
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default ChatList;