import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getFiles } from "../../redux/aynscThunks/file";

import FileUploadModal from "./FileUploadModal";
import FileHeader from "./FileHeader";
import FileTable from "./FileTable";

const FileManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto'>
        <div className='h-full w-full shadow-none bg-transparent'>
          <div className='px-0'>
            <FileHeader />
            <FileTable />
          </div>
        </div>

        <FileUploadModal />
      </div>
    </div>
  );
};

export default FileManagerLayout;
