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
} from 'lucide-react'
import type { TourPageKey } from '@/redux/conversationTourSlice'

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
    id: 'files-view-toggle',
    target: '[data-tour="files-view-toggle"]',
    title: 'Switch Views',
    description:
      'Toggle between Files, Folders, and Media views to organize your documents the way you prefer.',
    icon: FolderOpen,
    placement: 'bottom',
  },
  {
    id: 'files-search',
    target: '[data-tour="files-search"]',
    title: 'Search Files',
    description:
      'Quickly find any file by name. Great when you have lots of documents.',
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
}

export function getPageTourSteps(page: TourPageKey): PageTourStep[] {
  return PAGE_TOUR_MAP[page] || []
}

/** Map a pathname to a tour page key */
export function getTourPageKeyFromPath(pathname: string): TourPageKey | null {
  if (pathname.startsWith('/conversation')) return 'conversation'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/files')) return 'files'
  if (pathname.startsWith('/prompts')) return 'prompts'
  if (pathname.startsWith('/workflows')) return 'workflows'
  if (pathname.startsWith('/agents')) return 'agents'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/help')) return 'help'
  if (pathname.startsWith('/billing')) return 'billing'
  return null
}
