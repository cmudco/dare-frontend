import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { getPrompts } from '../../redux/aynscThunks/prompt'
import PromptHeader from './PromptHeader'
import PromptTable from './PromptTable'
import PromptModal from './PromptModal'

const PromptManagerLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getPrompts())
  }, [dispatch])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-8 flex-grow overflow-auto'>
        <div
          className='h-full w-full shadow-none'
          color='transparent'
          placeholder=''
        >
          <div className='px-0' placeholder=''>
            <PromptHeader onSearch={handleSearch} />
            <PromptTable searchQuery={searchQuery} />
          </div>
        </div>
        <PromptModal />
      </div>
    </div>
  )
}

export default PromptManagerLayout
