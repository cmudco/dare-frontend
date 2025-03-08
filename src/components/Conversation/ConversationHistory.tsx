import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { updateSearchQuery, } from "../../redux/conversationSlice";
import { getConversations, createConversation } from "../../redux/aynscThunks/conversation";
import { AppDispatch, RootState } from "../../redux/store";
import ConversationList from "./ConversationList";
import { useNavigate } from "react-router-dom";

const ConversationHistory = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const searchQuery = useSelector((state: RootState) => state.conversation?.searchQuery || "");


    useEffect(() => {
        dispatch(getConversations());
    }, [dispatch]);

    useEffect(() => {
        const handleResize = () => {
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [dispatch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateSearchQuery(e.target.value));
    };

    const handleCreateConversation = () => {
        dispatch(createConversation())
        .then(({payload}) => {
            navigate(`/conversation/${payload.conversationId}`);
        });
    };

    return (
        <div
            className={`flex flex-col flex-1 bg-white bg-clip-border text-gray-700 shadow-xl shadow-blue-gray-900/5 transition-width duration-300 border border-pink-50`}
        >
            <div className='flex items-center justify-between p-4  border-pink-50'>
                <div className="flex items-center flex-grow border  border-gray-500 rounded-3xl p-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-600 mr-2 " />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="flex-grow outline-none bg-transparent placeholder-gray-600 font-normal"
                    />
                </div>
                <button
                    onClick={handleCreateConversation}
                    className="ml-2 min-w-5 bg-primary text-white rounded-xl w-10 h-10 flex items-center justify-center"
                >
                    <span className="text-xl">+</span>
                </button>
            </div>
            <hr className=" border-gray-200 mx-1" />
            <ConversationList />
        </div>
    );
};

export default ConversationHistory;