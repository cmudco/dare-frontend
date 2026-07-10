import { ChangePasswordForm } from '@/components/Auth/ChangePasswordForm'
import ConversationSettingsForm from '@/components/Auth/ConversationSettingsForm'
import ApiKeysManagement from '@/components/Settings/ApiKeysManagement'
import AppearanceSettings from '@/components/Settings/AppearanceSettings'
import AvatarSettings from '@/components/Settings/AvatarSettings'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon } from 'lucide-react'
import { ReactNode } from 'react'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.1 },
  }),
}

const Settings = () => {
  const enableByok = useFeatureFlag('enableByok')
  const sections: { key: string; component: ReactNode }[] = [
    { key: 'appearance', component: <AppearanceSettings /> },
    { key: 'avatar', component: <AvatarSettings /> },
    ...(enableByok
      ? [{ key: 'apikeys', component: <ApiKeysManagement /> }]
      : []),
    { key: 'conversation', component: <ConversationSettingsForm /> },
    { key: 'password', component: <ChangePasswordForm /> },
  ]

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col space-y-1'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-muted p-2'>
            <SettingsIcon className='h-6 w-6 text-muted-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
            <p className='text-sm text-muted-foreground'>
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.key}
          custom={i}
          initial='hidden'
          animate='visible'
          variants={sectionVariants}
        >
          {section.component}
        </motion.div>
      ))}
    </div>
  )
}

export default Settings
