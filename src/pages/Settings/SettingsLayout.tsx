import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { cn } from '@/lib/utils'
import {
  APPEARANCE_PATH,
  CHAT_SETTINGS_PATH,
  DATA_SETTINGS_PATH,
  INTEGRATIONS_PATH,
  MEMORY_PATH,
  SETTINGS_PATH,
} from '@/routes/paths'

/** One column: a title, a tab row, and the chosen section beneath it. */
const SettingsLayout = () => {
  const { pathname } = useLocation()
  const tabsRef = useRef<HTMLElement>(null)
  const enableMemory = useFeatureFlag('enableMemory')
  const enableMcp = useFeatureFlag('enableMcp')
  const tabs = [
    { label: 'Account', path: SETTINGS_PATH, end: true },
    { label: 'Appearance', path: APPEARANCE_PATH, end: false },
    { label: 'Chat', path: CHAT_SETTINGS_PATH, end: false },
    ...(enableMemory
      ? [{ label: 'Memory', path: MEMORY_PATH, end: false }]
      : []),
    ...(enableMcp
      ? [{ label: 'Integrations', path: INTEGRATIONS_PATH, end: false }]
      : []),
    { label: 'Data', path: DATA_SETTINGS_PATH, end: false },
  ]
  // Integrations has sub-pages; they share one tab and one animation.
  const section =
    tabs.find((tab) => !tab.end && pathname.startsWith(tab.path))?.path ??
    SETTINGS_PATH

  // On narrow screens the tab row scrolls; keep the open tab in view.
  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [section])

  return (
    <div className='mx-auto w-full max-w-5xl px-4 pt-8 pb-16 md:px-8'>
      <header>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Your account, how DARE looks and behaves, and what it remembers.
        </p>
      </header>

      <nav
        aria-label='Settings sections'
        ref={tabsRef}
        data-tour='settings-sections'
        className='mt-6 flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-border [&::-webkit-scrollbar]:hidden'
      >
        {tabs.map(({ label, path, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                '-mb-px shrink-0 border-b-2 px-3 pb-2.5 text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <motion.div
        key={section}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className='pt-8'
      >
        <Outlet />
      </motion.div>
    </div>
  )
}

export default SettingsLayout
