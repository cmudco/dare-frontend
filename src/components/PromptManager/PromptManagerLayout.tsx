import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getFiles } from "../../redux/aynscThunks/file";

import PromptUploadModal from "./PromptUploadModal";
import PromptHeader from "./PromptHeader";
// import PromptTable from "./PromptTable";



const PromptManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto'>
        <div className='h-full w-full shadow-none' color='transparent' placeholder=''>
          <div className='px-0' placeholder='' >
            <PromptHeader />
            {/* <PromptTable /> */}
          </div>
        </div>
        <PromptUploadModal />
      </div>
    </div>
  );
};

export default PromptManagerLayout;
