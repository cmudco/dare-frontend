import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  Card,
  CardBody,
} from "@material-tailwind/react";
import { getFiles } from "../../redux/aynscThunks/file";

import FileUploadModal from "./FileUploadModal";
import FileHeader from "./FileHeader";
import FileTable from "./FileTable";
import FileTableControls from "./FileTableControls";



const FileManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto'>
        <Card className='h-full w-full shadow-none' color='transparent' placeholder=''>
          <CardBody className='px-0' placeholder='' >
            <FileHeader />

            <FileTable />

          </CardBody>
          <FileTableControls />
        </Card>

        {/* Upload Modal */}
        <FileUploadModal />
      </div>
    </div>
  );
};

export default FileManagerLayout;
