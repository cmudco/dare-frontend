/**
 * MemoryScreen
 *
 * Main page for viewing and managing cross-conversation memories.
 */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Brain, Trash2, Loader2 } from 'lucide-react'
import { AppDispatch, RootState } from '@/redux/store'
import {
  getMemoryItems,
  deleteMemoryItem,
  searchMemory,
  clearAllMemory,
  seedMemory,
} from '@/redux/asyncThunks/memory'
import { clearSearchResults } from '@/redux/memorySlice'
import { MemoryList, MemorySearch, SeedMemoryButton } from '@/components/Memory'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

const MemoryScreen = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()

  const {
    items,
    itemsLoading,
    searchResults,
    searchLoading,
    seeding,
    clearing,
    error,
  } = useSelector((state: RootState) => state.memory)

  // Fetch memories on mount
  useEffect(() => {
    dispatch(getMemoryItems())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const handleSearch = (query: string) => {
    dispatch(searchMemory(query))
  }

  const handleDelete = (id: string) => {
    dispatch(deleteMemoryItem(id))
  }

  const handleClearAll = async () => {
    const result = await dispatch(clearAllMemory())
    if (clearAllMemory.fulfilled.match(result)) {
      toast({
        title: 'Success',
        description: 'All memories cleared successfully',
      })
      dispatch(clearSearchResults())
    }
  }

  const handleSeed = async () => {
    const result = await dispatch(seedMemory())
    if (seedMemory.fulfilled.match(result)) {
      toast({
        title: 'Success',
        description: result.payload.message,
      })
      // Refresh the list after seeding
      dispatch(getMemoryItems())
    }
  }

  return (
    <div className='min-h-screen bg-dark-primary p-6'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-dare-gradient'>
              <Brain className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-white'>Memory</h1>
              <p className='text-sm text-gray-400'>
                What DARE remembers about you across conversations
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <SeedMemoryButton onSeed={handleSeed} isSeeding={seeding} />
            {items.length > 0 && (
              <Button
                variant='outline'
                onClick={handleClearAll}
                disabled={clearing}
                className='border-red-500/50 text-red-400 hover:border-red-500 hover:bg-red-500/10'
              >
                {clearing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Clear All
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='all' className='space-y-6'>
          <TabsList className='bg-dark-blue/30'>
            <TabsTrigger value='all'>All Memories</TabsTrigger>
            <TabsTrigger value='search'>Search</TabsTrigger>
          </TabsList>

          <TabsContent value='all' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-400'>
                {items.length} {items.length === 1 ? 'memory' : 'memories'}
              </span>
            </div>
            <MemoryList
              items={items}
              onDelete={handleDelete}
              isLoading={itemsLoading}
            />
          </TabsContent>

          <TabsContent value='search' className='space-y-4'>
            <MemorySearch
              onSearch={handleSearch}
              searchResults={searchResults}
              isLoading={searchLoading}
              onDeleteItem={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MemoryScreen
