import { ToolCallStatus } from '@/utils/constants/dareTools'

export interface ToolPresentation {
  title: string
  pendingLabel: string
  executingLabel: string
}

const humanizeIdentifier = (value: string): string => {
  const normalized = value
    .replace(/^mcp__[^_]+__/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return 'Tool'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const getToolPresentation = (toolName: string): ToolPresentation => {
  const normalized = toolName.toLowerCase()

  if (normalized.includes('search_documents')) {
    return {
      title: 'Source search',
      pendingLabel: 'Preparing a source search',
      executingLabel: 'Searching your selected sources',
    }
  }
  if (normalized.includes('web_search')) {
    return {
      title: 'Web search',
      pendingLabel: 'Preparing a web search',
      executingLabel: 'Searching the web',
    }
  }
  if (
    normalized.includes('web_fetch') ||
    normalized.includes('url_context') ||
    normalized.includes('fetch_url')
  ) {
    return {
      title: 'Web page',
      pendingLabel: 'Preparing to read a webpage',
      executingLabel: 'Reading a webpage',
    }
  }
  if (
    normalized.includes('create_doc') ||
    normalized.includes('render_document') ||
    normalized.includes('render_quill')
  ) {
    return {
      title: 'Document',
      pendingLabel: 'Preparing a document',
      executingLabel: 'Creating your document',
    }
  }
  if (
    normalized.includes('create_ppt') ||
    normalized.includes('presentation')
  ) {
    return {
      title: 'Presentation',
      pendingLabel: 'Preparing a presentation',
      executingLabel: 'Creating your presentation',
    }
  }
  if (normalized.includes('chart')) {
    return {
      title: 'Chart',
      pendingLabel: 'Preparing a chart',
      executingLabel: 'Building your chart',
    }
  }
  if (normalized.includes('diagram') || normalized.includes('mermaid')) {
    return {
      title: 'Diagram',
      pendingLabel: 'Preparing a diagram',
      executingLabel: 'Drawing your diagram',
    }
  }
  if (normalized.includes('image')) {
    return {
      title: 'Image',
      pendingLabel: 'Preparing an image',
      executingLabel: 'Generating your image',
    }
  }

  const title = humanizeIdentifier(toolName)
  return {
    title,
    pendingLabel: `Preparing ${title.toLowerCase()}`,
    executingLabel: `Using ${title.toLowerCase()}`,
  }
}

export const getToolStatusLabel = (status: ToolCallStatus): string => {
  switch (status) {
    case ToolCallStatus.PENDING:
      return 'Preparing'
    case ToolCallStatus.EXECUTING:
      return 'Running'
    case ToolCallStatus.COMPLETED:
      return 'Complete'
    case ToolCallStatus.FAILED:
      return 'Needs attention'
  }
}

export const getToolSourceLabel = (serverSlug: string): string => {
  if (!serverSlug || serverSlug === 'dare') return 'DARE'
  if (serverSlug === 'anthropic') return 'Anthropic'
  if (serverSlug === 'gemini') return 'Gemini'
  return humanizeIdentifier(serverSlug)
}
