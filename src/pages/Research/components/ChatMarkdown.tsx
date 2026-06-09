import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'
import ChatArtifactCard from './ChatArtifactCard'

// Renders an agent reply as markdown, reusing DARE's chat renderers so the
// artifacts Hermes emits as fenced blocks come alive: ```mermaid -> a rendered
// diagram, raw SVG/HTML/Excalidraw payloads -> a compact artifact card,
// other languages -> highlighted code, plus tables/links/raw HTML.
const ChatMarkdown = ({ content }: { content: string }) => (
  <div className='prose prose-sm max-w-none break-words dark:prose-invert'>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const lang = match?.[1]
          if (lang === 'mermaid') {
            return <MermaidBlock code={String(children).trim()} />
          }
          const text = String(children).trim()
          if (
            lang === 'svg' ||
            lang === 'html' ||
            (lang === 'json' && text.includes('"excalidraw"'))
          ) {
            return (
              <ChatArtifactCard
                type={lang === 'json' ? 'excalidraw' : lang}
                content={text}
              />
            )
          }
          if (match) {
            return (
              <CodeBlock className={className} props={props}>
                {children}
              </CodeBlock>
            )
          }
          return (
            <code
              className='not-prose break-all rounded border border-border bg-muted px-1 text-foreground'
              {...props}
            >
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
)

export default ChatMarkdown
