import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getWorkflows } from "../../redux/asyncThunks/workflow";
import WorkflowHeader from "./WorkflowHeader";
import WorkflowTable from "./WorkflowTable";
import WorkflowModal from "./WorkflowModal";


const WorkflowManagerLayout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(getWorkflows());
    }, [dispatch]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className='flex flex-col h-full'>
            <div className='p-8 flex-grow overflow-auto'>
                <div className='h-full w-full shadow-none' color='transparent' placeholder=''>
                    <div className='px-0' placeholder=''>
                        <WorkflowHeader onSearch={handleSearch} />
                        <WorkflowTable searchQuery={searchQuery} />
                    </div>
                </div>
                <WorkflowModal />
            </div>
        </div>
    );
};

export default WorkflowManagerLayout;
