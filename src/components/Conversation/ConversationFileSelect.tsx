import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DocumentIcon, MagnifyingGlassIcon, AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";
import { RootState, AppDispatch } from "../../redux/store";
import { getFiles } from "../../redux/aynscThunks/file";
import { getTags } from "../../redux/aynscThunks/tag";
import { updateSelectedFiles } from "../../redux/conversationSlice";
import { MyFile } from "../../redux/types/files";
import { Tag } from "../../redux/types/tags";
import { FolderIcon } from "@heroicons/react/24/solid";

import { Badge } from "../UI/badge";
import { getTagColor } from "@/utils/files";


const ConversationFileSelect: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const files = useSelector((state: RootState) => state.files.files);
    const tags = useSelector((state: RootState) => state.tags?.tags || []);
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showTagFilter, setShowTagFilter] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const handleOpenModal = () => {
        if (!showModal) {
            dispatch(getFiles());
            dispatch(getTags());
        }
        setShowModal(!showModal);
    };

    const handleClickOutside = useCallback((event: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setShowModal(false);
        }
    }, []);

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

    const getFileName = (filepath: string) => {
        return filepath.split('/').pop() || filepath;
    };

    const handleToggleFile = (fileId: number) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const handleSaveSelection = () => {
        const selectedFileObjects = files.filter(file =>
            selectedFiles.includes(file.id)
        );
        dispatch(updateSelectedFiles(selectedFileObjects));
        handleOpenModal();
    };

    const handleClearSelection = () => {
        setSelectedFiles([]);
    };

    const handleTagToggle = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };


    const filteredFiles = files.filter(file => {
        const fileName = getFileName(file.file).toLowerCase();
        const matchesSearch = fileName.includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || file.tags?.some(tagId => selectedTags.includes(tagId));
        return matchesSearch && matchesTags;
    });

    return (
        <div className="absolute left-3 flex items-center h-full ">
            <FolderIcon
                className="w-5 h-5 cursor-pointer"
                onClick={handleOpenModal}
            />
            {showModal && (
                <div className="absolute bottom-14 left-0 z-50 mb-2"
                    onClick={handleClickOutside as unknown as React.MouseEventHandler<HTMLDivElement>}>
                    <div ref={modalRef}
                        className="bg-white rounded-xl shadow-md p-6 w-[400px] transform transition-all duration-200 ease-out"
                        style={{ boxShadow: "1.85px 1.85px 4.63px 0px #EE183C29, -1.85px -1.85px 4.63px 0px #EE183C29" }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="relative flex items-center">
                                <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search files or tags"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                />
                                <div className="absolute right-2">
                                    <AdjustmentsVerticalIcon
                                        className={`w-5 h-5 cursor-pointer transition-colors ${showTagFilter ? 'text-primary' : 'text-gray-400'}`}
                                        onClick={() => setShowTagFilter(!showTagFilter)}
                                    />
                                </div>
                            </div>
                            {showTagFilter && (
                                <div className="flex flex-wrap gap-2">
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
                        <hr className="border-gray-200 mb-4" />
                        <div className="max-h-[300px] overflow-y-auto mb-4">
                            {filteredFiles.map((file: MyFile) => (
                                <div
                                    key={file.id}
                                    onClick={() => handleToggleFile(file.id)}
                                    className="group flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors
                                        ${selectedFiles.includes(file.id)
                                            ? 'border-primary bg-primary'
                                            : 'border-gray-300 group-hover:border-gray-400'}`}
                                    >
                                        {selectedFiles.includes(file.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <DocumentIcon className="w-5 h-5 text-gray-500 mr-3" />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {getFileName(file.file)}
                                    </span>
                                </div>
                            ))}
                            {filteredFiles.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No matching files found
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                                onClick={handleClearSelection}
                                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleSaveSelection}
                                className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Continue ({selectedFiles.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationFileSelect;
