import type React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, FileIcon, Search, SlidersHorizontal } from "lucide-react";
import type { RootState, AppDispatch } from "@/redux/store";
import { updateSelectedFiles } from "@/redux/conversationSlice";
import type { MyFile } from "@/redux/types/files";
import type { Tag } from "@/redux/types/tags";
import { getTagColor } from "@/utils/files";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { FolderIcon } from "@heroicons/react/24/outline";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const ConversationFileSelect: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const files = useSelector((state: RootState) => state.files.files);
    const selectedFilesFromStore = useSelector(
        (state: RootState) => state.conversation.selectedFiles
    );
    const tags = useSelector((state: RootState) => state.tags?.tags || []);
    const [open, setOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showTagFilter, setShowTagFilter] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        setSelectedFiles(selectedFilesFromStore.map((file) => file.id));
    }, [selectedFilesFromStore]);

    const handleToggleFile = (fileId: number) => {
        setSelectedFiles((prev) => {
            const newSelectedFiles = prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId];

                const selectedFileObjects = files.filter((file) =>
                newSelectedFiles.includes(file.id)
            );
            dispatch(updateSelectedFiles(selectedFileObjects));
            return newSelectedFiles;
        });
    };

    const handleSaveSelection = () => {
        const selectedFileObjects = files.filter((file) =>
            selectedFiles.includes(file.id)
        );
        dispatch(updateSelectedFiles(selectedFileObjects));
        setOpen(false);
    };

    const handleClearSelection = () => {
        setSelectedFiles([]);
        dispatch(updateSelectedFiles([]));
    };

    const handleTagToggle = (tagId: number) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    const filteredFiles = files.filter((file) => {
        const fileName = file.name.toLowerCase();
        const matchesSearch = fileName.includes(searchQuery.toLowerCase());
        const matchesTags =
            selectedTags.length === 0 ||
            file.tags?.some((tagId) => selectedTags.includes(tagId));
        return matchesSearch && matchesTags;
    });

    return (
        <div className="absolute left-3 flex items-center h-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 hover:bg-none bg-none"
                    >
                        <FolderIcon className="h-5 w-5 outline-none" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[400px] p-4"
                    align="start"
                    side="top"
                    sideOffset={16}
                >
                    <div className="flex flex-col gap-4">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files or tags"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-10"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`absolute right-1 h-7 w-7 ${showTagFilter
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    }`}
                                onClick={() => setShowTagFilter(!showTagFilter)}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {showTagFilter && (
                            <div className="flex flex-wrap gap-2">
                                {tags?.map((tag: Tag) => {
                                    const isSelected = selectedTags.includes(
                                        tag.id
                                    );
                                    const colorVariant = getTagColor(tag.label);

                                    return (
                                        <Badge
                                            key={tag.id}
                                            variant={
                                                isSelected
                                                    ? colorVariant
                                                    : "outline"
                                            }
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleTagToggle(tag.id)
                                            }
                                        >
                                            {tag.label}
                                        </Badge>
                                    );
                                })}
                                {tags.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        No tags available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    <div className="max-h-[300px] overflow-y-auto mb-4 -mx-1 px-1">
                        {filteredFiles.map((file: MyFile) => (
                            <div
                                key={file.id}
                                onClick={() => handleToggleFile(file.id)}
                                className="group flex items-center p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                            >
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors
                  ${selectedFiles.includes(file.id)
                                            ? "border-primary bg-primary"
                                            : "border-input group-hover:border-muted-foreground"
                                        }`}
                                >
                                    {selectedFiles.includes(file.id) && (
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                </div>
                                <FileIcon className="h-4 w-4 text-muted-foreground mr-3" />
                                <span className="text-sm font-medium">
                                    {file.name}
                                </span>
                            </div>
                        ))}
                        {filteredFiles.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No matching files found
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSelection}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveSelection}
                        >
                            Continue ({selectedFiles.length})
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ConversationFileSelect;
