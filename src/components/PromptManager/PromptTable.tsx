import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { toast } from '@/utils/toast'

import { RootState, AppDispatch } from '../../redux/store'
import {
  clonePrompt,
  deletePrompt,
  getPrompts,
} from '../../redux/asyncThunks/prompt'
import {
  publishPrompt,
  unpublishPrompt,
} from '../../redux/asyncThunks/promptsLibrary'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import {
  formatDate,
  PROMPTS_TABLE_HEAD,
  groupPrompts,
} from '../../utils/constants/prompts'
import { openEditModal } from '../../redux/promptSlice'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
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
import { EllipsisVerticalIcon, Share2, Users } from 'lucide-react'
import { Prompt, PromptTableProps } from '@/redux/types/prompt'
import { DeleteConfirmation } from '../DeleteConfirmation'
import { stripHtml } from '../../utils/textUtils'
import { TrashIcon } from '@heroicons/react/24/outline'
import { DocumentDuplicateIcon, PencilIcon } from '@heroicons/react/20/solid'
import { EyeIcon } from '@heroicons/react/24/outline'
import PromptVersionHistoryModal from './PromptVersionHistoryModal'
import {
  updateSortState,
  SortDirection,
  sortPromptGroups,
} from '@/utils/sortUtils'
import { SortDirectionEnum } from '@/utils/constants/sort'
import { features } from '@/config/environment'
import { openShareDialog, openManageDialog } from '@/redux/sharingSlice'
import { ShareableEntityType } from '@/redux/types/sharing'

