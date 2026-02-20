import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { AppDispatch } from '../../redux/store'
import { getPrompts } from '../../redux/asyncThunks/prompt'
import PromptHeader from './PromptHeader'
import PromptTable from './PromptTable'
import PromptModal from './PromptModal'
import PromptsLibraryTable from './PromptsLibraryTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { features } from '@/config/environment'

const PromptManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')

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

            {features.enableSharing ? (
              <Tabs defaultValue='my-prompts' className='mt-6 w-full'>
                <TabsList className='mb-4 grid w-full max-w-md grid-cols-2'>
                  <TabsTrigger value='my-prompts'>My Prompts</TabsTrigger>
                  <TabsTrigger value='library'>Library</TabsTrigger>
                </TabsList>

                <TabsContent value='my-prompts'>
                  <PromptTable searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value='library'>
                  <PromptsLibraryTable searchQuery={searchQuery} />
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
