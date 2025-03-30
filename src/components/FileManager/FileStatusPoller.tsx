import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { checkJobStatuses, getFiles } from "../../redux/aynscThunks/file";
import { FileStatus } from "@/utils/constants/file";

const FileStatusPoller: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files } = useSelector((state: RootState) => state.files);
    const prevProcessingCount = useRef<number>(0);

    useEffect(() => {
        const processingFiles = files.filter(file => file.status === FileStatus.PROCESSING);
        const currentProcessingCount = processingFiles.length;

        if (prevProcessingCount.current > 0 && currentProcessingCount === 0) {
            dispatch(getFiles());
        }
        prevProcessingCount.current = currentProcessingCount;

        if (currentProcessingCount > 0) {
            const interval = setInterval(() => {
                const fileIds = processingFiles.map(file => file.id);
                dispatch(checkJobStatuses(fileIds)).unwrap()
                    .then((results) => {
                        const stillProcessing = results.some(result => result.status === FileStatus.PROCESSING);
                        if (!stillProcessing) {
                            clearInterval(interval);
                        }
                    })
                    .catch((error) => {
                        console.error("Polling error:", error);
                        clearInterval(interval);
                    });
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [dispatch, files]);

    return null;
};

export default FileStatusPoller;