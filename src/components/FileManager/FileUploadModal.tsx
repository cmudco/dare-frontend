import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { resetSelectedTags, closeModal, updateTagChange, updateRemoveTag, updateFilename } from "../../redux/fileSlice";
import { getFiles, uploadNewFile } from "../../redux/aynscThunks/file";
import { addTag, getTags } from "../../redux/aynscThunks/tag";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTrigger, DialogTitle, DialogDescription } from "../UI/dialog";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../UI/select";
import { Badge } from "../UI/badge";


const FileUploadModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getTags());
  }, [dispatch]);

  const { selectedTags, isModalOpen, filename, loading } = useSelector((state: RootState) => state.files);
  const { tags } = useSelector((state: RootState) => state.tags);

  const handleUploadClick = async () => {
    if (selectedFile) {
      await dispatch(uploadNewFile({ files: [selectedFile], name: filename, tags: selectedTags })).unwrap();
      dispatch(resetSelectedTags());
      dispatch(closeModal());
      dispatch(getFiles());
      dispatch(updateFilename(""));
      setSelectedFile(null);
    } else {
      console.error("No file selected");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      dispatch(updateFilename(file.name));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      dispatch(updateFilename(file.name));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCreateTag = () => {
    if (newTag.trim() !== "") {
      dispatch(addTag(newTag));
      setNewTag("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent className="p-6 mx-auto w-[90vw] max-w-md bg-white rounded-lg shadow-lg">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">File Upload</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Upload a file and add tags to categorize it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input value={filename} placeholder="File Name" onChange={(e) => dispatch(updateFilename(e.target.value))} />

          <div className="flex flex-col gap-2">
            <Select onValueChange={(value) => dispatch(updateTagChange(parseInt(value)))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add Tags" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    {tag.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm">
                  {tags.find((t) => t.id === tag)?.label || "Unknown"}
                  <button className="ml-2 text-red-500" onClick={() => dispatch(updateRemoveTag(tag))}>
                    ✕
                  </button>
                </Badge>
              ))}
            </div>

            {/* Create New Tag */}
            <div className="flex gap-2">
              <Input placeholder="New Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
              <Button size="sm" onClick={handleCreateTag}>
                Create Tag
              </Button>
            </div>
          </div>

          {/* File Drop Area */}
          <div
            className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => document.getElementById("fileInput")?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">{selectedFile.name} uploaded</span>
              </div>
            ) : (
              <div className="font-medium text-gray-600">
                Drop your files here or <span className="text-blue-600">browse</span>
              </div>
            )}
            <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" />
            <span className="text-xs text-gray-500 mt-2 block">Maximum size: 1 MB</span>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button onClick={handleUploadClick}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
