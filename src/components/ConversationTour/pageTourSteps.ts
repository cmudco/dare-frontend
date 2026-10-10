import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Upload,
  Search,
  Filter,
  FolderOpen,
  Plus,
  BookOpen,
  Bot,
  Share2,
  Image,
  Key,
  MessageSquare,
  Lock,
  FileText,
  ExternalLink,
  Crown,
  CreditCard,
  TrendingUp,
  Sparkles,
  Zap,
  FolderKanban,
  MessageSquarePlus,
  Settings2,
  Layers,
  Fingerprint,
  Plug,
  History,
  FlaskConical,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import type { TourPageKey } from '@/redux/conversationTourSlice'
import {
  AGENT_TEMPLATES_PATH,
  INTEGRATIONS_PATH,
  MEMORY_PATH,
  PROMPT_TEMPLATES_PATH,
  SETTINGS_PATH,
  TEMPLATES_PATH,
} from '@/routes/paths'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface PageTourStep {
  id: string
  target: string | null
  title: string
  description: string
  icon: LucideIcon
  placement: TooltipPlacement
}

const DASHBOARD_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Dashboard',
    description:
      "Your command center — see all your activity and usage stats at a glance. Let's walk through it.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'dashboard-tabs',
    target: '[data-tour="dashboard-tabs"]',
    title: 'Dashboard Views',
    description:
      'Switch between the Overview for your usage stats and Environmental Impact to see the energy footprint of your AI usage.',
    icon: BarChart3,
    placement: 'bottom',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tour="dashboard-stats"]',
    title: 'Your Stats at a Glance',
    description:
      'Each card shows a key metric — conversations, files, tokens, and more. Click the token cards for a detailed breakdown by model.',
    icon: TrendingUp,
    placement: 'bottom',
  },
  {
    id: 'dashboard-activity',
    target: '[data-tour="dashboard-activity"]',
    title: 'Activity Summary',
    description:
      'See how efficiently you use AI — your intervention ratio and how many files you reference per conversation.',
    icon: Zap,
    placement: 'top',
  },
]

const FILES_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Files',
    description:
      "Upload and organize your documents here. The AI can read and reference them in your conversations. Let's explore.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'files-nav',
    target: '[data-tour="files-nav"]',
    title: 'Browse Your Library',
    description:
      'Jump between your folders, unfiled files, anything that needs attention, and shared libraries.',
    icon: FolderOpen,
    placement: 'right',
  },
  {
    id: 'files-search',
    target: '[data-tour="files-search"]',
    title: 'Search Sources',
    description:
      'Find any file by its name or tags. Great when you have lots of documents.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'files-filter-tags',
    target: '[data-tour="files-filter-tags"]',
    title: 'Filter by Tags',
    description:
      'Tag your files and filter by those tags to keep everything organized.',
    icon: Filter,
    placement: 'bottom',
  },
  {
    id: 'files-upload',
    target: '[data-tour="files-upload"]',
    title: 'Upload Files',
    description:
      'Upload PDFs, documents, images, and more. Files are processed for AI retrieval so you can chat with them.',
    icon: Upload,
    placement: 'left',
  },
]

const PROMPTS_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Prompts',
    description:
      "Save and reuse your best prompts as templates. Apply them instantly in any conversation. Let's take a look.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'templates-tabs',
    target: '[data-tour="templates-tabs"]',
    title: 'Prompts and Agents',
    description:
      'Prompts are reusable instructions. Agents pair a prompt with a model, files and settings, ready to use in chats and workflows.',
    icon: Bot,
    placement: 'bottom',
  },
  {
    id: 'prompts-search',
    target: '[data-tour="prompts-search"]',
    title: 'Search Prompts',
    description: 'Find any prompt template quickly by name.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'prompts-create',
    target: '[data-tour="prompts-create"]',
    title: 'Create a Prompt',
    description:
      'Create a reusable prompt template with system instructions. Apply it to any conversation with one click.',
    icon: Plus,
    placement: 'left',
  },
  {
    id: 'prompts-tabs',
    target: '[data-tour="prompts-tabs"]',
    title: 'Browse Prompts',
    description:
      'Switch between your own prompts, the shared library, and prompts others have shared with you.',
    icon: BookOpen,
    placement: 'bottom',
  },
]

