import {
  BookOpen,
  Compass,
  MessageSquare,
  Files,
  FileText,
  Bot,
  Workflow,
  Wallet,
  Settings,
  LifeBuoy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import manual from '../../../docs/user-guide.md?raw'

const metadata: Record<string, { icon: LucideIcon; summary: string }> = {
  'Your first conversation': {
    icon: BookOpen,
    summary:
      'A short, practical walkthrough from the dashboard to your first response.',
  },
  'Find your way around': {
    icon: Compass,
    summary:
      'Know where to find tools, wallet controls, notifications and help.',
  },
  'Conversations and models': {
    icon: MessageSquare,
    summary:
      'Start a conversation, choose a model and continue the discussion.',
  },
  'Sources and documents': {
    icon: Files,
    summary:
      'Upload documents, choose processing options and use files in a conversation.',
  },
  'Reusable prompts': {
    icon: FileText,
    summary:
      'Save instructions, manage versions and understand the default prompt.',
  },
  Agents: {
    icon: Bot,
    summary:
      'Combine a prompt and language model in a reusable agent configuration.',
  },
  Workflows: {
    icon: Workflow,
    summary: 'Build, save and test a small workflow before expanding it.',
  },
  'Wallets and cost tracking': {
    icon: Wallet,
    summary: 'Review your selected wallet, credit and transaction history.',
  },
  'Settings and account controls': {
    icon: Settings,
    summary:
      'Adjust appearance and preferences, and review account data controls.',
  },
  'Troubleshooting and support': {
    icon: LifeBuoy,
    summary: 'Resolve model, credit, document and workflow problems.',
  },
}

export const manualTopics = manual
  .split(/^## /m)
  .slice(1)
  .map((block) => {
    const newline = block.indexOf('\n')
    const title = block.slice(0, newline).trim()
    const details = metadata[title]
    if (!details) throw new Error(`Missing manual topic metadata: ${title}`)
    return {
      id: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      title,
      markdown: `# ${title}\n${block.slice(newline)}`,
      ...details,
    }
  })
