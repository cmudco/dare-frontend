import { CodeBlock } from 'streamdown'
import type { CustomRenderer, CustomRendererProps } from 'streamdown'
import { Markdown } from '@/components/Markdown/Markdown'
import ChatArtifactCard from './ChatArtifactCard'

// Hermes emits artifacts as fenced blocks: raw SVG/HTML/Excalidraw payloads
// become a compact artifact card; everything else uses DARE's chat renderer.
const ArtifactFence = ({
  language,
  code,
  isIncomplete,
}: CustomRendererProps) => {
  if (language === 'svg' || language === 'html') {
    return <ChatArtifactCard type={language} content={code} />
  }
  if (!isIncomplete && code.includes('"excalidraw"')) {
    return <ChatArtifactCard type='excalidraw' content={code} />
  }
  return (
    <CodeBlock code={code} language={language} isIncomplete={isIncomplete} />
  )
}

const ARTIFACT_RENDERERS: CustomRenderer[] = [
  { language: ['svg', 'html', 'json'], component: ArtifactFence },
]

const ChatMarkdown = ({ content }: { content: string }) => (
  <div className='prose prose-sm max-w-none wrap-break-word dark:prose-invert'>
    <Markdown content={content} renderers={ARTIFACT_RENDERERS} />
  </div>
)

export default ChatMarkdown
