import { useDispatch, useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import { AppDispatch, RootState } from '../../redux/store'
import { createConversation } from '../../redux/asyncThunks/conversation'
import { Button } from '../ui/button'

const NewConversation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const conversations = useSelector(
    (state: RootState) => state.conversation?.conversations || []
  )

  const hasNoConversations = conversations.length === 0

  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      {hasNoConversations && (
        <Button
          onClick={() => dispatch(createConversation())}
          size='lg'
          className='gap-2 rounded-full px-6 py-3 text-base font-medium'
        >
          <Plus className='h-5 w-5' />
          Create New Conversation
        </Button>
      )}
      <h3 className='text-center text-2xl font-semibold text-foreground'>
        Create a new conversation and let&apos;s explore your ideas!
      </h3>
    </div>
  )
}

export default NewConversation