const WORKFLOWS_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Workflows',
    description:
      "Build multi-step AI pipelines by chaining prompts together. Automate complex tasks. Let's explore.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'workflows-search',
    target: '[data-tour="workflows-search"]',
    title: 'Search Workflows',
    description: 'Find workflows by name as your collection grows.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'workflows-create',
    target: '[data-tour="workflows-create"]',
    title: 'Create a Workflow',
    description:
      'Build a new multi-step workflow with a visual node editor. Chain prompts, add files, and configure AI models per step.',
    icon: Plus,
    placement: 'left',
  },
  {
    id: 'workflows-tabs',
    target: '[data-tour="workflows-tabs"]',
    title: 'Browse Workflows',
    description:
      'View your personal workflows, explore the community library, or see what others have shared with you.',
    icon: Share2,
    placement: 'bottom',
  },
]

const AGENTS_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Agents',
    description:
      "Create AI agents with specialized personas and instructions. Deploy them in your conversations. Let's see how.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'templates-tabs',
    target: '[data-tour="templates-tabs"]',
    title: 'Prompts and Agents',
    description:
      'Prompts are reusable instructions. Agents pair a prompt with a model, files and settings, ready to use in chats and workflows.',
    icon: Bot,
    placement: 'bottom',
  },
  {
    id: 'agents-search',
    target: '[data-tour="agents-search"]',
    title: 'Search Agents',
    description: 'Find your agents quickly by name.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'agents-create',
    target: '[data-tour="agents-create"]',
    title: 'Create an Agent',
    description:
      'Define an AI agent with a custom persona, system prompt, and default model. Use them in conversations or workflows.',
    icon: Bot,
    placement: 'left',
  },
]

const SETTINGS_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Settings',
    description:
      "Customize your DARE experience — avatar, API keys, preferences, and security. Let's walk through each section.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'settings-sections',
    target: '[data-tour="settings-sections"]',
    title: 'Settings Sections',
    description:
      'Account, appearance, chat defaults, memory, integrations and your data each have their own tab.',
    icon: Settings2,
    placement: 'right',
  },
  {
    id: 'settings-account',
    target: '[data-tour="settings-account"]',
    title: 'Your Account',
    description: 'The name, email and role on your DARE account.',
    icon: User,
    placement: 'bottom',
  },
  {
    id: 'settings-avatar',
    target: '[data-tour="settings-avatar"]',
    title: 'Your Avatar',
    description:
      'Choose a preset avatar, upload your own image, or stick with your initials. This is how you appear across the platform.',
    icon: Image,
    placement: 'right',
  },
  {
    id: 'settings-api-keys',
    target: '[data-tour="settings-api-keys"]',
    title: 'API Keys & Billing',
    description:
      'Bring your own API keys for OpenAI, Anthropic, and more. Choose between using platform credits or your own keys.',
    icon: Key,
    placement: 'right',
  },
  {
    id: 'settings-conversation',
    target: '[data-tour="settings-conversation"]',
    title: 'Conversation Preferences',
    description:
      'Adjust how messages appear in your chats — pick a font size that works for you.',
    icon: MessageSquare,
    placement: 'right',
  },
  {
    id: 'settings-password',
    target: '[data-tour="settings-password"]',
    title: 'Security',
    description: 'Update your password here to keep your account secure.',
    icon: Lock,
    placement: 'right',
  },
]

const HELP_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Help',
    description:
      "Find documentation, learning modules, and a full reference of available AI models. Let's explore.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'help-docs',
    target: '[data-tour="help-docs"]',
    title: 'User Guide',
    description:
      'Access the comprehensive DARE LLM Gateway User Guide — covers features, workflows, and best practices.',
    icon: ExternalLink,
    placement: 'bottom',
  },
  {
    id: 'help-learning',
    target: '[data-tour="help-learning"]',
    title: 'Learning Modules',
    description:
      'Explore curated exercises on system prompting, multi-agent workflows, and more.',
    icon: FileText,
    placement: 'bottom',
  },
  {
    id: 'help-model-filters',
    target: '[data-tour="help-model-filters"]',
    title: 'Filter by Tier',
    description:
      'Filter AI models by tier — Premium, Advanced, or Flash — to find the right model for your task and budget.',
    icon: Crown,
    placement: 'bottom',
  },
]

const BILLING_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Cost Tracking',
    description:
      "Monitor your AI usage costs, wallet balance, and spending trends. Let's see what's here.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'billing-overview',
    target: '[data-tour="billing-overview"]',
    title: 'Billing Overview',
    description:
      'See your current wallet balance, total spend, and usage breakdown at a glance.',
    icon: CreditCard,
    placement: 'bottom',
  },
]

const PROJECTS_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Projects',
    description:
      'Projects keep the chats, files and instructions for one piece of work in one place.',
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'projects-create',
    target: '[data-tour="projects-create"]',
    title: 'Start a Project',
    description:
      'Click New to name a project. You can add instructions, sources and a default model once it exists.',
    icon: Plus,
    placement: 'bottom',
  },
  {
    id: 'projects-search',
    target: '[data-tour="projects-search"]',
    title: 'Find a Project',
    description: 'Search your projects by name.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'projects-list',
    target: '[data-tour="projects-list"]',
    title: 'Your Projects',
    description:
      'Open a project to see its chats and sources. Sort by last active, name or date created, and use the ⋯ menu to delete one.',
    icon: FolderKanban,
    placement: 'top',
  },
]

const PROJECT_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Inside a Project',
    description:
      'Every chat started here shares the same instructions, sources and defaults.',
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'project-composer',
    target: '[data-tour="project-composer"]',
    title: 'Start a Project Chat',
    description:
      "Type here to start a new chat that already uses this project's instructions and sources.",
    icon: MessageSquarePlus,
    placement: 'bottom',
  },
  {
    id: 'project-tabs',
    target: '[data-tour="project-tabs"]',
    title: 'Chats and Sources',
    description:
      'Chats lists every conversation in the project. Sources holds the files, folders and libraries its chats can search.',
    icon: FileText,
    placement: 'bottom',
  },
  {
    id: 'project-settings-rail',
    target: '[data-tour="project-settings-rail"]',
    title: 'Project Settings',
    description:
      'Instructions, the default model and pinned workflows for every chat in this project. Click Edit to change them.',
    icon: Settings2,
    placement: 'left',
  },
  {
    id: 'project-actions',
    target: '[data-tour="project-actions"]',
    title: 'More Actions',
    description:
      'Open Settings, add existing chats, pin workflows or delete the project.',
    icon: FolderOpen,
    placement: 'bottom',
  },
]

const MEMORY_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Memory',
    description:
      'Everything DARE remembers about you across chats, which you can review, edit and delete.',
    icon: Fingerprint,
    placement: 'center',
  },
  {
    id: 'memory-layers',
    target: '[data-tour="memory-layers"]',
    title: 'Memory Layers',
    description:
      'Profile, Knowledge and Behaviors hold what DARE has learned about you. Sessions searches your past chat transcripts. Click a layer to filter.',
    icon: Layers,
    placement: 'bottom',
  },
  {
    id: 'memory-tidy-up',
    target: '[data-tour="memory-tidy-up"]',
    title: 'Tidy Up',
    description:
      'Ask DARE to check its memories for duplicates and stale labels. It suggests fixes, and nothing changes until you approve one.',
    icon: Sparkles,
    placement: 'bottom',
  },
  {
    id: 'memory-search',
    target: '[data-tour="memory-search"]',
    title: 'Search Your Memories',
    description:
      'Filter memories by text, or run a semantic search to find related ones.',
    icon: Search,
    placement: 'bottom',
  },
  {
    id: 'memory-actions',
    target: '[data-tour="memory-actions"]',
    title: 'Manage Your Memory',
    description:
      'Read how memory works, export or import your memories, or clear them all.',
    icon: BookOpen,
    placement: 'bottom',
  },
]

const MCP_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Integrations',
    description:
      'Connect external tool servers so their tools can be used inside your chats.',
    icon: Plug,
    placement: 'center',
  },
  {
    id: 'mcp-servers',
    target: '[data-tour="mcp-servers"]',
    title: 'Available Servers',
    description:
      'Open a server to connect your account and see the tools it offers.',
    icon: Plug,
    placement: 'top',
  },
  {
    id: 'mcp-tabs',
    target: '[data-tour="mcp-tabs"]',
    title: 'Servers and History',
    description:
      'Switch to History to see every tool call you have run and its result.',
    icon: History,
    placement: 'bottom',
  },
]

const RESEARCH_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Research',
    description:
      'Each research project is a workspace for one line of inquiry, where agents gather and review sources for you.',
    icon: FlaskConical,
    placement: 'center',
  },
  {
    id: 'research-create',
    target: '[data-tour="research-create"]',
    title: 'Start a Research Project',
    description:
      'A short setup walks you through your question, starting sources, standards and the tools the agents may use.',
    icon: Plus,
    placement: 'bottom',
  },
  {
    id: 'research-projects',
    target: '[data-tour="research-projects"]',
    title: 'Your Research Projects',
    description:
      'Open a project to chat with its agents, review the sources they found and follow their runs.',
    icon: FolderOpen,
    placement: 'top',
  },
]

const GROUP_WALLET_STEPS: PageTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Group Wallet',
    description:
      'Manage the shared budget for groups you own and how it is handed out to members.',
    icon: Users,
    placement: 'center',
  },
  {
    id: 'group-wallet-groups',
    target: '[data-tour="group-wallet-groups"]',
    title: 'Your Groups',
    description: 'Pick a group to manage its wallet.',
    icon: Users,
    placement: 'right',
  },
  {
    id: 'group-wallet-budget',
    target: '[data-tour="group-wallet-budget"]',
    title: 'Group Budget',
    description:
      "The group's remaining budget, plus the refill policy and gateway allowance that apply to members.",
    icon: Wallet,
    placement: 'left',
  },
  {
    id: 'group-wallet-members',
    target: '[data-tour="group-wallet-members"]',
    title: 'Members',
    description:
      "Each member's balance and usage. Allocate credit or set a personal override for anyone.",
    icon: CreditCard,
    placement: 'top',
  },
]

/** Map of page keys to their tour steps */
const PAGE_TOUR_MAP: Record<TourPageKey, PageTourStep[]> = {
  conversation: [], // handled by the existing conversationTourSteps.ts
  dashboard: DASHBOARD_STEPS,
  files: FILES_STEPS,
  prompts: PROMPTS_STEPS,
  workflows: WORKFLOWS_STEPS,
  agents: AGENTS_STEPS,
  settings: SETTINGS_STEPS,
  help: HELP_STEPS,
  billing: BILLING_STEPS,
  projects: PROJECTS_STEPS,
  project: PROJECT_STEPS,
  memory: MEMORY_STEPS,
  mcp: MCP_STEPS,
  research: RESEARCH_STEPS,
  group_wallet: GROUP_WALLET_STEPS,
}

export function getPageTourSteps(page: TourPageKey): PageTourStep[] {
  return PAGE_TOUR_MAP[page] || []
}

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
