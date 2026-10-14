import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Plug, History, ChevronRight } from 'lucide-react'
import { INTEGRATIONS_PATH } from '@/routes/paths'

/**
 * MCPLayout - Shared layout for all MCP pages
 * Provides compact header with navigation tabs in breadcrumb row
 */
const MCPLayout = () => {
  const location = useLocation()

  // Generate breadcrumbs from path
  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs: { label: string; path: string }[] = [
      { label: 'Integrations', path: INTEGRATIONS_PATH },
    ]

    // Parse path segments
    const segments = path
      .replace(INTEGRATIONS_PATH, '')
      .split('/')
      .filter(Boolean)

    if (segments.length > 0) {
      // Server slug
      const serverSlug = segments[0]
      if (serverSlug && serverSlug !== 'history') {
        crumbs.push({
          label: serverSlug.charAt(0).toUpperCase() + serverSlug.slice(1),
          path: `${INTEGRATIONS_PATH}/${serverSlug}`,
        })
      }

      // History page
      if (serverSlug === 'history') {
        crumbs.push({ label: 'History', path: `${INTEGRATIONS_PATH}/history` })
      }

      // Tool name
      if (segments.length >= 3 && segments[1] === 'tools') {
        crumbs.push({
          label: segments[2],
          path: `${INTEGRATIONS_PATH}/${serverSlug}/tools/${segments[2]}`,
        })
      }
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const isHistoryPage = location.pathname === `${INTEGRATIONS_PATH}/history`
  const isServersPage =
    location.pathname === INTEGRATIONS_PATH ||
    (!isHistoryPage && location.pathname.startsWith(INTEGRATIONS_PATH))

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {breadcrumbs.length > 1 ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className='flex items-center gap-2'>
                {index > 0 && <ChevronRight className='h-4 w-4' />}
                {index === breadcrumbs.length - 1 ? (
                  <span className='font-medium text-foreground'>
                    {crumb.label}
                  </span>
                ) : (
                  <NavLink to={crumb.path} className='hover:text-foreground'>
                    {crumb.label}
                  </NavLink>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Connect tool servers so their tools can be used in your chats.
          </p>
        )}

        <div
          className='flex items-center gap-0.5 rounded-lg bg-muted p-0.5'
          data-tour='mcp-tabs'
        >
          <NavLink
            to={INTEGRATIONS_PATH}
            end
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors ${
              isServersPage && !isHistoryPage
                ? 'bg-background font-medium text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plug className='h-3.5 w-3.5' />
            Servers
          </NavLink>
          <NavLink
            to={`${INTEGRATIONS_PATH}/history`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors ${
              isHistoryPage
                ? 'bg-background font-medium text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className='h-3.5 w-3.5' />
            History
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  )
}

export default MCPLayout
