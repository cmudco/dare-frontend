import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { deletePrompt } from "../../redux/aynscThunks/prompt";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { formatDate, PROMPTS_TABLE_HEAD } from "../../utils/constants/prompts";
import { openEditModal } from "../../redux/promptSlice";
import { Button } from "../UI/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../UI/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../UI/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";


interface PromptTableProps {
  searchQuery: string;
}

const PromptTable = ({ searchQuery }: PromptTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { prompts, loading } = useSelector((state: RootState) => state.prompt);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const promptTitle = prompt.title?.toLowerCase() || "";
      const promptContent = prompt.content?.toLowerCase() || "";
      const matchesSearch = searchQuery === "" ||
        promptTitle.includes(searchQuery.toLowerCase()) ||
        promptContent.includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [prompts, searchQuery]);

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePrompt(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  const handleEdit = (id: string) => {
    dispatch(openEditModal(id));
  };

  return (
    <div className="overflow-auto">
      <Table className="mt-4 w-full min-w-max text-left bg-white">
        <TableHeader>
          <TableRow className="bg-muted">
            {PROMPTS_TABLE_HEAD.map((head) => (
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
          {prompts.length === 0 && loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center p-4">Loading prompts...</TableCell>
            </TableRow>
          ) : filteredPrompts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center p-4">No matching prompts found</TableCell>
            </TableRow>
          ) : (
            paginatedPrompts.map(({ id, title, content, createdAt }) => (
              <TableRow key={id}>
                <TableCell className="p-4">
                  <div>
                    <h3 className="font-medium">{title || "Untitled"}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[300px]">
                      {content || "No content"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="p-4">{formatDate(createdAt)}</TableCell>

                <TableCell className="p-4 text-center ">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hover:bg-gray-200 rounded-md p-2" >
                      <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(id)}>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500" onClick={() => handleDelete(id)}>
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {/* Footer for Pagination & Controls */}
        {filteredPrompts.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={PROMPTS_TABLE_HEAD.length} className="p-4 w-full">
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
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button variant="secondary" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default PromptTable;