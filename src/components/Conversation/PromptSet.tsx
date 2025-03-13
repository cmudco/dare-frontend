import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { PlusIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { GoCommandPalette } from "react-icons/go";
import { formatDate } from "../../utils/constants/prompts";


import { openModal } from "@/redux/promptSlice";
import { useNavigate } from "react-router-dom";

import { setPrompt } from "@/redux/conversationSlice";
import { Prompt } from "@/redux/types/prompt";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";

const PromptSet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const prompts = useSelector((state: RootState) => state.prompt.prompts);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate()
  const { prompt: selectedPrompt } = useSelector((state: RootState) => state.conversation);

  const handlePromptSelect = (prompt: Prompt) => {
    dispatch(setPrompt(prompt));
    if (selectedPrompt?.id === prompt.id) {
      dispatch(setPrompt(null))
    } else {
      dispatch(setPrompt(prompt))
    }
  };

  const handleCreatePrompt = () => {
    navigate("/prompts")
    dispatch(openModal());
  };

  const filteredPrompts = prompts.filter(prompt => {
    const promptTitle = prompt.title?.toLowerCase() || "";
    const promptContent = prompt.content?.toLowerCase() || "";
    return searchQuery === "" ||
      promptTitle.includes(searchQuery.toLowerCase()) ||
      promptContent.includes(searchQuery.toLowerCase());
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4 bg-primary flex justify-center items-center font-normal normal-case rounded-lg h-12 py-0 whitespace-nowrap px-4">
          <GoCommandPalette className="font-extrabold text-xl" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white rounded-lg shadow-md p-6-4 w-full max-w-md [&>button]:hidden">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg text-black font-bold">Select Prompt</DialogTitle>
          <Button
            className="flex items-center px-3 py-1 rounded-xl text-white"
            onClick={handleCreatePrompt}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Create Prompt
          </Button>
        </div>

        <div className="mb-2 relative">
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

        <div className="max-h-[50vh] overflow-y-auto">
          {filteredPrompts.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              {prompts.length === 0 ? "No prompts available" : "No matching prompts found"}
            </div>
          )}

          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`mb-3 p-3 text-black border border-gray-100 rounded-lg cursor-pointer transition-colors
                ${selectedPrompt?.id === prompt?.id
                  ? "bg-pink-50 hover:bg-pink-50 "
                  : "bg-muted hover:bg-pink-50 text-foreground"}`}
              onClick={() => handlePromptSelect(prompt)}
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
      </DialogContent>
    </Dialog>
  );
};

export default PromptSet;