import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { openModal } from "../../redux/fileSlice";

import { Input } from "../UI/input";
import { Button } from "../UI/button";

const PromptHeader: React.FC = () => {
    const dispatch = useDispatch();

    return (
        <div className="flex items-center justify-between px-2.5">
            <div className="w-[300px] h-[40px] relative flex items-center">
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search prompts"
                    className="bg-white pl-10"
                />
            </div>

            <Button
                variant="default"
                className="bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal whitespace-nowrap"
                onClick={() => dispatch(openModal())}
            >
                Create Prompt
            </Button>
        </div>
    );
};

export default PromptHeader;
