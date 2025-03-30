import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Loader2 } from "lucide-react";
import { FileStatus } from "@/utils/constants/file";
import { getJobStatusDisplay } from "@/utils/constants/files";

const ProcessingFilesPopover: React.FC = () => {
    const { files, jobStatuses } = useSelector((state: RootState) => state.files);

    const processingFiles = files.filter(file => file.status === FileStatus.PROCESSING);

    if (processingFiles.length === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="fixed top-24 right-4">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing: <Badge className="ml-2">{processingFiles.length}</Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-2">
                    <h4 className="font-medium">Processing Files</h4>
                    <ul className="space-y-2">
                        {processingFiles.map(file => (
                            <li key={file.id} className="flex items-center space-x-2">
                                <span className="text-sm truncate">{file.name}</span>
                                {getJobStatusDisplay(jobStatuses[file.id]?.jobStatus)}
                            </li>
                        ))}
                    </ul>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ProcessingFilesPopover;