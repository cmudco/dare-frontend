import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { AppDispatch } from '../../redux/store'
import { getPrompts } from '../../redux/asyncThunks/prompt'
import PromptHeader from './PromptHeader'
import PromptTable from './PromptTable'
import PromptModal from './PromptModal'
import PromptsLibraryTable from './PromptsLibraryTable'
import SharedPromptsTable from './SharedPromptsTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { fetchSharedWithMe } from '@/redux/asyncThunks/sharing'
import { ShareableEntityType } from '@/redux/types/sharing'

const PromptManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')
  const enableSharing = useFeatureFlag('enableSharing')

  useEffect(() => {
    dispatch(getPrompts())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-grow overflow-auto p-8'>
        <div
          className='h-full w-full shadow-none'
          color='transparent'
          placeholder=''
        >
          <div className='px-0' placeholder=''>
            <PromptHeader onSearch={handleSearch} />

            {enableSharing ? (
              <Tabs
                defaultValue='my-prompts'
                className='mt-6 w-full'
                onValueChange={(value) => {
                  if (value === 'shared-with-me') {
                    dispatch(fetchSharedWithMe(ShareableEntityType.Prompt))
                  }
                }}
              >
                <TabsList
                  data-tour='prompts-tabs'
                  className='mb-4 grid w-full max-w-md grid-cols-3'
                >
                  <TabsTrigger value='my-prompts'>My Prompts</TabsTrigger>
                  <TabsTrigger value='library'>Library</TabsTrigger>
                  <TabsTrigger value='shared-with-me'>
                    Shared With Me
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='my-prompts'>
                  <PromptTable searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value='library'>
                  <PromptsLibraryTable searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value='shared-with-me'>
                  <SharedPromptsTable searchQuery={searchQuery} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className='mt-6'>
                <PromptTable searchQuery={searchQuery} />
              </div>
            )}
          </div>
        </div>
        <PromptModal />
      </div>
    </div>
  )
}

export default PromptManagerLayout
