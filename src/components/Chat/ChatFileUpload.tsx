import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleDropdown, setHoveredModel } from "../../redux/chatSlice";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/24/solid";



const ChatFileUpload: React.FC = () => {
    const dispatch = useDispatch();
    const showDropdown = useSelector((state: RootState) => state.chat.showDropdown);
    const hoveredModel = useSelector((state: RootState) => state.chat.hoveredModel);
    const selectedModel = useSelector((state: RootState) => state.chat.selectedModel);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleFileUploadClick = () => {
        dispatch(toggleDropdown());
    };

    const handleMouseEnter = (modelId: string) => {
        dispatch(setHoveredModel(modelId));
    };

    const handleMouseLeave = () => {
        dispatch(setHoveredModel(null));
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            dispatch(toggleDropdown());
        }
    };

    useEffect(() => {
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleFileUploadClick}
                className="ml-4 p-4 bg-pink-50 text-black rounded-lg h-12 w-12 flex items-center justify-center"
            >
                <span className="text-lg">F</span>
            </button>
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 bottom-full mb-2 bg-white border rounded-md p-6 w-hug whitespace-nowrap"
                    style={{ boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29" }}
                >
                    <div className="relative flex items-center mb-4">
                        <input
                            type="text"
                            placeholder="Search models"
                            className="w-full h-10 pl-4 pr-10 py-2 bg-gray-200 rounded-md focus:outline-none"
                        />
                        <AdjustmentsVerticalIcon className="absolute right-3 w-5 h-5" />
                    </div>


                </div>
            )}
        </div>
    );
};

export default ChatFileUpload;
