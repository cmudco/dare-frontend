import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { createOrUpdatePrompt, deletePrompt } from "../../redux/aynscThunks/prompt";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { formatDate, PROMPTS_TABLE_HEAD } from "../../utils/constants/prompts";
import { openEditModal } from "../../redux/promptSlice";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { Prompt } from "@/redux/types/prompt";
import { DeleteConfirmation } from "../DeleteConfirmation";
import { stripHtml } from '../../utils/textUtils';

interface PromptTableProps {
  searchQuery: string;
}

const PromptTable = ({ searchQuery }: PromptTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { prompts, loading } = useSelector((state: RootState) => state.prompt);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [deletePromptTitle, setDeletePromptTitle] = useState<string>("");

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

  const handleDeleteConfirm = async () => {
    if (deletePromptId) {
      try {
        await dispatch(deletePrompt(deletePromptId)).unwrap();
      } catch (error) {
        console.error("Failed to delete prompt:", error);
      }
    }
    setDeletePromptId(null);
  };

  const handleDelete = async (id: string, title: string) => {
    setDeletePromptId(id);
    setDeletePromptTitle(title || "Untitled");
  };

  const handleEdit = (id: string) => {
    dispatch(openEditModal(id));
  };

  const handleClone = (values: { title: string; content: string }) => {
    dispatch(
      createOrUpdatePrompt({
        id: undefined,
        promptData: {
          title: values.title,
          content: values.content,
        },
      })
    ).then((result) => {
      const payload = result.payload as Prompt
      dispatch(openEditModal(payload.id));
    })
  };

  const renderPromptContent = (content: string) => {
    return stripHtml(content);
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
                      {renderPromptContent(content) || "No content"}
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
                      <DropdownMenuItem onClick={() => handleEdit(id)} className="cursor-pointer">
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone({ title, content })} className="text-yellow-500 cursor-pointer">
                        <span>Clone</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 cursor-pointer" onClick={() => handleDelete(id, title)}>
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

      <DeleteConfirmation
        isOpen={!!deletePromptId}
        onClose={() => setDeletePromptId(null)}
        onDelete={handleDeleteConfirm}
        title="Delete Prompt"
        description="Are you sure you want to delete this prompt? This action cannot be undone."
        itemName={deletePromptTitle}
        confirmText="Delete"
      />
    </div>
  );
};

export default PromptTable;