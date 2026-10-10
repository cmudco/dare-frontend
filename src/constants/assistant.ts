/**
 * Copy for the "Ask DARE" assistant panel: per-page intros, the labels shown
 * while (and after) each assistant tool runs, and proposed-change titles.
 */
import { ProposalActionType } from '@/utils/constants/assistant'

export interface AssistantPageIntro {
  title: string
  suggestions: string[]
}

// First match wins, so specific routes come before their parents.
const PAGE_INTROS: [RegExp, AssistantPageIntro][] = [
  [
    /^\/dashboard/,
    {
      title: 'Questions about your dashboard?',
      suggestions: [
        'Summarise my usage so far',
        'What does Environmental Impact measure?',
        'How are input and output tokens counted?',
      ],
    },
  ],
  [
    /^\/conversation\/.+/,
    {
      title: 'Questions about this chat?',
      suggestions: [
        "What's set up in this chat?",
        'How do I attach files to a chat?',
        'Which retrieval mode should I use?',
      ],
    },
  ],
  [
    /^\/conversation/,
    {
      title: 'Starting a new chat?',
      suggestions: [
        'Which model should I pick?',
        'How do I chat with my documents?',
        'What do the chat tools do?',
      ],
    },
  ],
  [
    /^\/projects\/\d+/,
    {
      title: 'Questions about this project?',
      suggestions: [
        "What's in this project?",
        'How do project instructions work?',
        'How do I add files to a project?',
      ],
    },
  ],
  [
    /^\/projects/,
    {
      title: 'Organising work into projects?',
      suggestions: [
        'Sort my chats and files into projects',
        'How do projects work?',
        'What does a project share with its chats?',
      ],
    },
  ],
  [
    /^\/files/,
    {
      title: 'Questions about your sources?',
      suggestions: [
        'Organise my files into folders',
        'Did any of my uploads fail?',
        'Suggest tags for my files',
      ],
    },
  ],
  [
    /^\/workflows/,
    {
      title: 'Building a workflow?',
      suggestions: [
        'How do I build a workflow?',
        'What can a workflow step do?',
      ],
    },
  ],
  [
    /^\/research/,
    {
      title: 'Doing research in DARE?',
      suggestions: [
        'How do I start a research project?',
        'What do Scout and Critic do?',
        'What is the Review Inbox for?',
      ],
    },
  ],
  [
    /^\/billing|^\/group-wallet/,
    {
      title: 'Questions about billing?',
      suggestions: [
        "What's my wallet balance?",
        'How is my usage billed?',
        'What is a LiteLLM key?',
      ],
    },
  ],
  [
    /^\/templates\/agents/,
    {
      title: 'Setting up an agent?',
      suggestions: [
        'What is an agent in DARE?',
        'How do I create an agent?',
        'How do I use an agent in a workflow?',
      ],
    },
  ],
  [
    /^\/templates(\/prompts)?\/?$/,
    {
      title: 'Working with prompts?',
      suggestions: [
        'How do I create a reusable prompt?',
        'How do prompt variables work?',
        'Can I share a prompt with others?',
      ],
    },
  ],
  [
    /^\/settings\/integrations/,
    {
      title: 'Connecting integrations?',
      suggestions: [
        'What is an MCP integration?',
        'How do I connect an MCP server?',
        'How do I use MCP tools in a chat?',
      ],
    },
  ],
  [
    /^\/settings\/memory/,
    {
      title: 'Questions about memory?',
      suggestions: [
        'What are the four memory layers?',
        'How do I turn memory off?',
        'Can I import memory from another assistant?',
      ],
    },
  ],
  [
    /^\/settings/,
    {
      title: 'Changing your settings?',
      suggestions: [
        'Where do I add my own API keys?',
        'How do I change my default model?',
      ],
    },
  ],
]

const DEFAULT_INTRO: AssistantPageIntro = {
  title: 'How can I help?',
  suggestions: [
    'What can DARE do?',
    'Where should I start?',
    'Which model should I use?',
  ],
}

export const assistantIntroFor = (pathname: string): AssistantPageIntro =>
  PAGE_INTROS.find(([pattern]) => pattern.test(pathname))?.[1] ?? DEFAULT_INTRO

const TOOL_STEPS: Record<string, { running: string; done: string }> = {
  search_platform_docs: {
    running: 'Searching the DARE docs',
    done: 'Searched the DARE docs',
  },
  get_account_overview: {
    running: 'Checking your account',
    done: 'Checked your account',
  },
  list_my_files: { running: 'Checking your files', done: 'Checked your files' },
  get_conversation: {
    running: 'Looking at this chat',
    done: 'Looked at this chat',
  },
  get_project: {
    running: 'Looking at this project',
    done: 'Looked at this project',
  },
  list_my_projects: {
    running: 'Checking your projects',
    done: 'Checked your projects',
  },
  list_my_conversations: {
    running: 'Checking your chats',
    done: 'Checked your chats',
  },
  propose_changes: {
    running: 'Drafting the changes',
    done: 'Drafted the changes',
  },
  start_page_tour: {
    running: 'Getting the tour ready',
    done: 'Opened the page tour',
  },
}

/** One-line description of a tool step, e.g. `Searched the DARE docs for "x"`. */
export function describeToolStep(
  name: string,
  args: Record<string, unknown>,
  running: boolean
): string {
  const step = TOOL_STEPS[name]
  const base = step ? (running ? step.running : step.done) : 'Using a tool'
  const query = typeof args.query === 'string' ? args.query : null
  return query ? `${base} for “${query}”` : base
}

const ACTION_TITLES: Record<ProposalActionType, (name: string) => string> = {
  [ProposalActionType.ADD_TO_FOLDER]: (name) => `Add to folder “${name}”`,
  [ProposalActionType.REMOVE_FROM_FOLDER]: (name) =>
    `Remove from folder “${name}”`,
  [ProposalActionType.ADD_TAG]: (name) => `Tag with “${name}”`,
  [ProposalActionType.REMOVE_TAG]: (name) => `Remove tag “${name}”`,
  [ProposalActionType.DELETE_FILES]: () => 'Delete files',
  [ProposalActionType.CREATE_PROJECT]: (name) => `Create project “${name}”`,
  [ProposalActionType.ADD_TO_PROJECT]: (name) => `Add to project “${name}”`,
  [ProposalActionType.REMOVE_FROM_PROJECT]: (name) =>
    `Remove from project “${name}”`,
  [ProposalActionType.DELETE_PROJECT]: (name) => `Delete project “${name}”`,
  [ProposalActionType.DELETE_CONVERSATIONS]: () => 'Delete chats',
}

export const proposalActionTitle = (type: ProposalActionType, name: string) =>
  ACTION_TITLES[type](name)

export const isDeleteAction = (type: ProposalActionType) =>
  type === ProposalActionType.DELETE_FILES ||
  type === ProposalActionType.DELETE_PROJECT ||
  type === ProposalActionType.DELETE_CONVERSATIONS
