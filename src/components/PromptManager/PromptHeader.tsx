import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { useState } from "react";
import { openModal } from "@/redux/promptSlice";


interface PromptHeaderProps {
  onSearch: (query: string) => void;
}

const PromptHeader: React.FC<PromptHeaderProps> = ({ onSearch }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCreatePrompt = () => {
    dispatch(openModal());
  };

  return (
    <div className="flex items-center justify-between px-2.5">
      <div className="w-[300px] h-[40px] relative flex items-center">
        <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Search prompts"
          className="bg-white pl-10"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <Button
        variant="default"
        className="bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal whitespace-nowrap"
        onClick={handleCreatePrompt}
      >
        Create Prompt
      </Button>
    </div>
  );
};

export default PromptHeader;