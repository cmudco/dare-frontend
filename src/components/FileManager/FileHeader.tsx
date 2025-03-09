import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { openModal } from "../../redux/fileSlice";
import { Button } from "../UI/button";
import { Input } from "../UI/input";

const FileHeader: React.FC = () => {
    const dispatch = useDispatch();

    return (
        <div className='flex items-center justify-between px-2.5'>
            <div className='relative w-[300px] h-[40px] flex items-center'>
                    <Input
                        type="text"
                        placeholder="Search by tag"
                        className=" bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 w-5 h-5 text-gray-500" />
            </div>
            <Button
                className='bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal whitespace-nowrap !gap-6'
                size='default'
                onClick={() => dispatch(openModal())}
            >
                Upload File
            </Button>
        </div>
    );
};

export default FileHeader;