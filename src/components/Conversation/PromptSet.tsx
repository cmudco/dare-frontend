import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getPrompts } from "../../redux/aynscThunks/prompt";
import { dispatchOpenModal } from "../../redux/promptSlice";
import { PlusIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { GoCommandPalette } from "react-icons/go";
import { formatDate } from "../../utils/constants/prompts";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { updateConversationInput } from "@/redux/conversationSlice";

const PromptSet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const prompts = useSelector((state: RootState) => state.prompt.prompts);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = () => {
    setShowModal(true);
    dispatch(getPrompts());
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchQuery("");
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleCloseModal();
    }
  }, []);

  const handlePromptSelect = (promptContent: string) => {
    dispatch(updateConversationInput(promptContent));
    handleCloseModal();
  };

  const handleCreatePrompt = () => {
    dispatchOpenModal();
    handleCloseModal();
  };

  const filteredPrompts = prompts.filter(prompt => {
    const promptTitle = prompt.title?.toLowerCase() || "";
    const promptContent = prompt.content?.toLowerCase() || "";
    return searchQuery === "" ||
      promptTitle.includes(searchQuery.toLowerCase()) ||
      promptContent.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside, showModal]);

  return (
    <div className="relative">
      <Button
        onClick={handleOpenModal}
        className="ml-4 bg-primary flex justify-center items-center font-normal normal-case rounded-lg h-12 py-0 whitespace-nowrap px-4"
      >
        <GoCommandPalette className="font-extrabold text-xl" />
      </Button>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-md p-6 w-full max-w-md"
            style={{ boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-black font-bold flex items-center">
                Select Prompt
              </h3>
              <Button
                className="bg-primary flex items-center px-3 py-1 rounded-xl text-white"
                onClick={handleCreatePrompt}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Create Prompt
              </Button>
            </div>

            <div className="mb-4 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search prompts"
                className="bg-white pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <hr className="border-gray-200 mx-1 mb-4" />

            <div className="max-h-[60vh] overflow-y-auto">
              {filteredPrompts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  {prompts.length === 0 ? "No prompts available" : "No matching prompts found"}
                </div>
              )}

              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="mb-3 p-3 text-black border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handlePromptSelect(prompt.content)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-base">{prompt.title || "Untitled"}</h4>
                    <span className="text-xs text-gray-500">{formatDate(prompt.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {prompt.content || "No content"}
                  </p>
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