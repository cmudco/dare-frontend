import {
  BookOpen,
  Bot,
  Compass,
  FileText,
  Files,
  LifeBuoy,
  MessageSquare,
  Network,
  Settings,
  Wallet,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const MANUAL_GROUPS = [
  { id: 'start', label: '01 / Get oriented', title: 'Conversations & sources' },
  {
    id: 'build',
    label: '02 / Build on your work',
    title: 'Prompts, agents & workflows',
  },
  {
    id: 'manage',
    label: '03 / Manage your workspace',
    title: 'Usage & support',
  },
] as const

export type ManualGroupId = (typeof MANUAL_GROUPS)[number]['id']

export interface ManualTopic {
  id: string
  title: string
  summary: string
  icon: LucideIcon
  group?: ManualGroupId
  order: number
  markdown: string
}

// Icons a topic's frontmatter can name; add one here to use it.
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Bot,
  Compass,
  FileText,
  Files,
  LifeBuoy,
  MessageSquare,
  Network,
  Settings,
  Wallet,
  Workflow,
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/
const FIELD = /^(\w+):\s*(.*)$/

const files = import.meta.glob<string>('../../../docs/user-guide/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const parseTopic = (path: string, raw: string): ManualTopic => {
  const [header, block] = raw.match(FRONTMATTER) ?? ['', '']
  const fields = Object.fromEntries(
    block.split('\n').flatMap((line) => {
      const match = line.match(FIELD)
      return match ? [[match[1], match[2]]] : []
    })
  )
  return {
    id: path.slice(path.lastIndexOf('/') + 1, -'.md'.length),
    title: fields.title,
    summary: fields.summary,
    icon: ICONS[fields.icon] ?? FileText,
    group: MANUAL_GROUPS.find((group) => group.id === fields.group)?.id,
    order: Number(fields.order),
    markdown: raw.slice(header.length),
  }
}

export const manualTopics = Object.entries(files)
  .map(([path, raw]) => parseTopic(path, raw))
  .sort((a, b) => a.order - b.order)
