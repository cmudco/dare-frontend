import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography, Select, Option, Chip, Input } from '@material-tailwind/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { RootState, AppDispatch } from '../../redux/store';
import { resetSelectedTags, closeModal, updateTagChange, updateRemoveTag, updateFilename } from '../../redux/fileSlice';
import { getFiles, uploadNewFile } from '../../redux/aynscThunks/file';

const availableTags = ["Review", "Important", "Info", "Personal", "Work"];

const FileUploadModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTags, isModalOpen, filename, loading } = useSelector(
    (state: RootState) => state.files
  );

  const handleUploadClick = async () => {
    if (selectedFile) {
      await dispatch(uploadNewFile({ files: [selectedFile], name: filename, tags: selectedTags }));
      dispatch(resetSelectedTags());
      dispatch(closeModal());
      dispatch(getFiles());
      dispatch(updateFilename(''));
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

  return (
    <Dialog
      open={isModalOpen}
      handler={() => dispatch(closeModal())}
      size="sm"
      className="p-8 mx-auto shadow-md rounded-2xl xl:w-[40vw] lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center relative xl:min-h-[55vh] min-h-[50vh]"
    >
      <DialogHeader>
        <Typography variant="h5" className="text-center">
          File Upload
        </Typography>
      </DialogHeader>
      <DialogBody
        className="space-y-6 w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Input
          label="File Name"
          value={filename}
          className="w-full"
          onChange={(e) => dispatch(updateFilename(e.target.value))}
        />

        <div className="flex flex-col gap-2">
          <Select
            label="Add Tags"
            onChange={(value) => {
              if (value) {
                dispatch(updateTagChange(value as string));
              }
            }}
          >
            {availableTags.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                value={tag}
                onClose={() => dispatch(updateRemoveTag(tag))}
                className="bg-yellow-100 text-yellow-600"
              />
            ))}
          </div>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <Typography variant="small" className="font-medium text-green-700">
                {selectedFile.name} uploaded
              </Typography>
            </div>
          ) : (
            <div className="font-medium">
              Drop your files here or <span className="text-blue-600">browse</span>
            </div>
          )}
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <Typography variant="small" className="mt-2 text-gray-500">
            Maximum size: 1 MB
          </Typography>
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-end space-x-2 p-4">
        <Button color="gray" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button className="bg-primary" onClick={handleUploadClick}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default FileUploadModal;
