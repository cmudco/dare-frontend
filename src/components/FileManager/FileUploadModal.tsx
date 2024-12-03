// src/components/FileManager/FileUploadModal.tsx
import { useState } from "react";

const FileUploadModal = ({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: any) => void;
}) => {
  const [fileName, setFileName] = useState("");
  const [tag, setTag] = useState("");

  const handleUpload = () => {
    onUpload({
      name: fileName,
      type: "PDF",
      size: "1 KB",
      date: new Date().toLocaleDateString(),
      tag,
    });
    setFileName("");
    setTag("");
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center'>
      <div className='bg-white p-6 rounded-lg w-[90%] max-w-md'>
        <h2 className='text-lg font-bold mb-4'>File Upload</h2>
        <input
          type='text'
          placeholder='File Name'
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className='w-full border px-3 py-2 rounded mb-4'
        />
        <input
          type='text'
          placeholder='Add Tag'
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className='w-full border px-3 py-2 rounded mb-4'
        />
        <button
          onClick={handleUpload}
          className='bg-blue-500 text-white px-4 py-2 rounded mr-2'
        >
          Upload
        </button>
        <button
          onClick={onClose}
          className='bg-gray-500 text-white px-4 py-2 rounded'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FileUploadModal;
