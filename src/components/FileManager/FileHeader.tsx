import { MagnifyingGlassIcon, AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../redux/fileSlice";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { RootState } from "../../redux/store";
import { useState } from "react";
import { Tag } from "../../redux/types/tags";
import { Badge } from "../UI/badge";
import { getTagColor } from "@/utils/files";

interface FileHeaderProps {
  onSearch: (query: string) => void;
  onTagsChange: (tags: number[]) => void;
}

const FileHeader: React.FC<FileHeaderProps> = ({ onSearch, onTagsChange }) => {
  const dispatch = useDispatch();
  const { tags } = useSelector((state: RootState) => state.tags);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  return (
    <div className='flex flex-col gap-4 px-2.5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='relative w-[300px] h-[40px] flex items-center'>
            <Input
              type="text"
              placeholder="Search by Files"
              className="bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <MagnifyingGlassIcon className="absolute right-3 w-5 h-5 text-gray-500" />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowTagFilter(!showTagFilter)}
          >
            <AdjustmentsVerticalIcon className={`w-5 h-5 ${showTagFilter ? 'text-primary' : 'text-gray-500'}`} />
            Filter by Tags
          </Button>
        </div>
        <Button
          className="bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal whitespace-nowrap !gap-6"
          size="default"
          onClick={() => dispatch(openModal())}
        >
          Upload File
        </Button>
      </div>

      {showTagFilter && (
        <div className="flex flex-wrap gap-2 py-3">
          {tags.map((tag: Tag) => {
            const isSelected = selectedTags.includes(tag.id);
            const colorVariant = getTagColor(tag.label);

            return (
              <Badge
                key={tag.id}
                variant={colorVariant}
                selected={isSelected}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.label}
              </Badge>
            );
          })}
          {tags.length === 0 && (
            <div className="text-sm text-gray-500">No tags available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileHeader;