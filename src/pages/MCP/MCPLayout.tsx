import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Plug, History, ChevronRight, Home } from 'lucide-react'

/**
 * MCPLayout - Shared layout for all MCP pages
 * Provides header with navigation tabs and breadcrumbs
 */
const MCPLayout = () => {
  const location = useLocation()

  // Generate breadcrumbs from path
  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs: { label: string; path: string }[] = [
      { label: 'Integrations', path: '/mcp' },
    ]

    // Parse path segments
    const segments = path.replace('/mcp', '').split('/').filter(Boolean)

    if (segments.length > 0) {
      // Server slug
      const serverSlug = segments[0]
      if (serverSlug && serverSlug !== 'history') {
        crumbs.push({
          label: serverSlug.charAt(0).toUpperCase() + serverSlug.slice(1),
          path: `/mcp/${serverSlug}`,
        })
      }

      // History page
      if (serverSlug === 'history') {
        crumbs.push({ label: 'History', path: '/mcp/history' })
      }

      // Tool name
      if (segments.length >= 3 && segments[1] === 'tools') {
        crumbs.push({
          label: segments[2],
          path: `/mcp/${serverSlug}/tools/${segments[2]}`,
        })
      }
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const isHistoryPage = location.pathname === '/mcp/history'
  const isServersPage = location.pathname === '/mcp'

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-b bg-background px-6 py-4'>
        {/* Breadcrumbs */}
        <div className='mb-4 flex items-center gap-2 text-sm text-muted-foreground'>
          <NavLink
            to='/mcp'
            className='flex items-center gap-1 hover:text-foreground'
          >
            <Home className='h-4 w-4' />
          </NavLink>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className='flex items-center gap-2'>
              <ChevronRight className='h-4 w-4' />
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

        {/* Page Title + Navigation Tabs */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>Integrations</h1>
            <p className='text-sm text-muted-foreground'>
              Connect and manage external services via MCP
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className='flex gap-2'>
            <NavLink
              to='/mcp'
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive || (isServersPage && !isHistoryPage)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`
              }
            >
              <Plug className='h-4 w-4' />
              Servers
            </NavLink>
            <NavLink
              to='/mcp/history'
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`
              }
            >
              <History className='h-4 w-4' />
              History
            </NavLink>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className='flex-1 overflow-auto p-6'>
        <Outlet />
      </div>
    </div>
  )
}

export default MCPLayout
