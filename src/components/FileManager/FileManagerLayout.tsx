// src/components/FileManager/FileManager.tsx
import { useState } from "react";

import Header from "../Layout/Header";
import FileTable from "./FileTable";
import FileUploadModal from "./FileUploadModal";
import Sidebar from "../Layout/SideBar";

const FileManagerLayout = () => {
  const [files, setFiles] = useState([
    {
      name: "syllabus_01.pdf",
      type: "PDF",
      size: "1 KB",
      date: "9/19/2024",
      tag: "Review",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = (file) => {
    setFiles([...files, file]);
    setIsModalOpen(false);
  };

  return (
    <div className='flex'>

      <div className='flex-grow'>
        <Header />
        <div className='p-6'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>Files</h1>
            <button
              className='bg-red-500 text-white px-4 py-2 rounded'
              onClick={() => setIsModalOpen(true)}
            >
              Upload File
            </button>
          </div>
          <FileTable files={files} />
          {isModalOpen && (
            <FileUploadModal
              onClose={() => setIsModalOpen(false)}
              onUpload={handleFileUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManagerLayout;
