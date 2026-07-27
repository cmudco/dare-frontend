import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  RectangleGroupIcon,
  ChatBubbleLeftIcon,
  FolderOpenIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
  CreditCardIcon,
  AcademicCapIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { TooltipProvider } from '../ui/tooltip'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { useCanAccessResearch } from '@/hooks/useCanAccessResearch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  openConversationTour,
  openPageTour,
} from '@/redux/conversationTourSlice'
import { UsersIcon } from '@heroicons/react/24/outline'
import { getTourPageKeyFromPath } from '@/components/ConversationTour/pageTourSteps'

const PromptsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <polyline points='4 17 10 11 4 5' />
    <line x1='12' x2='20' y1='19' y2='19' />
  </svg>
)

const WorkflowsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <rect x='16' y='16' width='6' height='6' rx='1' />
    <rect x='2' y='16' width='6' height='6' rx='1' />
    <rect x='9' y='2' width='6' height='6' rx='1' />
    <path d='M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3' />
    <path d='M12 12V8' />
  </svg>
)

const AgentsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
    <path d='M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
)

const IntegrationsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' />
    <path d='m14.7 6.3-4.4 4.4' />
    <path d='m6.3 14.7 4.4-4.4' />
    <path d='m9.3 17.7 4.4-4.4' />
    <path d='m17.7 9.3-4.4 4.4' />
  </svg>
)

const MemoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z' />
    <path d='M9.5 8v.5a2.5 2.5 0 0 0 5 0V8' />
    <path d='M12 2v1' />
    <path d='M4.6 11a8 8 0 1 0 14.8 0' />
    <path d='M12 13v9' />
    <path d='M9 22h6' />
  </svg>
)

const Sidebar = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const hasOwnedGroups = useAppSelector(
    (state) => state.billing.ownedGroups.length > 0
  )
  const enableMcp = useFeatureFlag('enableMcp')
  const enableMemory = useFeatureFlag('enableMemory')
  const canAccessResearch = useCanAccessResearch()

  const handleStartTutorial = useCallback(() => {
    const pageKey = getTourPageKeyFromPath(location.pathname)
    if (!pageKey) return

    if (pageKey === 'conversation') {
      // Conversation tour uses its own overlay inside ConversationLayout
      dispatch(openConversationTour())
    } else {
      dispatch(openPageTour(pageKey))
    }
  }, [location.pathname, dispatch])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  interface MenuItem {
    name: string
    icon: React.ElementType
    path: string
  }

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: RectangleGroupIcon, path: '/dashboard' },
    { name: 'Conversations', icon: ChatBubbleLeftIcon, path: '/conversation' },
    { name: 'Sources', icon: FolderOpenIcon, path: '/files' },
    { name: 'Prompts', icon: PromptsIcon, path: '/prompts' },
    { name: 'Workflows', icon: WorkflowsIcon, path: '/workflows' },
    { name: 'Agents', icon: AgentsIcon, path: '/agents' },
    ...(canAccessResearch
      ? [{ name: 'Research', icon: BeakerIcon, path: '/research' }]
      : []),
    ...(enableMcp
      ? [{ name: 'Integrations', icon: IntegrationsIcon, path: '/mcp' }]
      : []),
    ...(enableMemory
      ? [{ name: 'Memory', icon: MemoryIcon, path: '/memory' }]
      : []),
  ]

  const bottomItems = [
    { name: 'Cost Tracking', icon: CreditCardIcon, path: '/billing/' },
    ...(hasOwnedGroups
      ? [{ name: 'Group Wallet', icon: UsersIcon, path: '/group-wallet' }]
      : []),
    { name: 'Help', icon: QuestionMarkCircleIcon, path: '/help' },
    { name: 'Settings', icon: Cog8ToothIcon, path: '/settings' },
  ]

  return (
    <TooltipProvider>
      <div
        className={`relative flex shrink-0 ${
          isCollapsed ? 'w-[80px]' : 'w-[160px] md:w-[200px] lg:w-[200px]'
        } h-full flex-col border border-t-0 border-sidebar-border bg-sidebar bg-clip-border text-sidebar-foreground transition-all duration-300`}
      >
        <div className='flex items-center justify-between p-4'>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-4 -right-4 z-10 mt-1 translate-x-0 transform rounded-full border-2 border-border bg-background p-1 transition-all hover:bg-accent`}
          >
            <ChevronLeftIcon
              className={`h-5 w-5 font-bold text-primary transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
        <nav className='flex grow flex-col gap-1 p-2 font-sans text-base font-normal'>
          {menuItems.map((item) => {
            const isActive =
              item.path === '/conversation'
                ? location.pathname.startsWith('/conversation')
                : location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex w-full items-center rounded-xl p-3 text-start leading-tight outline-hidden transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground'
                }`}
              >
                <div className={`${isCollapsed ? 'mx-auto' : 'mr-2'} relative`}>
                  {isActive ? (
                    <item.icon
                      className='h-5 w-5 shrink-0 font-bold transition-all duration-300'
                      style={{
                        fill: 'none',
                        stroke: 'var(--dare)',
                        color: 'var(--dare)',
                      }}
                    />
                  ) : (
                    <item.icon className='h-5 w-5 shrink-0 font-bold transition-all duration-300' />
                  )}
                </div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? 'w-0 overflow-hidden opacity-0'
                      : 'w-auto opacity-100'
                  }`}
                >
                  {isActive ? (
                    <span className='text-dare'>{item.name}</span>
                  ) : (
                    item.name
                  )}
                </span>
              </Link>
            )
          })}

          <div className='sticky bottom-0 z-10 mt-auto bg-sidebar'>
            {/* Tutorial button */}
            <button
              onClick={handleStartTutorial}
              className='flex w-full items-center rounded-lg p-3 text-start leading-tight outline-hidden transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground'
            >
              <div className={`${isCollapsed ? 'mx-auto' : 'mr-4'} relative`}>
                <AcademicCapIcon className='h-5 w-5 shrink-0 font-bold transition-all duration-300' />
              </div>
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isCollapsed
                    ? 'w-0 overflow-hidden opacity-0'
                    : 'w-auto opacity-100'
                }`}
              >
                Tutorial
              </span>
            </button>

            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex w-full items-center rounded-lg p-3 text-start leading-tight outline-hidden transition-all ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground'
                  }`}
                >
                  <div
                    className={`${isCollapsed ? 'mx-auto' : 'mr-4'} relative`}
                  >
                    {isActive ? (
                      <item.icon
                        className='h-5 w-5 shrink-0 font-bold transition-all duration-300'
                        style={{
                          fill: 'none',
                          stroke: 'var(--dare)',
                          color: 'var(--dare)',
                        }}
                      />
                    ) : (
                      <item.icon className='h-5 w-5 shrink-0 font-bold transition-all duration-300' />
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap transition-all duration-300 ${
                      isCollapsed
                        ? 'w-0 overflow-hidden opacity-0'
                        : 'w-auto opacity-100'
                    }`}
                  >
                    {isActive ? (
                      <span className='text-dare'>{item.name}</span>
                    ) : (
                      item.name
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  )
}

export default Sidebar
