import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchPrompts } from "../../redux/aynscThunks/prompt";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";
import { GoCommandPalette } from "react-icons/go";
import { ChatMessage } from "../../redux/types/chat";
import { addMessage } from "../../redux/chatSlice";

const PromptSet: React.FC = () => {
  const dispatch = useDispatch();
  const prompts = useSelector((state: RootState) => state.prompt.prompts);
  const activeChat = useSelector((state: RootState) => state.chat.activeChat);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = () => {
    setShowModal(true);
    dispatch(fetchPrompts());
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleClickOutside = useCallback((event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleCloseModal();
    }
  }, []);

  const handlePromptSelect = (prompt: string) => {
    if (activeChat) {
      const newMessage: ChatMessage = {
        message: prompt,
        isSender: true,
        date: new Date().toISOString(),
      };
      dispatch(addMessage(newMessage));
      handleCloseModal();
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    } else {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, [handleClickOutside, showModal]);

  return (
    <div className="relative">
      <Button onClick={handleOpenModal} className="ml-4 bg-primary flex justify-center items-center font-normal normal-case rounded-lg h-12 py-0 whitespace-nowrap px-4">
        <GoCommandPalette className="font-extrabold text-xl" />
      </Button>
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleClickOutside as unknown as React.MouseEventHandler<HTMLDivElement>}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-md p-6 w-full max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
            style={{ boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg text-black font-bold flex items-center">
                Select Prompt
              </h3>
              <Button className="text-white bg-primary flex items-center px-4 py-2 rounded-xl">
                <PlusIcon className="w-6 h-6 mr-1" />
                Create Prompt
              </Button>
            </div>
            <hr className="border-gray-200 mx-1 mb-4" />
            <div className="max-h-60 overflow-y-auto">
              {prompts && prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="mb-2 py-2 text-black flex items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => handlePromptSelect(prompt.title)}
                >
                  <GoCommandPalette className="mx-2" />
                  <h4 className="font-bold">{prompt.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSet;
