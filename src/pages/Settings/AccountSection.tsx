import { ChangePasswordForm } from '@/components/Auth/ChangePasswordForm'
import AccountDetails from '@/components/Settings/AccountDetails'
import AvatarSettings from '@/components/Settings/AvatarSettings'

const AccountSection = () => (
  <div className='space-y-6'>
    <div data-tour='settings-account'>
      <AccountDetails />
    </div>
    <AvatarSettings />
    <ChangePasswordForm />
  </div>
)

export default AccountSection
