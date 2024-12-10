import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
    Typography,
    Chip,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import {
    ChevronUpDownIcon,
    PencilIcon,
    ArchiveBoxIcon,
} from "@heroicons/react/24/solid";

import { TAG_COLORS, TABLE_HEAD } from "../../utils/constants/file";
import { updateFileArchive } from "../../redux/fileSlice";

const FileTable = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files } = useSelector((state: RootState) => state.files);

    return (
        <div className='overflow-scroll'>
            <table className='mt-4 w-full min-w-max table-auto text-left bg-white'>
                <thead>
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th
                                key={head}
                                className='cursor-pointer bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50'
                            >
                                <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className='flex items-center justify-between gap-2 font-semibold text-sm leading-none opacity-70'
                                >
                                    {head}{" "}
                                    <ChevronUpDownIcon strokeWidth={2} className='h-4 w-4' />
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {files.map(
                        (
                            { id, file, file_size, uploaded_at, tags },
                            index
                        ) => {
                            const isLast = index === files.length - 1;
                            const classes = isLast ? "p-4" : "p-4";

                            return (
                                <tr key={id}>
                                    <td className={classes}>
                                        <Typography
                                            variant='small'
                                            color='blue-gray'
                                            className='font-normal'
                                        >
                                            {file}
                                        </Typography>
                                    </td>

                                    <td className={classes}>
                                        <Typography
                                            variant='small'
                                            color='blue-gray'
                                            className='font-normal'
                                        >
                                            {file_size}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            variant='small'
                                            color='blue-gray'
                                            className='font-normal'
                                        >
                                            {new Date(uploaded_at).toLocaleDateString()}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        {tags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                variant='ghost'
                                                className='flex justify-center py-0.5 items-center px rounded-2xl text-center font-normal text-sm normal-case'
                                                value={tag}
                                                color={TAG_COLORS[tag]}
                                            />
                                        ))}
                                    </td>
                                    <td className={classes}>
                                        <div className='flex items-center justify-center'>
                                            <Tooltip content='Edit File'>
                                                <IconButton
                                                    variant='text'
                                                    onClick={() => {
                                                        // dispatch(openEditModal({
                                                        //  file, tags,
                                                        //     directory: "",
                                                        //     file_size: "",
                                                        //     uploaded_at: ""
                                                        // }));
                                                    }}
                                                >
                                                    <PencilIcon className='h-4 w-4' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip content='Archive File'>
                                                <IconButton
                                                    variant='text'
                                                    onClick={() => dispatch(updateFileArchive(id))}
                                                >
                                                    <ArchiveBoxIcon className='h-4 w-4' />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FileTable;