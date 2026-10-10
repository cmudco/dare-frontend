import ConversationSettingsForm from '@/components/Auth/ConversationSettingsForm'
import ApiKeysManagement from '@/components/Settings/ApiKeysManagement'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

const ChatSection = () => {
  const enableByok = useFeatureFlag('enableByok')
  return (
    <div className='space-y-6'>
      <ConversationSettingsForm />
      {enableByok && <ApiKeysManagement />}
    </div>
  )
}

export default ChatSection
