import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { deleteFile } from "../../redux/aynscThunks/file";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { TABLE_HEAD } from "../../utils/constants/file";
import { formatFileSize } from "@/utils/files";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../UI/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/select";
import { Button } from "../UI/button";
import { Badge } from "../UI/badge";


const FileTable = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files, loading } = useSelector((state: RootState) => state.files);
    const { tags: allTags } = useSelector((state: RootState) => state.tags);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const totalPages = Math.ceil(files.length / itemsPerPage);
    const paginatedFiles = files.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (id: number) => {
        try {
            await dispatch(deleteFile(id)).unwrap();
        } catch (error) {
            console.error("Failed to delete file:", error);
        }
    };

    return (
        <div className="overflow-auto">
            <Table className="mt-4 w-full min-w-max text-left bg-white">
                <TableHeader>
                    <TableRow className="bg-muted">
                        {TABLE_HEAD.map((head) => (
                            <TableHead key={head} className="cursor-pointer p-4 font-semibold text-sm">
                                <div className="flex items-center justify-between gap-2 opacity-70">
                                    {head}
                                    <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.length === 0 && loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center p-4">Loading files...</TableCell>
                        </TableRow>
                    ) : files.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center p-4">No files found</TableCell>
                        </TableRow>
                    ) : (
                        paginatedFiles.map(({ id, name, fileType, size, tags }) => (
                            <TableRow key={id}>
                                <TableCell className="p-4">{name || "Unnamed"}</TableCell>
                                <TableCell className="p-4">{fileType || "Unknown"}</TableCell>
                                <TableCell className="p-4">{formatFileSize(size)}</TableCell>
                                <TableCell className="p-4">
                                    <div className="flex flex-wrap gap-2 max-w-[150px]">
                                    {Array.isArray(tags) &&
                                        tags.map((tag, i) => (
                                            <Badge key={`${id}-${i}`} variant="secondary">
                                                {allTags.find((t) => t.id == tag)?.label || "Unknown"}
                                            </Badge>
                                        ))}
                                    
                                    </div>
                                </TableCell>
                                <TableCell className="p-4">
                                    <Button variant="destructive" onClick={() => handleDelete(id)} disabled={loading}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

                {/* Footer for Pagination & Controls */}
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} className="p-4 w-full">
                            <div className="flex justify-between items-center w-full">
                                {/* Rows per page dropdown */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">Rows per page:</span>
                                    <Select value={String(itemsPerPage)} onValueChange={(val) => setItemsPerPage(Number(val))}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue placeholder="Rows" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-4">
                                    <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>

            </Table>
        </div>
    );
};

export default FileTable;
