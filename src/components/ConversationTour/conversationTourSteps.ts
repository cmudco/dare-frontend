import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  History,
  Plus,
  Cpu,
  Paperclip,
  BookOpen,
  MessageSquare,
  Server,
  Wrench,
  Settings2,
} from 'lucide-react'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface ConversationTourStep {
  id: string
  target: string | null
  title: string
  description: string
  icon: LucideIcon
  placement: TooltipPlacement
}

export interface TargetRect {
  x: number
  y: number
  width: number
  height: number
}

// Base steps always shown (no feature flags)
const BASE_STEPS: ConversationTourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to DARE Chat',
    description:
      "Let's take a quick tour of the conversation interface to get you up to speed.",
    icon: Sparkles,
    placement: 'center',
  },
  {
    id: 'conversation-history',
    target: '[data-tour="conversation-history"]',
    title: 'Conversation History',
    description:
      'All your past conversations live here. Search through them or switch between chats instantly.',
    icon: History,
    placement: 'right',
  },
  {
    id: 'new-conversation',
    target: '[data-tour="new-conversation"]',
    title: 'Start a New Chat',
    description:
      'Tap here to start a fresh conversation. Everything you write is automatically saved.',
    icon: Plus,
    placement: 'right',
  },
  // Model picker first — required before any message can be sent
  {
    id: 'model-picker',
    target: '[data-tour="model-picker"]',
    title: 'Choose Your AI Model',
    description:
      'Pick from GPT-4, Claude, Gemini, and more. Different models excel at different tasks — code, reasoning, creativity.',
    icon: Cpu,
    placement: 'top',
  },
  // Remaining toolbar steps left-to-right
  {
    id: 'file-select',
    target: '[data-tour="file-select"]',
    title: 'Attach Files & Folders',
    description:
      'Upload PDFs, documents, and entire folders. The AI reads and references them when answering your questions.',
    icon: Paperclip,
    placement: 'top',
  },
  {
    id: 'prompt-set',
    target: '[data-tour="prompt-set"]',
    title: 'Prompt Templates & Agents',
    description:
      'Instantly apply saved prompt templates or activate AI agents for specialized tasks — no retyping needed.',
    icon: BookOpen,
    placement: 'top',
  },
  {
    id: 'reference-select',
    target: '[data-tour="reference-select"]',
    title: 'Reference Past Conversations',
    description:
      'Pull in summaries or full context from previous chats so the AI can build on your prior work.',
    icon: MessageSquare,
    placement: 'top',
  },
]

// Steps shown only when MCP feature is enabled
const MCP_STEPS: ConversationTourStep[] = [
  {
    id: 'mcp-servers',
    target: '[data-tour="mcp-servers"]',
    title: 'MCP Server Integrations',
    description:
      'Connect external tools and data sources via Model Context Protocol servers — extend AI capabilities beyond the chat.',
    icon: Server,
    placement: 'top',
  },
  {
    id: 'dare-tools',
    target: '[data-tour="dare-tools"]',
    title: 'DARE Tools',
    description:
      'Built-in power tools for diagrams, data analysis, and structured outputs — let the AI generate rich content.',
    icon: Wrench,
    placement: 'top',
  },
]

// Last step — always shown
const CONFIG_STEP: ConversationTourStep = {
  id: 'model-config',
  target: '[data-tour="model-config"]',
  title: 'Configure AI Settings',
  description:
    'Fine-tune temperature, max tokens, history depth, web search, and more. Settings are saved per conversation.',
  icon: Settings2,
  placement: 'top',
}

export function buildConversationTourSteps(
  enableMcp: boolean
): ConversationTourStep[] {
  return enableMcp
    ? [...BASE_STEPS, ...MCP_STEPS, CONFIG_STEP]
    : [...BASE_STEPS, CONFIG_STEP]
}
