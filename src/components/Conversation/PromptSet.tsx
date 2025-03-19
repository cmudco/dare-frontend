import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
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
import { Plus } from "lucide-react";
import { stripHtml } from "../../utils/textUtils";

// Component to safely render HTML content with character limit
const RichTextPreview = ({ content }: { content: string }) => {
  // Truncate HTML content to approximately 100 characters
  const truncateHtml = (html: string, maxLength: number = 100): string => {
    if (!html) return "";

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    if (textContent.length <= maxLength) return html;

    // Find a reasonable cutoff point
    const truncatedText = textContent.substring(0, maxLength) + "...";

    // Create a simple version that preserves some formatting but limits length
    return html.substring(0, Math.min(html.length, maxLength * 2)) + "...";
  };

  return (
    <div
      className="text-sm text-gray-600 prose dark:prose-invert prose-sm focus:outline-none w-full max-w-full"
      dangerouslySetInnerHTML={{ __html: truncateHtml(content || "") }}
    />
  );
};

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
    const promptContent = stripHtml(prompt.content?.toLowerCase() || "");
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

      <DialogContent className="bg-white rounded-lg shadow-md p-6 w-[90vw] max-w-2xl [&>button]:hidden">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg text-black font-bold">Select Prompt</DialogTitle>
          <Button
            className="flex items-center px-3 py-1 rounded-xl text-white"
            onClick={handleCreatePrompt}
          >
            <Plus />
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
                <h4 className="font-medium text-xl text-gray-800">{prompt.title || "Untitled"}</h4>
                <span className="text-xs text-gray-500">{formatDate(prompt.createdAt)}</span>
              </div>
              <div className="max-h-[4.5em] overflow-hidden">
                <RichTextPreview content={prompt.content || "No content"} />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptSet;