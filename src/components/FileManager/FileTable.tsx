import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { deleteFile, getFolders } from '../../redux/asyncThunks/file'
import {
  addSelectedItem,
  removeSelectedItem,
  openShareModal,
} from '../../redux/fileSlice'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { TABLE_HEAD } from '../../utils/constants/file'
import { formatFileSize } from '@/utils/files'
import { SortDirection, sortFiles } from '@/utils/sortUtils'
import {
  filterFiles,
  paginateItems,
  getTotalPages,
  resetPaginationOnFilter,
  handleSelectAllItems,
  getSelectionState,
  createFilterConfig,
  createPaginationConfig,
} from '@/utils/tableUtils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  EllipsisVerticalIcon,
  Trash2,
  Tag,
  Eye,
  Share2,
  Globe,
  Users,
  ScanText,
} from 'lucide-react'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { getStatusDisplay } from '@/utils/constants/files'
import { SortDirectionEnum } from '@/utils/constants/sort'
import FileTagModal from './FileTagModal'
import FileViewerModal from './FileViewerModal'
import TagsDisplay from './TagsDisplay'
import { formatDate } from '@/utils/constants/prompts'
import OcrApprovalDialog from './OcrApprovalDialog'

const FileTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    files,
    loading,
    searchQuery,
    selectedTags,
    selectedItems,
    mediaTypeFilter,
  } = useSelector((state: RootState) => state.files)
  const { tags: allTags } = useSelector((state: RootState) => state.tags)
  const user = useSelector((state: RootState) => state.user.user)
  const isSyftboxUser = user?.isSyftboxFileStorage ?? false

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [deleteFileName, setDeleteFileName] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )
  const [tagFileId, setTagFileId] = useState<number | null>(null)
  const [tagFileName, setTagFileName] = useState<string>('')
  const [tagFileExistingTags, setTagFileExistingTags] = useState<number[]>([])
  const [viewFileId, setViewFileId] = useState<number | null>(null)
  const [viewFileName, setViewFileName] = useState<string>('')
  const [viewFileType, setViewFileType] = useState<string>('')
  const [ocrReviewFileId, setOcrReviewFileId] = useState<number | null>(null)

  const actionableOcrFiles = useMemo(
    () =>
      files.filter((file) =>
        ['awaiting_approval', 'partial'].includes(file.ocr?.status ?? '')
      ),
    [files]
  )
  const ocrReviewFile =
    files.find((file) => file.id === ocrReviewFileId) ?? null

  const filteredFiles = useMemo(() => {
    if (!user) return []
    // SyftBox files have vectorDbSource: null — skip vectorDb filtering for SyftBox users
    if (!isSyftboxUser && user.vectorDb === undefined) return []
    const filterOptions = createFilterConfig(
      searchQuery,
      selectedTags,
      isSyftboxUser ? undefined : user.vectorDb,
      mediaTypeFilter
    )
    return filterFiles(files, filterOptions)
  }, [files, searchQuery, selectedTags, user, mediaTypeFilter, isSyftboxUser])

  const sortedFiles = useMemo(() => {
    return sortFiles(filteredFiles, sortColumn, sortDirection, allTags)
  }, [filteredFiles, sortColumn, sortDirection, allTags])

  const totalPages = getTotalPages(sortedFiles.length, itemsPerPage)
  const paginationConfig = createPaginationConfig(currentPage, itemsPerPage)
  const paginatedFiles = paginateItems(sortedFiles, paginationConfig)

  useEffect(() => {
    resetPaginationOnFilter(setCurrentPage)
  }, [searchQuery, selectedTags, mediaTypeFilter])

  const handleSelectAll = (isSelected: boolean) => {
    const shouldSelectAll = !isIndeterminate && isSelected
    handleSelectAllItems(
      shouldSelectAll,
      paginatedFiles,
      selectedItems,
      (id: number) => dispatch(addSelectedItem(id)),
      (id: number) => dispatch(removeSelectedItem(id))
    )
  }

  const { isAllSelected, isIndeterminate } = getSelectionState(
    paginatedFiles,
    selectedItems
  )

  const handleDeleteConfirm = async () => {
    if (deleteFileId !== null) {
      try {
        await dispatch(deleteFile(deleteFileId)).unwrap()
        dispatch(getFolders())
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }
    setDeleteFileId(null)
  }

  const handleDelete = async (id: number, name: string) => {
    setDeleteFileId(id)
    setDeleteFileName(name || 'Unnamed')
  }

  const handleTag = (id: number, name: string, existingTags: number[]) => {
    setTagFileId(id)
    setTagFileName(name || 'Unnamed')
    setTagFileExistingTags(existingTags)
  }

  const handleView = (id: number, name: string, fileType: string) => {
    setViewFileId(id)
    setViewFileName(name || 'Unnamed')
    setViewFileType(fileType || '')
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) =>
        prev === SortDirectionEnum.ASC
          ? SortDirectionEnum.DESC
          : SortDirectionEnum.ASC
      )
    } else {
      setSortColumn(column)
      setSortDirection(SortDirectionEnum.ASC)
    }
  }

  return (
    <div className='overflow-auto'>
      {actionableOcrFiles.length > 0 && (
        <div className='mt-4 flex min-w-max items-center justify-between gap-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-md border border-amber-500/30 bg-background'>
              <ScanText className='h-4 w-4 text-amber-600' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>
                {actionableOcrFiles[0].ocr?.status === 'partial'
                  ? 'Scanned-page transcription can continue'
                  : 'Scanned-page transcription needs approval'}
              </p>
              <p className='text-xs text-muted-foreground'>
                {actionableOcrFiles.length === 1
                  ? actionableOcrFiles[0].ocr?.status === 'partial'
                    ? `${actionableOcrFiles[0].name}: ${actionableOcrFiles[0].ocr?.processedPages} of ${actionableOcrFiles[0].ocr?.detectedPages} pages complete · ${actionableOcrFiles[0].ocr?.remainingPages ?? Math.max((actionableOcrFiles[0].ocr?.detectedPages ?? 0) - (actionableOcrFiles[0].ocr?.processedPages ?? 0), 0)} remaining.`
                    : `${actionableOcrFiles[0].name} has ${actionableOcrFiles[0].ocr?.detectedPages} pages without readable text.`
                  : `${actionableOcrFiles.length} files have scanned-page actions waiting.`}
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setOcrReviewFileId(actionableOcrFiles[0].id)}
          >
            {actionableOcrFiles[0].ocr?.status === 'partial'
              ? 'Continue transcription'
              : 'Review cost'}
          </Button>
        </div>
      )}
      <Table className='mt-4 w-full min-w-max bg-background text-left'>
        <TableHeader>
          <TableRow className='bg-muted'>
            <TableHead
              key='select-all'
              className='w-[50px] cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors select-none'
            >
              <div className='flex items-center justify-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded-sm border-border text-primary focus:ring-primary'
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate
                  }}
                />
              </div>
            </TableHead>
            {TABLE_HEAD.filter((head) => head !== 'Select').map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer p-4 text-sm font-semibold text-foreground transition-colors duration-150 select-none ${head !== 'Action' ? 'hover:bg-accent hover:opacity-100' : ''}`}
                onClick={() => head !== 'Action' && handleSort(head)}
              >
                <div className='flex items-center gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && (
                    <ChevronUpDownIcon
                      strokeWidth={2}
                      className={`h-4 w-4 ${sortColumn === head ? 'text-blue-500' : ''}`}
                      style={{
                        transform:
                          sortColumn === head &&
                          sortDirection === SortDirectionEnum.DESC
                            ? 'rotate(180deg)'
                            : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                Loading files...
              </TableCell>
            </TableRow>
          ) : sortedFiles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='p-4 text-center'
              >
                No matching files found
              </TableCell>
            </TableRow>
          ) : (
            paginatedFiles.map(
              ({
                id,
                name,
                fileType,
                size,
                tags,
                status,
                errorMessage,
                processingStage,
                ocr,
                isSharedByMe,
                isSharedPublicly,
                createdAt,
              }) => (
                <TableRow key={id}>
                  <TableCell className='w-[50px] p-4 text-center'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded-sm border-border text-primary focus:ring-primary'
                      checked={selectedItems.includes(id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(addSelectedItem(id))
                        } else {
                          dispatch(removeSelectedItem(id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className='max-w-[250px] p-4'>
                    <div className='flex items-center gap-1.5'>
                      <span className='truncate' title={name || 'Unnamed'}>
                        {name || 'Unnamed'}
                      </span>
                      {isSyftboxUser && isSharedPublicly && (
                        <span title='Shared with everyone'>
                          <Globe className='h-3.5 w-3.5 shrink-0 text-blue-500' />
                        </span>
                      )}
                      {isSyftboxUser && isSharedByMe && !isSharedPublicly && (
                        <span title='Shared with specific users'>
                          <Users className='h-3.5 w-3.5 shrink-0 text-green-600' />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[150px] p-4'>
                    <div className='truncate' title={fileType || 'Unknown'}>
                      {fileType || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className='p-4'>{formatFileSize(size)}</TableCell>
                  <TableCell className='p-4'>{formatDate(createdAt)}</TableCell>
                  <TableCell className='p-4'>
                    <div className='flex flex-wrap items-center gap-1'>
                      <TagsDisplay
                        tags={tags || []}
                        allTags={allTags}
                        fileId={id}
                        maxVisible={3}
                      />
                      {isSharedByMe && (
                        <span className='inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground'>
                          Shared by you
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='p-4'>
                    {getStatusDisplay(status, errorMessage, processingStage)}
                  </TableCell>
                  <TableCell className='p-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-accent'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-muted-foreground' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {(ocr?.status === 'awaiting_approval' ||
                          ocr?.status === 'partial') && (
                          <DropdownMenuItem
                            className='cursor-pointer'
                            onClick={() => setOcrReviewFileId(id)}
                          >
                            <ScanText className='mr-2 h-4 w-4' />
                            <span>
                              {ocr.status === 'partial'
                                ? 'Continue transcription'
                                : 'Review transcription'}
                            </span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleView(id, name, fileType)}
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='cursor-pointer'
                          onClick={() => handleTag(id, name, tags || [])}
                        >
                          <Tag className='mr-2 h-4 w-4' />
                          <span>
                            {!Array.isArray(tags) || tags.length === 0
                              ? 'Add Tags'
                              : 'Edit Tags'}
                          </span>
                        </DropdownMenuItem>
                        {isSyftboxUser && (
                          <DropdownMenuItem
                            className='cursor-pointer'
                            onClick={() =>
                              dispatch(openShareModal({ id, name }))
                            }
                          >
                            <Share2 className='mr-2 h-4 w-4' />
                            <span>Share</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className='cursor-pointer text-red-500'
                          onClick={() => handleDelete(id, name)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>

        {sortedFiles.length > 0 && (
          <TableFooter>
            <TableRow className='bg-muted/50'>
              <TableCell
                colSpan={TABLE_HEAD.length + 1}
                className='w-full p-4 text-foreground'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-foreground'>
                      Rows per page:
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className='w-[80px] bg-background'>
                        <SelectValue placeholder='Rows' />
                      </SelectTrigger>
                      <SelectContent className='bg-background'>
                        <SelectItem value='5' className='hover:bg-accent'>
                          5
                        </SelectItem>
                        <SelectItem value='10' className='hover:bg-accent'>
                          10
                        </SelectItem>
                        <SelectItem value='20' className='hover:bg-accent'>
                          20
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Button
                      variant='secondary'
                      size='sm'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className='text-sm text-foreground'>
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                      variant='secondary'
                      size='sm'
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
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
        isOpen={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete File'
        description='Are you sure you want to delete this file? This action cannot be undone.'
        itemName={deleteFileName}
        confirmText='Delete'
      />

      <FileTagModal
        isOpen={tagFileId !== null}
        onClose={() => setTagFileId(null)}
        fileId={tagFileId}
        fileName={tagFileName}
        existingTags={tagFileExistingTags}
      />

      <FileViewerModal
        isOpen={viewFileId !== null}
        onClose={() => setViewFileId(null)}
        fileId={viewFileId}
        fileName={viewFileName}
        fileType={viewFileType}
      />

      <OcrApprovalDialog
        file={ocrReviewFile}
        onClose={() => setOcrReviewFileId(null)}
      />
    </div>
  )
}

export default FileTable
