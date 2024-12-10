import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Input, Button } from "@material-tailwind/react";
import { useDispatch } from "react-redux";
import { openModal } from "../../redux/fileSlice";

const FileHeader: React.FC = () => {
    const dispatch = useDispatch();

    return (
        <div className='flex items-center justify-between px-2.5'>
            <div className='w-[300px] h-[40px] relative flex items-center'>
                <Input
                    label='Search by tag'
                    variant='outlined'
                    className='bg-white'
                    icon={
                        <MagnifyingGlassIcon className='absolute h-5 w-5 text-gray-500' />
                    }
                />
            </div>
            <Button
                className='bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal whitespace-nowrap !gap-6'
                size='lg'
                onClick={() => dispatch(openModal())}
            >
                Upload File
            </Button>
        </div>
    );
};

export default FileHeader;