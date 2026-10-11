import type { TourPageKey } from '@/redux/conversationTourSlice'
import {
  AGENT_TEMPLATES_PATH,
  INTEGRATIONS_PATH,
  MEMORY_PATH,
  PROMPT_TEMPLATES_PATH,
  SETTINGS_PATH,
  TEMPLATES_PATH,
} from '@/routes/paths'

/** Map a pathname to a tour page key */
export function getTourPageKeyFromPath(pathname: string): TourPageKey | null {
  if (pathname.startsWith('/conversation')) return 'conversation'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/files')) return 'files'
  if (pathname.startsWith('/workflows')) return 'workflows'
  if (pathname.startsWith('/help')) return 'help'
  if (pathname.startsWith('/billing')) return 'billing'
  if (/^\/projects\/\d+/.test(pathname)) return 'project'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith(MEMORY_PATH)) return 'memory'
  if (pathname.startsWith(INTEGRATIONS_PATH)) return 'mcp'
  if (pathname.startsWith(SETTINGS_PATH)) return 'settings'
  if (pathname.startsWith(AGENT_TEMPLATES_PATH)) return 'agents'
  if (pathname.startsWith(TEMPLATES_PATH)) return 'prompts'
  if (/^\/research\/?$/.test(pathname)) return 'research'
  if (pathname.startsWith('/group-wallet')) return 'group_wallet'
  return null
}

/** Where each tour the assistant can start lives (assistant page keys). */
const TOUR_PAGE_PATHS: Record<string, string> = {
  dashboard: '/dashboard',
  conversation: '/conversation',
  projects: '/projects',
  files: '/files',
  prompts: PROMPT_TEMPLATES_PATH,
  workflows: '/workflows',
  agents: AGENT_TEMPLATES_PATH,
  research: '/research',
  memory: MEMORY_PATH,
  mcp: INTEGRATIONS_PATH,
  billing: '/billing',
  group_wallet: '/group-wallet',
  settings: SETTINGS_PATH,
  help: '/help',
}

/** The page an assistant tour request needs open, or null when it is open. */
export function tourRequestPath(page: string, pathname: string): string | null {
  const current = getTourPageKeyFromPath(pathname)
  if (current === page || (page === 'projects' && current === 'project'))
    return null
  return TOUR_PAGE_PATHS[page] ?? null
}