const PromptTable = ({ searchQuery }: PromptTableProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { prompts, loading } = useSelector((state: RootState) => state.prompt)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deletePromptId, setDeletePromptId] = useState<number | null>(null)
  const [deletePromptTitle, setDeletePromptTitle] = useState<string>('')
  const [versionHistoryPromptId, setVersionHistoryPromptId] = useState<
    number | null
  >(null)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirectionEnum.ASC
  )

  const groupedPrompts = useMemo(() => groupPrompts(prompts), [prompts])

  const latestPromptGroups = useMemo(() => {
    return groupedPrompts.map((group) => {
      return { ...group, versions: [group.versions[0]] }
    })
  }, [groupedPrompts])

  const filteredPromptGroups = useMemo(() => {
    return latestPromptGroups.filter((group) => {
      const promptTitle = group.rootPrompt.title?.toLowerCase() || ''
      const matchesSearch =
        searchQuery === '' ||
        promptTitle.includes(searchQuery.toLowerCase()) ||
        group.versions[0].content
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [latestPromptGroups, searchQuery])

  const sortedPromptGroups = useMemo(() => {
    return sortPromptGroups(filteredPromptGroups, sortColumn, sortDirection)
  }, [filteredPromptGroups, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    updateSortState(column, sortColumn, setSortColumn, setSortDirection)
  }

  const totalItems = sortedPromptGroups.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedPromptGroups = sortedPromptGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleDeleteConfirm = async () => {
    if (deletePromptId) {
      try {
        await dispatch(deletePrompt(deletePromptId)).unwrap()
        dispatch(getPrompts())
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    }
    setDeletePromptId(null)
  }

  const handleDelete = async (id: number, title: string) => {
    setDeletePromptId(id)
    setDeletePromptTitle(title || 'Untitled')
  }

  const handleEdit = (id: number) => {
    dispatch(openEditModal(id))
  }

  const handleClone = (id: number) => {
    dispatch(clonePrompt(id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const payload = result.payload as Prompt
        dispatch(openEditModal(payload.id))
      }
    })
  }

  const handleViewVersions = (id: number) => {
    setVersionHistoryPromptId(id)
  }

  const handleCloseVersionHistory = () => {
    setVersionHistoryPromptId(null)
  }

  const handlePublish = async (id: number) => {
    try {
      await dispatch(publishPrompt({ id })).unwrap()
      dispatch(getPrompts())
      toast.success('Prompt published to library')
    } catch (error) {
      toast.error('Failed to publish prompt')
      console.error('Failed to publish prompt:', error)
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      await dispatch(unpublishPrompt(id)).unwrap()
      dispatch(getPrompts())
      toast.success('Prompt unpublished from library')
    } catch (error) {
      toast.error('Failed to unpublish prompt')
      console.error('Failed to unpublish prompt:', error)
    }
  }

  const handleShare = (id: number, title: string) => {
    dispatch(
      openShareDialog({
        type: ShareableEntityType.Prompt,
        id,
        title: title || 'Untitled',
      })
    )
  }

  const handleManageShares = (id: number, title: string) => {
    dispatch(
      openManageDialog({
        type: ShareableEntityType.Prompt,
        id,
        title: title || 'Untitled',
      })
    )
  }

  const renderPromptContent = (content: string) => {
    return stripHtml(content)
  }

  const selectedVersions = useMemo(() => {
    if (!versionHistoryPromptId) return []
    const group = groupedPrompts.find((g) =>
      g.versions.some((p) => p.id === versionHistoryPromptId)
    )
    return group ? group.versions : []
  }, [versionHistoryPromptId, groupedPrompts])

  return (
    <div className='overflow-auto'>
      <Table className='mt-4 w-full min-w-max bg-background bg-white text-left'>
        <TableHeader>
          <TableRow className='bg-background bg-muted'>
            {PROMPTS_TABLE_HEAD.map((head) => (
              <TableHead
                key={head}
                className={`cursor-pointer select-none p-4 text-sm font-semibold transition-colors duration-150 dark:text-white ${
                  head !== 'Action'
                    ? 'hover:bg-gray-100 hover:opacity-100 dark:hover:bg-gray-700'
                    : ''
                }`}
                onClick={() => head !== 'Action' && handleSort(head)}
              >
                <div className='flex items-center justify-between gap-2 opacity-70'>
                  {head}
                  {head !== 'Action' && (
                    <ChevronUpDownIcon
                      strokeWidth={2}
                      className={`h-4 w-4 ${
                        sortColumn === head ? 'text-blue-500' : ''
                      }`}
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
          {prompts.length === 0 && loading ? (
            <TableRow>
              <TableCell
                colSpan={PROMPTS_TABLE_HEAD.length}
                className='p-4 text-center dark:text-white'
              >
                Loading prompts...
              </TableCell>
            </TableRow>
          ) : sortedPromptGroups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={PROMPTS_TABLE_HEAD.length}
                className='p-4 text-center dark:text-white'
              >
                No matching prompts found
              </TableCell>
            </TableRow>
          ) : (
            paginatedPromptGroups.map((group) =>
              group.versions.map((prompt) => (
                <TableRow key={prompt.id} className='dark:border-gray-700'>
                  <TableCell className='p-4'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium dark:text-white'>
                          {prompt.title || 'Untitled'}
                        </h3>
                        <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
                          v{prompt.version || 1}
                        </span>
                        {features.enableSharing && prompt.isPublished && (
                          <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                            Published
                          </span>
                        )}
                      </div>
                      <p className='max-w-[300px] truncate text-sm text-gray-500 dark:text-gray-400'>
                        {renderPromptContent(prompt.content) || 'No content'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className='p-4 dark:text-white'>
                    {formatDate(prompt.createdAt)}
                  </TableCell>
                  <TableCell className='p-4 text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700'>
                        <EllipsisVerticalIcon className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEdit(prompt.id)}
                          className='cursor-pointer'
                        >
                          <PencilIcon className='h-4 w-4' />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleClone(prompt.id)}
                          className='cursor-pointer text-yellow-500'
                        >
                          <DocumentDuplicateIcon className='h-4 w-4' />
                          <span>Clone</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewVersions(prompt.id)}
                          className='cursor-pointer text-blue-500'
                        >
                          <EyeIcon className='h-4 w-4' />
                          <span>View Versions</span>
                        </DropdownMenuItem>
                        {features.enableSharing &&
                          (prompt.isPublished ? (
                            <DropdownMenuItem
                              onClick={() => handleUnpublish(prompt.id)}
                              className='cursor-pointer text-orange-500'
                            >
                              <GlobeAltIcon className='h-4 w-4' />
                              <span>Unpublish</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handlePublish(prompt.id)}
                              className='cursor-pointer text-green-500'
                            >
                              <GlobeAltIcon className='h-4 w-4' />
                              <span>Publish</span>
                            </DropdownMenuItem>
                          ))}
                        {features.enableSharing &&
                          prompt.canShare !== false && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleShare(
                                  prompt.id,
                                  prompt.title || 'Untitled'
                                )
                              }
                              className='cursor-pointer'
                            >
                              <Share2 className='h-4 w-4' />
                              <span>Share with User</span>
                            </DropdownMenuItem>
                          )}
                        {features.enableSharing &&
                          prompt.canShare !== false && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleManageShares(
                                  prompt.id,
                                  prompt.title || 'Untitled'
                                )
                              }
                              className='cursor-pointer'
                            >
                              <Users className='h-4 w-4' />
                              <span>Manage Shares</span>
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem
                          className='cursor-pointer text-red-500'
                          onClick={() =>
                            handleDelete(prompt.id, prompt.title || 'Untitled')
                          }
                        >
                          <TrashIcon className='h-4 w-4' />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )
          )}
        </TableBody>

        {sortedPromptGroups.length > 0 && (
          <TableFooter>
            <TableRow className='bg-background'>
              <TableCell
                colSpan={PROMPTS_TABLE_HEAD.length}
                className='w-full p-4 dark:text-white'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm dark:text-white'>
                      Rows per page:
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className='w-[80px] bg-background dark:border-gray-700 dark:text-white'>
                        <SelectValue placeholder='Rows' />
                      </SelectTrigger>
                      <SelectContent className='bg-background dark:border-gray-700'>
                        <SelectItem
                          value='5'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
                          5
                        </SelectItem>
                        <SelectItem
                          value='10'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
                          10
                        </SelectItem>
                        <SelectItem
                          value='20'
                          className='dark:text-white dark:hover:bg-white/10'
                        >
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
                    <span className='text-sm dark:text-white'>
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
        isOpen={!!deletePromptId}
        onClose={() => setDeletePromptId(null)}
        onDelete={handleDeleteConfirm}
        title='Delete Prompt'
        description='Are you sure you want to delete this prompt? This action cannot be undone.'
        itemName={deletePromptTitle}
        confirmText='Delete'
      />

      <PromptVersionHistoryModal
        versions={selectedVersions}
        isOpen={!!versionHistoryPromptId}
        onClose={handleCloseVersionHistory}
      />
    </div>
  )
}

export default PromptTable
