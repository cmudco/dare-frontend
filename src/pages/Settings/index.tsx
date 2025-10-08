import { ChangePasswordForm } from '@/components/Auth/ChangePasswordForm'
import ConversationSettingsForm from '@/components/Auth/ConversationSettingsForm'
const Settings = () => {
  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your settings and preferences.
        </p>
      </div>
      <ConversationSettingsForm />
      <ChangePasswordForm />
    </div>
  )
}

export default Settings
