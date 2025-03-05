import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { deleteFile, } from "../../redux/aynscThunks/file";
import { Typography, Chip, Button } from "@material-tailwind/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { TABLE_HEAD } from "../../utils/constants/file";
import { formatFileSize } from "@/utils/files";


const FileTable = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files, loading } = useSelector((state: RootState) => state.files);
    const {tags: allTags} = useSelector((state: RootState) => state.tags);
    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteFile(id)).unwrap();
        
        } catch (error) {
            console.error("Failed to delete file:", error);
        }
    };


    return (
        <div className="overflow-auto">
            <table className="mt-4 w-full min-w-max table-auto text-left bg-white">
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th
                                key={head}
                                className="cursor-pointer bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                            >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="flex items-center justify-between gap-2 font-semibold text-sm leading-none opacity-70"
                                >
                                    {head}
                                    <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {files.length == 0 && loading ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                <Typography>Loading files...</Typography>
                            </td>
                        </tr>
                    ) : files.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                <Typography>No files found</Typography>
                            </td>
                        </tr>
                    ) : (
                        files.map(({ id, name, fileType, size, tags }) => {
                            const classes = "p-4";
                            return (
                                <tr key={id}>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {name || "Unnamed"}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {fileType || "Unknown"}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {formatFileSize(size)}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <div className="flex gap-2">
                                            {Array.isArray(tags) && tags.map((tag, i) => (
                                                <Chip
                                                    key={`${id}-${i}`}
                                                    variant="ghost"
                                                    className="font-normal text-sm transform-none"
                                                    value={allTags.find((t) => t.id == tag)?.label}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className={classes}>
                                        <Button
                                            variant="outlined"
                                            size="sm"
                                            color="red"
                                            onClick={() => handleDelete(id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FileTable;