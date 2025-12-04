import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  RectangleGroupIcon,
  ChatBubbleLeftIcon,
  FolderOpenIcon,
  QuestionMarkCircleIcon,
  Cog8ToothIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { TooltipProvider } from '../ui/tooltip'

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

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
    { name: 'Files', icon: FolderOpenIcon, path: '/files' },
    { name: 'Prompts', icon: PromptsIcon, path: '/prompts' },
    { name: 'Agents', icon: AgentsIcon, path: '/agents' },
    { name: 'Workflows', icon: WorkflowsIcon, path: '/workflows' },
  ]

  const bottomItems = [
    { name: 'Cost Tracking', icon: CreditCardIcon, path: '/billing/' },
    { name: 'Help', icon: QuestionMarkCircleIcon, path: '/help' },
    { name: 'Settings', icon: Cog8ToothIcon, path: '/settings' },
  ]

  return (
    <TooltipProvider>
      <svg width='0' height='0' className='absolute'>
        <defs>
          <linearGradient id='dare-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='#EE183C' />
            <stop offset='100%' stopColor='#023572' />
          </linearGradient>
        </defs>
      </svg>

      <div
        className={`relative flex shrink-0 ${
          isCollapsed ? 'w-[80px]' : 'w-[160px] md:w-[200px] lg:w-[200px]'
        } shadow-blue-gray-900/5 h-full flex-col border border-t-0 border-pink-50 bg-white bg-clip-border text-gray-700 transition-all duration-300 dark:border-slate-800 dark:bg-dark-bg dark:text-white`}
      >
        <div className='flex items-center justify-between p-4'>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hover:bg-primary-dark border-border-gray dark:bg-dark-chat-history absolute -right-4 top-4 z-10 mt-1 translate-x-0 transform rounded-full border-2 bg-white p-1 transition-all dark:border-slate-600`}
          >
            <ChevronLeftIcon
              className={`h-5 w-5 font-bold text-primary transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
        <nav className='flex flex-grow flex-col gap-1 p-2 font-sans text-base font-normal'>
          {menuItems.map((item) => {
            const isActive =
              item.path === '/conversation'
                ? location.pathname.startsWith('/conversation')
                : location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex w-full items-center rounded-xl p-3 text-start leading-tight outline-none transition-all ${
                  isActive
                    ? 'dark:hover:bg-dare-gradient/90 bg-sky-50 dark:bg-dare-gradient dark:text-white'
                    : 'hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 active:bg-blue-50 active:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white dark:focus:bg-white/10 dark:active:bg-white/10'
                }`}
              >
                <div className={`${isCollapsed ? 'mx-auto' : 'mr-2'} relative`}>
                  {isActive ? (
                    <item.icon
                      className='h-5 w-5 shrink-0 font-bold transition-all duration-300'
                      style={{
                        fill: 'none',
                        stroke: 'url(#dare-gradient) dark:white',
                        color: 'url(#dare-gradient)',
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
                    <span className='bg-dare-gradient bg-clip-text text-transparent dark:bg-none dark:text-white'>
                      {item.name}
                    </span>
                  ) : (
                    item.name
                  )}
                </span>
              </Link>
            )
          })}

          <div className='sticky bottom-0 z-10 mt-auto bg-white dark:bg-dark-bg'>
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex w-full items-center rounded-lg p-3 text-start leading-tight outline-none transition-all ${
                    isActive
                      ? 'dark:hover:bg-dare-gradient/90 bg-sky-50 dark:bg-dare-gradient dark:text-white'
                      : 'hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 active:bg-blue-50 active:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white dark:focus:bg-white/10 dark:active:bg-white/10'
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
                          stroke: 'url(#dare-gradient) dark:white',
                          color: 'url(#dare-gradient)',
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
                      <span className='bg-dare-gradient bg-clip-text text-transparent dark:bg-none dark:text-white'>
                        {item.name}
                      </span>
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
