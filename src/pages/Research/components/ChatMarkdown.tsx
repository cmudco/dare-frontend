import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'

// Renders an agent reply as markdown, reusing DARE's chat renderers so the
// artifacts Hermes emits as fenced blocks come alive: ```mermaid -> a rendered
// diagram, other languages -> highlighted code, plus tables/links/raw HTML.
const ChatMarkdown = ({ content }: { content: string }) => (
  <div className='prose prose-sm max-w-none break-words dark:prose-invert'>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (match && match[1] === 'mermaid') {
            return <MermaidBlock code={String(children).trim()} />
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
